import type { DocFile } from '../doc-file';

export const createDocFile = (partial: Partial<DocFile> = {}): DocFile => ({
  path: '',
  content: '',
  ...partial,
});
