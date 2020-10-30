import type { RuleRecord } from '@acot/types';
import buttonHasName from './button-has-name';
import interactiveHasEnoughSize from './interactive-has-enough-size';
import interactiveSupportsFocus from './interactive-supports-focus';

export const rules: RuleRecord = {
  'button-has-name': buttonHasName,
  'interactive-has-enough-size': interactiveHasEnoughSize,
  'interactive-supports-focus': interactiveSupportsFocus,
};
