import type { Summary } from '@acot/types';
import type { PartialDeep } from 'type-fest';
import { merge } from './merge';
import { createRuleResult, createTestResult } from './result';
import { createStat } from './stat';

export const createSummary = (values: PartialDeep<Summary> = {}): Summary =>
  merge<Summary>(
    {
      ...createStat(),
      rules: createRuleResult(values.rules ?? {}),
      results: values.results?.map(() => createTestResult()) ?? [],
    },
    values,
  );
