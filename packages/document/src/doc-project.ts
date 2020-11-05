import type { Preset } from '@acot/types';
import type { DocCode } from './doc-code';

export type DocProject = {
  root: string;
  name: string;
  main: string;
  preset: Preset;
  codes: DocCode[];
};
