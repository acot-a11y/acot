import type { PartialDeep } from 'type-fest';
import deepmerge from 'deepmerge';
import { isPlainObject } from 'is-plain-object';

const isMergeableObject = (v: any): boolean =>
  Array.isArray(v) || (isPlainObject(v) as any);

export const merge = <T>(x: T, y: PartialDeep<T>): T =>
  deepmerge(x as any, y as any, {
    isMergeableObject,
  });
