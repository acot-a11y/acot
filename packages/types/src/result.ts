import type { SetOptional } from 'type-fest';
import type { RuleId, ReportType } from './rule';
import type { Stat } from './stat';

export type Status = Exclude<ReportType, 'off'> | 'pass';

export type BaseTestcaseResult = {
  process: number;
  rule: RuleId;
  message: string;
  tags: string[];
  selector: string | null;
  htmlpath: string | null;
  imagepath: string | null;
};

export type FailureTestcaseResult = BaseTestcaseResult & {
  status: Extract<Status, 'error' | 'warn'>;
};

export type PassTestcaseResult = SetOptional<
  BaseTestcaseResult,
  'message' | 'selector' | 'htmlpath' | 'imagepath'
> & {
  status: Extract<Status, 'pass'>;
};

export type TestcaseResult = FailureTestcaseResult | PassTestcaseResult;

export type TestResult = Stat & {
  url: string;
  results: TestcaseResult[];
};
