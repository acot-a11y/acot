import type { Page, ElementHandle } from 'puppeteer-core';
import type { Schema } from './schema';

export type ReportType = 'error' | 'warn' | 'off';

export type ReportDescriptor = {
  message: string;
  tags?: string[];
  node?: ElementHandle;
};

export type RuleContext<T = RuleOptions> = {
  page: Page;
  report: (descriptor: ReportDescriptor) => Promise<void>;
  debug: (format?: any, ...args: any[]) => void;
  options: T;
};

export type RuleMeta = {
  tags?: string[];
  recommended?: boolean;
  [key: string]: any;
};

export type RuleBase<T extends RuleType> = {
  type: T;
  schema?: Schema;
  meta?: RuleMeta;
};

export type GlobalRule<T> = RuleBase<'global'> & {
  test: (context: RuleContext<T>) => Promise<void>;
};

export type ContextualRule<T> = RuleBase<'contextual'> & {
  root?: string;
  selector: string;
  test: (context: RuleContext<T>, node: ElementHandle) => Promise<void>;
};

export type RuleId = string;
export type RuleType = Rule['type'];
export type Rule<T = unknown> = GlobalRule<T> | ContextualRule<T>;
export type RuleOptions = Record<string, any>;
export type RuleMap = Map<RuleId, Rule<any>>;
export type RuleRecord = Record<RuleId, Rule<any>>;
