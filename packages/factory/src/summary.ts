import type { Summary } from '@acot/types';
import type { PartialDeep } from 'type-fest';
import { merge } from './merge';
import { createStat } from './stat';

export const createSummary = (values: PartialDeep<Summary> = {}): Summary =>
  merge<Summary>(
    {
      ...createStat(),
      timing: {},
      results: [],
    },
    values,
  );
