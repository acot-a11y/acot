import type { Summary } from './summary';
import type { NormalizedRuleConfig } from './config';
import type { Preset } from './preset';
import type { EventMethodFactory } from './event';
import type { TestcaseResult, TestResult } from './result';
import type { RuleId } from './rule';

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
  'test:start': [url: string, ids: RuleId[]];
  'test:complete': [url: string, ids: RuleId[], result: TestResult];
  'testcase:start': [url: string, id: RuleId];
  'testcase:complete': [url: string, id: RuleId, results: TestcaseResult[]];
  'close:start': [];
  'close:complete': [];
};

export type Core = {
  readonly version: string;
  add: (path: string, descriptor: TestDescriptor) => void;
  audit: () => Promise<Summary>;
  close: () => Promise<void>;
} & EventMethodFactory<CoreEventMap>;
