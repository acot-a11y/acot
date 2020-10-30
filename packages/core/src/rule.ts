import type { Rule } from '@acot/types';

export const createRule = <T = unknown>(descriptor: Rule<T>): Rule<T> =>
  descriptor;
