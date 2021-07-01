import type {
  ResolvedConfig,
  Runner,
  RunnerEventMap,
  RunnerFactoryConfig,
  RunnerOptions,
  RunnerVersion,
  EventListener,
  Core,
  Summary,
  TestDescriptor,
} from '@acot/types';
import { Connection } from '@acot/connection';
import { ConfigRouter } from '@acot/config';
import Emittery from 'emittery';
import { createRunnerFactory } from '@acot/runner';
const debug = require('debug')('acot:acot-runner');

export type AcotRunnerConfig<
  T extends RunnerOptions = {}
> = RunnerFactoryConfig<T> & {
  name: string;
  version: string;
};

export type AcotRunnerSetupResult = Promise<void>;
export type AcotRunnerConnectResult = Promise<void>;
export type AcotRunnerDisconnectResult = Promise<void>;
export type AcotRunnerCollectResult = Promise<Map<string, TestDescriptor>>;
export type AcotRunnerAuditResult = Promise<Summary>;
export type AcotRunnerCleanupResult = Promise<void>;

export class AcotRunner<T extends RunnerOptions = {}> implements Runner {
  protected core: Core;
  protected config: ResolvedConfig;
  protected options: T;
  protected conn: Connection | null = null;
  protected emitter: Emittery.Typed<RunnerEventMap>;
  public name: string;
  public version: RunnerVersion;

  public constructor({
    core,
    config,
    options,
    name,
    version,
  }: AcotRunnerConfig<T>) {
    this.name = name;
    this.version = {
      self: version,
      core: core.version,
    };

    this.core = core;
    this.config = config;
    this.options = options;
    this.emitter = new Emittery.Typed<RunnerEventMap>();

    this._bindEvents();
  }

  public async run(): Promise<Summary> {
    await this._setup();
    await this._connect();
    await this._collect();

    const summary = await this.audit();

    await this._cleanup();

    return summary;
  }

  private async _setup() {
    await this.emitter.emit('setup:start', []);
    await this.setup();
    await this.emitter.emit('setup:complete', []);
  }

  protected async setup(): AcotRunnerSetupResult {
    process.on('SIGINT', this.handleSIGINT);
    process.on('SIGTERM', this.handleCloseSignal);
    process.on('SIGINT', this.handleCloseSignal);
  }

  private async _connect() {
    await this.emitter.emit('connect:start', []);
    await this.connect();
    await this.emitter.emit('connect:complete', []);
  }

  protected async connect(): AcotRunnerConnectResult {
    const { origin, paths, connection } = this.config;
    const url =
      paths != null && paths.length > 0 ? `${origin}${paths[0]}` : origin!;

    this.conn = new Connection(url, {
      timeout: connection?.timeout,
      command: connection?.command,
    });

    try {
      await this.conn.connect();
    } catch (e) {
      debug('Connection failed!');
      this.disconnect();
      throw e;
    }
  }

  protected async disconnect(): AcotRunnerDisconnectResult {
    this.conn?.disconnect();
  }

  private async _collect() {
    await this.emitter.emit('collect:start', []);
    const sources = await this.collect();
    await this.emitter.emit('collect:complete', [sources]);

    for (const [path, descriptor] of sources.entries()) {
      this.core.add(path, descriptor);
    }
  }

  protected async collect(): AcotRunnerCollectResult {
    const router = new ConfigRouter(this.config);
    const sources = new Map();

    this.config.paths?.forEach((p) => {
      const entry = router.resolve(p);

      sources.set(p, {
        rules: entry.rules,
        presets: entry.presets,
        headers: entry.headers,
      });
    });

    return sources;
  }

  protected async audit(): AcotRunnerAuditResult {
    return await this.core.audit();
  }

  private async _cleanup() {
    await this.emitter.emit('cleanup:start', []);
    await this.cleanup();
    await this.emitter.emit('cleanup:complete', []);
  }

  protected async cleanup(): AcotRunnerCleanupResult {
    // ...
  }

