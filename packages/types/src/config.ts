import type { ChromeChannel } from '@acot/find-chrome';
import type { LaunchOptions, Viewport } from 'puppeteer-core';
import type { Merge } from 'type-fest';
import type { Preset } from './preset';
import type { ReporterFactory } from './reporter';
import type { ReportType, RuleId, RuleOptions } from './rule';
import type { RunnerFactory } from './runner';

type MergeUses<T, U> = Merge<T, { uses: U }>;

type UsesWith<T> = MergeUses<
  {
    with?: T;
  },
  string
>;

// rule
export type RuleConfig = Record<string, ReportType | [ReportType, RuleOptions]>;

export type NormalizedRuleConfig = Record<
  RuleId,
  [ReportType, RuleOptions | null]
>;

// connection
export type ConnectionOptions = {
  command?: string;
  timeout?: number;
};

// runner
export type RunnerOptions = Record<string, any>;
export type RunnerUses = UsesWith<RunnerOptions>;
export type ResolvedRunnerUses = Merge<
  RunnerUses,
  {
    uses: RunnerFactory;
  }
>;

// reporter
export type ReporterOptions = Record<string, any>;
export type ReporterUses = UsesWith<ReporterOptions>;
export type ResolvedReporterUses = Merge<
  ReporterUses,
  {
    uses: ReporterFactory;
  }
>;

// config
type BaseConfig = {
  extends?: string[];
  presets?: string[];
  headers?: Record<string, string>;
  paths?: string[];
  rules?: RuleConfig;
};

export type ConfigEntry = BaseConfig & {
  include?: string[];
  exclude?: string[];
};

export type Config = BaseConfig & {
  origin?: string;
  connection?: ConnectionOptions;
  runner?: string | RunnerUses;
  reporter?: string | ReporterUses;
  chromeChannel?: ChromeChannel;
  launchOptions?: LaunchOptions;
  viewport?: Viewport | string;
  workingDir?: string;
  overrides?: ConfigEntry[];
};

export type ResolvedConfigEntry = Merge<
  ConfigEntry,
  {
    rules: NormalizedRuleConfig;
    presets?: Preset[];
  }
>;

export type ResolvedConfig = Merge<
  Config,
  {
    runner?: ResolvedRunnerUses;
    reporter?: ResolvedReporterUses;
    rules: NormalizedRuleConfig; // FIXME Delays normalization to the execution phase (because of poor usability as an API)
    presets?: Preset[];
    overrides?: ResolvedConfigEntry[];
    viewport?: Viewport;
  }
>;
