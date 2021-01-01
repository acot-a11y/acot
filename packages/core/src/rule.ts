import type { Rule, RuleOptions } from '@acot/types';

export const createRule = <T extends RuleOptions>(
  descriptor: Rule<T>,
): Rule<T> => descriptor;
