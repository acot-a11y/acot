import type { TestResult } from './result';
import type { Stat } from './stat';
import type { Timing } from './timing';

export type Summary = Stat & {
  timing: Timing;
  results: TestResult[];
};
