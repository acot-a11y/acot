import type { DocCode } from '../doc-code';

export const createDocCode = (partial: Partial<DocCode> = {}): DocCode => ({
  path: '',
  rule: '',
  type: 'correct',
  id: '',
  meta: {},
  html: '',
  ...partial,
});
