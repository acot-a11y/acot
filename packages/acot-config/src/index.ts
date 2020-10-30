import type { Config } from '@acot/types';

const config: Config = {
  plugins: ['@acot/wcag', '@acot/axe'],
  extends: ['plugin:@acot/wcag/recommended', 'plugin:@acot/axe/recommended'],
};

export default config;
