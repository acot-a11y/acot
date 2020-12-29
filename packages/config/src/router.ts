import type { ResolvedConfig, ResolvedConfigEntry } from '@acot/types';
import micromatch from 'micromatch';
import { mergeConfig } from './merger';

export class ConfigRouter {
  private _config: ResolvedConfig;

  public constructor(config: ResolvedConfig) {
    this._config = config;
  }

  public resolve(path: string): ResolvedConfigEntry {
    const test = (pattern: string, path: string) =>
      micromatch.isMatch(path, pattern);

    const entries = this._config.overrides?.filter((entry) => {
      let found = false;

      // include
      if (entry.include != null) {
        found = entry.include.some((pattern) => test(pattern, path));
      }

      // exclude
      if (found && entry.exclude != null) {
        found = entry.exclude.every((pattern) => !test(pattern, path));
      }

      return found;
    });

    if (entries != null && entries.length > 0) {
      return entries.reduce((acc, cur) => mergeConfig(acc, cur), {
        rules: this._config.rules,
        presets: this._config.presets,
        headers: this._config.headers,
      });
    }

    return this._config;
  }
}
