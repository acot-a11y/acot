import type { DocError } from '../doc-error';
import { createDocCode } from './doc-code';

export const createDocError = (partial: Partial<DocError> = {}): DocError => ({
  message: '',
  code: createDocCode(),
  results: [],
  ...partial,
});
