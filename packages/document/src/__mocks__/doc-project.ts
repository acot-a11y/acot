import type { DocProject } from '../doc-project';

export const createDocProject = (
  partial: Partial<DocProject> = {},
): DocProject => ({
  root: '',
  name: '',
  main: '',
  plugin: {
    id: '',
    rules: new Map(),
    configs: new Map(),
  },
  codes: [],
  ...partial,
});
