import type { DocProject } from '../doc-project';

export const createDocProject = (
  partial: Partial<DocProject> = {},
): DocProject => ({
  root: '',
  name: '',
  main: '',
  preset: {
    id: '',
    rules: new Map(),
    configs: new Map(),
  },
  codes: [],
  ...partial,
});
