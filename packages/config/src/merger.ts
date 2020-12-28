import deepmerge from 'deepmerge';
import type { ResolvedConfig, ResolvedConfigEntry } from '@acot/types';
import { isPlainObject } from 'is-plain-object';

const isMergeableObject = (v: any) => Array.isArray(v) || isPlainObject(v);

export const mergeConfig = <T extends ResolvedConfig | ResolvedConfigEntry>(
  ...configs: T[]
): T => {
  return configs.reduce<T>((acc, cur) => {
    const config = deepmerge<T>(acc, cur, { isMergeableObject });

    // `rules` key is a shallow copy
    config.rules = {
      ...(acc.rules ?? {}),
      ...(cur.rules ?? {}),
    };

    return config;
  }, {} as T);
};
