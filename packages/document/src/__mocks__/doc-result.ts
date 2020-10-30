import type { DocResult } from '../doc-result';

export const createDocResult = (
  partial: Partial<DocResult> = {},
): DocResult => ({
  skips: [],
  passes: [],
  errors: [],
  ...partial,
});
