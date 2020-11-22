import type {
  Core,
  EventListener,
  ResolvedConfig,
  Runner,
  RunnerEventMap,
  RunnerVersion,
  Summary,
} from '@acot/types';
import { Connection } from '@acot/connection';
import Emittery from 'emittery';
import type { Pipeline, RunAuditResult, RunCollectResult } from './pipeline';
const debug = require('debug')('acot:runner');

export type BaseRunnerConfig = {
  name: string;
  core: Core;
  config: ResolvedConfig;
  pipeline: Partial<Pipeline>;
};

export class BaseRunner implements Runner {
  private _core: Core;
  private _config: ResolvedConfig;
  private _pipeline: Partial<Pipeline>;
  private _conn: Connection | null = null;
  private _emitter: Emittery.Typed<RunnerEventMap>;
  public readonly name: string;
  public readonly version: RunnerVersion;

  public constructor({ name, core, config, pipeline }: BaseRunnerConfig) {
    this._core = core;
    this._config = config;
    this._pipeline = pipeline;
    this._emitter = new Emittery.Typed<RunnerEventMap>();
    this._bindEvents();
    this.name = name;
    this.version = {
      self: require('../package.json').version,
      core: this._core.version,
    };

    process.on('SIGINT', this._handleSIGINT);
    process.on('SIGTERM', this._handleCloseSignal);
    process.on('SIGINT', this._handleCloseSignal);
  }

  public destroy(): void {
    this._unbindEvents();
    this._emitter.clearListeners();
  }

  public async run(): Promise<Summary> {
    await this._setup();
    await this._connect();
    await this._collect();

    let summary: Summary;
    let error: any | null = null;
    try {
      summary = await this._audit();
    } catch (e) {
      error = e;
    } finally {
      await this._cleanup();
    }

    if (error != null) {
      throw error;
    }

    return summary!;
  }

  private async _setup(): Promise<void> {
    const { setup } = this._pipeline;

    await this._emitter.emit('setup:start', []);

    if (setup != null) {
      await setup();
    }

    await this._emitter.emit('setup:complete', []);
  }

  private async _connect(): Promise<void> {
    const { origin, connection } = this._config;

    await this._emitter.emit('connect:start', []);

    this._conn = new Connection(origin!, {
      timeout: connection?.timeout,
      command: connection?.command,
    });

    try {
      await this._conn.connect();
    } catch (e) {
      debug('Connection failed!');
      this._conn.disconnect();
      this._conn = null;
      throw e;
    }

    await this._emitter.emit('connect:complete', []);
  }

  private async _collect(): Promise<void> {
    const { collect } = this._pipeline;

    await this._emitter.emit('collect:start', []);

    let results: RunCollectResult = [];

    if (collect != null) {
      results = await collect();
      results.forEach(([path, descriptor]) => {
        this._core.add(path, descriptor);
      });
    }

    await this._emitter.emit('collect:complete', [results]);
  }

  private async _audit(): Promise<RunAuditResult> {
    const { audit } = this._pipeline;

    return await (audit != null ? audit() : this._core.audit());
  }

  private async _cleanup(): Promise<void> {
    const { cleanup } = this._pipeline;

    await this._emitter.emit('cleanup:start', []);

    this._conn?.disconnect();
    this._conn = null;

    if (cleanup != null) {
      await cleanup();
    }

    await this._emitter.emit('cleanup:complete', []);
  }

  private _bindEvents() {
    this._core.on('launch:start', this._handleLaunchStart);
    this._core.on('launch:complete', this._handleLaunchComplete);
    this._core.on('audit:start', this._handleAuditStart);
    this._core.on('audit:complete', this._handleAuditComplete);
    this._core.on('test:start', this._handleTestStart);
    this._core.on('test:complete', this._handleTestComplete);
    this._core.on('close:start', this._handleCloseStart);
    this._core.on('close:complete', this._handleCloseComplete);
  }

  private _unbindEvents() {
    this._core.on('launch:start', this._handleLaunchStart);
    this._core.on('launch:complete', this._handleLaunchComplete);
    this._core.on('audit:start', this._handleAuditStart);
    this._core.on('audit:complete', this._handleAuditComplete);
    this._core.on('test:start', this._handleTestStart);
    this._core.on('test:complete', this._handleTestComplete);
    this._core.on('close:start', this._handleCloseStart);
    this._core.on('close:complete', this._handleCloseComplete);
  }

  private async _close(): Promise<void> {
    await Promise.allSettled([this._core?.close(), this._conn?.disconnect()]);
  }

  private _handleSIGINT = async () => {
    await this._close();
    process.exit(130);
  };

  private _handleCloseSignal = async () => {
    await this._close();
  };

  private _handleLaunchStart = async (args: RunnerEventMap['launch:start']) => {
    await this._emitter.emit('launch:start', args);
  };

  private _handleLaunchComplete = async (
    args: RunnerEventMap['launch:complete'],
  ) => {
    await this._emitter.emit('launch:complete', args);
  };

  private _handleAuditStart = async (args: RunnerEventMap['audit:start']) => {
    await this._emitter.emit('audit:start', args);
  };

  private _handleAuditComplete = async (
    args: RunnerEventMap['audit:complete'],
  ) => {
    await this._emitter.emit('audit:complete', args);
  };

  private _handleTestStart = async (args: RunnerEventMap['test:start']) => {
    await this._emitter.emit('test:start', args);
  };

  private _handleTestComplete = async (
    args: RunnerEventMap['test:complete'],
  ) => {
    await this._emitter.emit('test:complete', args);
  };

  private _handleCloseStart = async (args: RunnerEventMap['close:start']) => {
    await this._emitter.emit('close:start', args);
  };

  private _handleCloseComplete = async (
    args: RunnerEventMap['close:complete'],
  ) => {
    await this._emitter.emit('close:complete', args);
  };

  public on<T extends keyof RunnerEventMap>(
    eventName: T,
    listener: EventListener<RunnerEventMap, T>,
  ): void {
    this._emitter.on(eventName as any, listener as any);
  }

  public off<T extends keyof RunnerEventMap>(
    eventName: T,
    listener?: EventListener<RunnerEventMap, T>,
  ): void {
    this._emitter.off(eventName as any, listener as any);
  }
}
