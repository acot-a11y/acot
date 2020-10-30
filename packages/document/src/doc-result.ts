import type { DocError } from './doc-error';
import type { DocCode } from './doc-code';

export type DocResult = {
  skips: DocCode[];
  passes: DocCode[];
  errors: DocError[];
};