  protected destroy(): void {
    this._unbindEvents();
    this.emitter.clearListeners();
  }

  private _bindEvents() {
    this.core.on('launch:start', this.handleLaunchStart);
    this.core.on('launch:complete', this.handleLaunchComplete);
    this.core.on('audit:start', this.handleAuditStart);
    this.core.on('audit:complete', this.handleAuditComplete);
    this.core.on('test:start', this.handleTestStart);
    this.core.on('test:complete', this.handleTestComplete);
    this.core.on('testcase:start', this.handleTestcaseStart);
    this.core.on('testcase:complete', this.handleTestcaseComplete);
    this.core.on('close:start', this.handleCloseStart);
    this.core.on('close:complete', this.handleCloseComplete);
  }

  private _unbindEvents() {
    this.core.off('launch:start', this.handleLaunchStart);
    this.core.off('launch:complete', this.handleLaunchComplete);
    this.core.off('audit:start', this.handleAuditStart);
    this.core.off('audit:complete', this.handleAuditComplete);
    this.core.off('test:start', this.handleTestStart);
    this.core.off('test:complete', this.handleTestComplete);
    this.core.off('testcase:start', this.handleTestcaseStart);
    this.core.off('testcase:complete', this.handleTestcaseComplete);
    this.core.off('close:start', this.handleCloseStart);
    this.core.off('close:complete', this.handleCloseComplete);
  }

  protected async close(): Promise<void> {
    try {
      await this.core.close();
    } catch (e) {
      debug(e);
    }

    this.disconnect();
  }

  protected handleSIGINT = async (): Promise<void> => {
    await this.close();
    process.exit(130);
  };

  protected handleCloseSignal = async (): Promise<void> => {
    await this.close();
  };

  protected handleLaunchStart = async (
    args: RunnerEventMap['launch:start'],
  ): Promise<void> => {
    await this.emitter.emit('launch:start', args);
  };

  protected handleLaunchComplete = async (
    args: RunnerEventMap['launch:complete'],
  ): Promise<void> => {
    await this.emitter.emit('launch:complete', args);
  };

  protected handleAuditStart = async (
    args: RunnerEventMap['audit:start'],
  ): Promise<void> => {
    await this.emitter.emit('audit:start', args);
  };

  protected handleAuditComplete = async (
    args: RunnerEventMap['audit:complete'],
  ): Promise<void> => {
    await this.emitter.emit('audit:complete', args);
  };

  protected handleTestStart = async (
    args: RunnerEventMap['test:start'],
  ): Promise<void> => {
    await this.emitter.emit('test:start', args);
  };

  protected handleTestComplete = async (
    args: RunnerEventMap['test:complete'],
  ): Promise<void> => {
    await this.emitter.emit('test:complete', args);
  };

  protected handleTestcaseStart = async (
    args: RunnerEventMap['testcase:start'],
  ): Promise<void> => {
    await this.emitter.emit('testcase:start', args);
  };

  protected handleTestcaseComplete = async (
    args: RunnerEventMap['testcase:complete'],
  ): Promise<void> => {
    await this.emitter.emit('testcase:complete', args);
  };

  protected handleCloseStart = async (
    args: RunnerEventMap['close:start'],
  ): Promise<void> => {
    await this.emitter.emit('close:start', args);
  };

  protected handleCloseComplete = async (
    args: RunnerEventMap['close:complete'],
  ): Promise<void> => {
    await this.emitter.emit('close:complete', args);
  };

  public on<T extends keyof RunnerEventMap>(
    eventName: T,
    listener: EventListener<RunnerEventMap, T>,
  ): void {
    this.emitter.on(eventName as any, listener as any);
  }

  public off<T extends keyof RunnerEventMap>(
    eventName: T,
    listener?: EventListener<RunnerEventMap, T>,
  ): void {
    this.emitter.off(eventName as any, listener as any);
  }
}

export default createRunnerFactory(
  (config) =>
    new AcotRunner({
      ...config,
      name: 'default',
      version: require('../package.json').version,
    }),
);
