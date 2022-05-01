import { resolveModule } from './resolve-module';

export const tryResolveModule = <T = unknown>(
  id: string,
  from?: string,
): [T, null] | [null, Error] => {
  try {
    return [resolveModule<T>(id, from), null];
  } catch (e) {
    return [null, e as Error];
  }
};
