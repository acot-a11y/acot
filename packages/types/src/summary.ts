import type { RuleResult, TestResult } from './result';
import type { Stat } from './stat';

export type Summary = Stat & {
  rules: RuleResult;
  results: TestResult[];
};
