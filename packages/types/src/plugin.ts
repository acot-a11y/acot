import type { RuleMap, RuleRecord } from './rule';
import type { Config } from './config';

export type PluginId = string;

export type PluginModule = {
  rules?: RuleRecord;
  configs?: Record<string, Config>;
};

export type Plugin = {
  id: PluginId;
  rules: RuleMap;
  configs: Map<string, Config>;
};
