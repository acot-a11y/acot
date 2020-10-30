import type { TestcaseResult, TestResult } from '@acot/types';
import type { PartialDeep } from 'type-fest';
import { merge } from './merge';
import { createStat } from './stat';

export const createTestcaseResult = (
  values: PartialDeep<TestcaseResult> = {},
): TestcaseResult => {
  if (values.status === 'pass') {
    return merge<TestcaseResult>(
      {
        process: 0,
        status: 'pass',
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
      results: [],
    },
    values,
  );
