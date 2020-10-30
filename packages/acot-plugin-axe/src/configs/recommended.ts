import type { Config } from '@acot/types';

const config: Config = {
  extends: ['./configs/base'],
  rules: {
    '@acot/axe/wcag2a': 'error',
    '@acot/axe/wcag2aa': 'error',
    '@acot/axe/wcag2aaa': 'error',
    '@acot/axe/wcag21a': 'error',
    '@acot/axe/wcag21aa': 'error',
    '@acot/axe/best-practice': 'warn',
    '@acot/axe/experimental': 'warn',
  },
};

export default config;
