import type { Config } from '@acot/types';

const config: Config = {
  presets: ['@acot/wcag', '@acot/axe'],
  extends: ['preset:@acot/wcag/recommended', 'preset:@acot/axe/recommended'],
};

export default config;
