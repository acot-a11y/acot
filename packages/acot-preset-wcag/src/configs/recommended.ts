import type { Config } from '@acot/types';

const config: Config = {
  extends: ['./configs/base'],
  rules: {
    '@acot/wcag/dialog-focus': 'error',
    '@acot/wcag/focusable-has-indicator': 'error',
    '@acot/wcag/img-has-name': 'error',
    '@acot/wcag/interactive-has-enough-size': 'warn',
    '@acot/wcag/interactive-has-name': 'error',
    '@acot/wcag/link-has-name': 'error',
    '@acot/wcag/page-has-title': 'error',
    '@acot/wcag/page-has-valid-lang': 'error',
  },
};

export default config;
