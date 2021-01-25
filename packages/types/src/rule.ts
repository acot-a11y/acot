import type { Page, ElementHandle } from 'puppeteer-core';
import type { Schema } from './schema';

export type ReportType = 'error' | 'warn' | 'off';

export type ReportDescriptor = {
  message: string;
  help?: string;
  node?: ElementHandle;
};

export type RuleContext<T extends RuleOptions = RuleOptions> = {
  page: Page;
  report: (descriptor: ReportDescriptor) => Promise<void>;
  debug: (format?: any, ...args: any[]) => void;
  options: T;
};

export type RuleMeta = {
  help?: string;
  recommended?: boolean;
  [key: string]: any;
};

export type Rule<T extends RuleOptions = RuleOptions> = {
  schema?: Schema;
  immutable?: boolean;
  meta?: RuleMeta;
  test: (context: RuleContext<T>) => Promise<void>;
};

export type RuleId = string;
export type RuleOptions = Record<string, any>;
export type RuleMap = Map<RuleId, Rule>;
export type RuleRecord = Record<RuleId, Rule>;
