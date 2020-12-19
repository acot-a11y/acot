import type { Stat } from '@acot/types';
import type { PartialDeep } from 'type-fest';
import { merge } from './merge';

export const createStat = (values: PartialDeep<Stat> = {}): Stat =>
  merge<Stat>(
    {
      duration: 0,
      passCount: 0,
      errorCount: 0,
      warningCount: 0,
    },
    values,
  );
