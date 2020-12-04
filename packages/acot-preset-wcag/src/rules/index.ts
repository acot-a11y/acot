import type { RuleRecord } from '@acot/types';
import interactiveHasEnoughSize from './interactive-has-enough-size';
import interactiveSupportsFocus from './interactive-supports-focus';
import interactiveHasName from './interactive-has-name';
import pageHasTitle from './page-has-title';
import imgHasName from './img-has-name';
import dialogFocus from './dialog-focus';
import pageHasValidLang from './page-has-valid-lang';

export const rules: RuleRecord = {
  'interactive-has-enough-size': interactiveHasEnoughSize,
  'interactive-supports-focus': interactiveSupportsFocus,
  'interactive-has-name': interactiveHasName,
  'page-has-title': pageHasTitle,
  'page-has-valid-lang': pageHasValidLang,
  'img-has-name': imgHasName,
  'dialog-focus': dialogFocus,
};
