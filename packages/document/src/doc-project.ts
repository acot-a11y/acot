import type { Plugin } from '@acot/types';
import type { DocCode } from './doc-code';

export type DocProject = {
  root: string;
  name: string;
  main: string;
  plugin: Plugin;
  codes: DocCode[];
};
