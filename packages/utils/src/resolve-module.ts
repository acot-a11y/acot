import resolveFrom from 'resolve-from';

export const resolveModule = <T = unknown>(id: string, from?: string): T => {
  const moduleId = from != null ? resolveFrom(from, id) : require.resolve(id);
  const module = require(moduleId);
  return (module.default ?? module) as T;
};
