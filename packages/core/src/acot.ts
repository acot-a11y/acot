import fs from 'fs';
import path from 'path';
import type {
  Core,
  CoreEventMap,
  EventListener,
  Preset,
  Summary,
  TestDescriptor,
  TestResult,
  LaunchOptions,
} from '@acot/types';
import Emittery from 'emittery';
import _ from 'lodash';
import type { Viewport } from 'puppeteer-core';
import { BrowserPool } from './browser-pool';
import { debug } from './logging';
import { RuleStore } from './rule-store';
import { Tester } from './tester';
import { TimingTracker } from './timing-tracker';

export type AcotConfig = {
  cwd: string;
  launchOptions: LaunchOptions;
  workingDir: string;
  viewport: Viewport | null;
  origin: string;
  parallel: number;
  presets: Preset[];
  browserTimeout: number;
  readyTimeout: number;
};

export class Acot implements Core {
  private _config: AcotConfig;
  private _store: RuleStore;
  private _storeMap: Map<string, RuleStore> = new Map();
  private _testers: Tester[] = [];
  private _pool: BrowserPool | null = null;
  private _emitter: Emittery.Typed<CoreEventMap>;
  public readonly version = require('../package.json').version;

  public constructor(config: Partial<AcotConfig> = {}) {
    const cwd = config.cwd || process.cwd();

    this._config = {
      cwd,
      launchOptions: config.launchOptions ?? {},
      viewport: config.viewport ?? null,
      workingDir: path.resolve(cwd, config.workingDir || '.acot'),
      origin: config.origin ?? '',
      parallel: Math.max(config.parallel ?? 1, 1),
      presets: config.presets ?? [],
      browserTimeout: config.browserTimeout ?? 1000 * 30,
      readyTimeout: config.readyTimeout ?? 1000 * 30,
    };

    this._store = new RuleStore();
    this._store.import(this._config.presets);
    this._emitter = new Emittery.Typed<CoreEventMap>();
  }

  private _getStore(presets: Preset[]): RuleStore {
    if (presets.length === 0) {
      return this._store;
    }

    const key = presets.map(({ id }) => id).join('.');
    if (this._storeMap.has(key)) {
      return this._storeMap.get(key)!;
    }

    const store = this._store.extends();
    store.import(presets);

    this._storeMap.set(key, store);

    return store;
  }

  public add(path: string, descriptor: TestDescriptor): void {
    const { origin, readyTimeout } = this._config;

    const url = [_.trimEnd(origin, '/'), _.trimStart(path, '/')].join('/');
    const store = this._getStore(descriptor.presets ?? []);

    this._testers.push(
      new Tester({
        ...descriptor,
        priority: (this._testers.length + 1) * -1,
        workingDir: this._config.workingDir,
        viewport: this._config.viewport,
        readyTimeout,
        url,
        store,
        onTestStart: this._handleTestStart,
        onTestComplete: this._handleTestComplete,
        onTestcaseStart: this._handleTestcaseStart,
        onTestcaseComplete: this._handleTestcaseComplete,
      }),
    );
  }

  public async audit(): Promise<Summary> {
    const tracker = new TimingTracker();
    const urls = this._testers.map((tester) => tester.url());

    // working directory
    fs.mkdirSync(this._config.workingDir, { recursive: true });

    // launch
    await this._emitter.emit('launch:start', [urls]);

    this._pool = new BrowserPool({
      launchOptions: this._config.launchOptions,
      timeout: this._config.browserTimeout,
    });

    await this._pool.bootstrap(this._config.parallel);

    await this._emitter.emit('launch:complete', [urls]);

    // audit
    await this._emitter.emit('audit:start', []);

    const results: TestResult[] = [];

    const context = {
      pool: this._pool,
      tracker,
    };

    const list = await Promise.allSettled(
      this._testers.map(async (tester) => {
        results.push(await tester.test(context));
      }),
    );

    debug('time: %O', tracker);

    const summary = this._summarize(results, tracker);

    await this._emitter.emit('audit:complete', [summary]);

    // close
    await this.close();

    let error = false;
    for (const item of list) {
      if (item.status === 'rejected') {
        error = true;
        debug(item.reason);
      }
    }

    if (error) {
      throw new Error(
        'An error occurred during audit. Please see the debug information for details.',
      );
    }

    fs.writeFileSync(
      path.join(this._config.workingDir, 'manifest.json'),
      JSON.stringify(summary),
      'utf8',
    );

    return summary;
  }

  private _summarize(results: TestResult[], tracker: TimingTracker): Summary {
    const stat = results.reduce(
      (acc, cur) => ({
        passCount: acc.passCount + cur.passCount,
        errorCount: acc.errorCount + cur.errorCount,
        warningCount: acc.warningCount + cur.warningCount,
      }),
      {
        passCount: 0,
        errorCount: 0,
        warningCount: 0,
      },
    );

    return {
      timing: tracker.flush(),
      results: _.orderBy(results, [(res) => res.url], ['asc']),
      ...stat,
    };
  }

  public async close(): Promise<void> {
    if (this._pool == null) {
      return;
    }

    await this._emitter.emit('close:start', []);
    await this._pool.terminate();
    await this._emitter.emit('close:complete', []);

    this._pool = null;
    this._testers = [];
    this._emitter.clearListeners();
  }

  public on<T extends keyof CoreEventMap>(
    eventName: T,
    listener: EventListener<CoreEventMap, T>,
  ): void {
    this._emitter.on(eventName as any, listener as any);
  }

  public off<T extends keyof CoreEventMap>(
    eventName: T,
    listener?: EventListener<CoreEventMap, T>,
  ): void {
    this._emitter.off(eventName as any, listener as any);
  }

  private _handleTestStart = async (...args: CoreEventMap['test:start']) => {
    await this._emitter.emit('test:start', args);
  };

  private _handleTestComplete = async (
    ...args: CoreEventMap['test:complete']
  ) => {
    await this._emitter.emit('test:complete', args);
  };

  private _handleTestcaseStart = async (
    ...args: CoreEventMap['testcase:start']
  ) => {
    await this._emitter.emit('testcase:start', args);
  };

  private _handleTestcaseComplete = async (
    ...args: CoreEventMap['testcase:complete']
  ) => {
    await this._emitter.emit('testcase:complete', args);
  };
}
