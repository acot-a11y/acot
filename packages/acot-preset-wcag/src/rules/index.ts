import type { RuleRecord } from '@acot/types';
import dialogFocus from './dialog-focus';
import focusableHasIndicator from './focusable-has-indicator';
import imgHasName from './img-has-name';
import interactiveHasEnoughSize from './interactive-has-enough-size';
import interactiveHasName from './interactive-has-name';
import interactiveSupportsFocus from './interactive-supports-focus';
import linkHasName from './link-has-name';
import pageHasTitle from './page-has-title';
import pageHasValidLang from './page-has-valid-lang';

export const rules: RuleRecord = {
  'dialog-focus': dialogFocus,
  'focusable-has-indicator': focusableHasIndicator,
  'img-has-name': imgHasName,
  'interactive-has-enough-size': interactiveHasEnoughSize,
  'interactive-has-name': interactiveHasName,
  'interactive-supports-focus': interactiveSupportsFocus,
  'link-has-name': linkHasName,
  'page-has-title': pageHasTitle,
  'page-has-valid-lang': pageHasValidLang,
};
