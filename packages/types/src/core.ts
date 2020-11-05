import type { Summary } from './summary';
import type { NormalizedRuleConfig } from './config';
import type { Preset } from './preset';
import type { EventMethodFactory } from './event';
import type { TestResult } from './result';

export type TestDescriptor = {
  headers?: Record<string, string>;
  presets?: Preset[];
  rules: NormalizedRuleConfig;
};

export type CoreEventMap = {
  'launch:start': [urls: string[]];
  'launch:complete': [urls: string[]];
  'audit:start': [];
  'audit:complete': [summary: Summary];
  'test:start': [url: string, ids: string[]];
  'test:complete': [url: string, ids: string[], result: TestResult];
  'terminate:start': [];
  'terminate:complete': [];
};

export type Core = {
  readonly version: string;
  add: (path: string, descriptor: TestDescriptor) => void;
  audit: () => Promise<Summary>;
} & EventMethodFactory<CoreEventMap>;
