import type { RuleResult, TestcaseResult, TestResult } from '@acot/types';
import type { PartialDeep } from 'type-fest';
import { merge } from './merge';
import { createStat } from './stat';

export const createRuleResult = (
  values: PartialDeep<RuleResult> = {},
): RuleResult =>
  merge<RuleResult>(
    Object.keys(values).reduce<RuleResult>((acc, cur) => {
      acc[cur] = createStat();
      return acc;
    }, {}),
    values,
  );

export const createTestcaseResult = (
  values: PartialDeep<TestcaseResult> = {},
): TestcaseResult => {
  if (values.status === 'pass') {
    return merge<TestcaseResult>(
      {
        process: 0,
        status: 'pass',
        duration: 0,
        rule: '',
        tags: [],
      },
      values,
    );
  }

  return merge<TestcaseResult>(
    {
      process: 0,
      status: 'error',
      duration: 0,
      rule: '',
      message: '',
      tags: [],
      selector: null,
      htmlpath: null,
      imagepath: null,
    },
    values,
  );
};

export const createTestResult = (
  values: PartialDeep<TestResult> = {},
): TestResult =>
  merge<TestResult>(
    {
      ...createStat(),
      url: '',
      rules: createRuleResult(values.rules ?? {}),
      results: values.results?.map(() => createTestcaseResult()) ?? [],
    },
    values,
  );
