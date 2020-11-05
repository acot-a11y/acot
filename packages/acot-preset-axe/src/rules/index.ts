import type { RuleRecord } from '@acot/types';
import bestPractice from './best-practice';
import experimental from './experimental';
import wcag21a from './wcag21a';
import wcag21aa from './wcag21aa';
import wcag2a from './wcag2a';
import wcag2aa from './wcag2aa';
import wcag2aaa from './wcag2aaa';

export const rules: RuleRecord = {
  'best-practice': bestPractice,
  experimental,
  wcag21a,
  wcag21aa,
  wcag2a,
  wcag2aa,
  wcag2aaa,
};
