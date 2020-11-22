import type { ResolvedConfig, RunnerOptions } from './config';
import type { Core, CoreEventMap, TestDescriptor } from './core';
import type { EventMethodFactory } from './event';
import type { Summary } from './summary';

export type RunnerEventMap = {
  'setup:start': [];
  'setup:complete': [];
  'connect:start': [];
  'connect:complete': [];
  'collect:start': [];
  'collect:complete': [[path: string, descriptor: TestDescriptor][]];
  'launch:start': CoreEventMap['launch:start'];
  'launch:complete': CoreEventMap['launch:complete'];
  'audit:start': CoreEventMap['audit:start'];
  'audit:complete': CoreEventMap['audit:complete'];
  'test:start': CoreEventMap['test:start'];
  'test:complete': CoreEventMap['test:complete'];
  'close:start': CoreEventMap['close:start'];
  'close:complete': CoreEventMap['close:complete'];
  'cleanup:start': [];
  'cleanup:complete': [];
};

export type RunnerVersion = {
  readonly self: string;
  readonly core: string;
};

export type Runner = {
  readonly version: RunnerVersion;
  readonly name: string;
  run: () => Promise<Summary>;
} & EventMethodFactory<RunnerEventMap>;

export type RunnerFactoryConfig<T extends RunnerOptions = {}> = {
  core: Core;
  config: ResolvedConfig;
  options: T;
};

export type RunnerFactory<T extends RunnerOptions = {}> = (
  config: RunnerFactoryConfig<T>,
) => Runner;
