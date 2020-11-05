import type { RuleMap, RuleRecord } from './rule';
import type { Config } from './config';

export type PresetId = string;

export type PresetModule = {
  rules?: RuleRecord;
  configs?: Record<string, Config>;
};

export type Preset = {
  id: PresetId;
  rules: RuleMap;
  configs: Map<string, Config>;
};
