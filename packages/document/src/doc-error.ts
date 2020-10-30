import type { TestcaseResult } from '@acot/types';
import type { DocCode } from './doc-code';

export type DocError = {
  message: string;
  code: DocCode;
  results: TestcaseResult[];
};
