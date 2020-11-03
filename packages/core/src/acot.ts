import fs from 'fs';
import path from 'path';
import type {
  Core,
  CoreEventMap,
  EventListener,
  Plugin,
  Summary,
  TestDescriptor,
  TestResult,
} from '@acot/types';
import Emittery from 'emittery';
import _ from 'lodash';
import type AllSettled from 'promise.allsettled';
import type { LaunchOptions, Viewport } from 'puppeteer-core';
import { BrowserPool } from './browser-pool';
import { debug } from './logging';
import { RuleStore } from './rule-store';
import { Tester } from './tester';
import { TimingTracker } from './timing-tracker';
/**
 * This is a workaround for bugs that occur in combination with tsc.
 * @see https://github.com/es-shims/Promise.allSettled/issues/5
 */
const allSettled: typeof AllSettled = require('promise.allsettled') as any;

export type AcotConfig = {
  cwd: string;
  launchOptions: LaunchOptions;
  workingDir: string;
  viewport: Viewport | null;
  origin: string;
  parallel: number;
  plugins: Plugin[];
  browserTimeout: number;
  readyTimeout: number;
};

export class Acot implements Core {
  private _config: AcotConfig;
  private _store: RuleStore;
  private _storeMap: Map<string, RuleStore> = new Map();
  private _testers: Tester[] = [];
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
      plugins: config.plugins ?? [],
      browserTimeout: config.browserTimeout ?? 1000 * 30,
      readyTimeout: config.readyTimeout ?? 1000 * 30,
    };

    this._store = new RuleStore();
    this._store.import(this._config.plugins);
    this._emitter = new Emittery.Typed<CoreEventMap>();
  }

  private _getStore(plugins: Plugin[]): RuleStore {
    if (plugins.length === 0) {
      return this._store;
    }

    const key = plugins.map(({ id }) => id).join('.');
    if (this._storeMap.has(key)) {
      return this._storeMap.get(key)!;
    }

    const store = this._store.extends();
    store.import(plugins);

    this._storeMap.set(key, store);

    return store;
  }

  public add(path: string, descriptor: TestDescriptor): void {
    const { origin, readyTimeout } = this._config;

    const url = [_.trimEnd(origin, '/'), _.trimStart(path, '/')].join('/');
    const store = this._getStore(descriptor.plugins ?? []);

    this._testers.push(
      new Tester({
        ...descriptor,
        workingDir: this._config.workingDir,
        viewport: this._config.viewport,
        readyTimeout,
        url,
        store,
        onTestStart: this._handleTestStart,
        onTestComplete: this._handleTestComplete,
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

    const pool = new BrowserPool({
      launchOptions: this._config.launchOptions,
      timeout: this._config.browserTimeout,
    });

    await pool.bootstrap(this._config.parallel);

    await this._emitter.emit('launch:complete', [urls]);

    // audit
    await this._emitter.emit('audit:start', []);

    const results: TestResult[] = [];

    const context = {
      pool,
      tracker,
    };

    const list = await allSettled(
      this._testers.map(async (tester) => {
        results.push(await tester.test(context));
      }),
    );

    const summary = this._summarize(results, tracker);

    await this._emitter.emit('audit:complete', [summary]);

    // close
    await this._emitter.emit('terminate:start', []);
    await pool.terminate();
    await this._emitter.emit('terminate:complete', []);

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

    debug('time: %O', tracker);

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

  private _handleTestStart = async (...args: CoreEventMap['test:start']) => {
    await this._emitter.emit('test:start', args);
  };

  private _handleTestComplete = async (
    ...args: CoreEventMap['test:complete']
  ) => {
    await this._emitter.emit('test:complete', args);
  };

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
}
