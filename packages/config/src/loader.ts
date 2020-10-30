import path from 'path';
import type { ResolvedConfig } from '@acot/types';
import { isDirectorySync } from 'path-type';
import { explorer } from './explorer';
import { debug } from './logging';
import { resolveConfig } from './resolver';

export type LoadConfigOptions = {
  cwd?: string;
};

const searchConfigModule = async (dir: string): Promise<unknown> => {
  debug('search config module: %s', dir);

  const loaded = await explorer.search(dir);
  if (!loaded) {
    throw new ReferenceError('not found config file');
  }

  return loaded.config;
};

const loadConfigModule = async (filepath: string): Promise<unknown> => {
  debug('load config module: %s', filepath);

  try {
    const loaded = await explorer.load(filepath);
    return loaded!.config;
  } catch (e) {
    debug(e);
    throw new ReferenceError('not found config file');
  }
};

export const loadConfig = async (
  from = '.',
  options: LoadConfigOptions = {},
): Promise<ResolvedConfig> => {
  const cwd = options.cwd ?? process.cwd();
  const fileOrDir = path.resolve(cwd, from);
  const isDir = isDirectorySync(fileOrDir);

  debug('path=%s, directory=%s', fileOrDir, isDir);

  const config = await resolveConfig(
    await (isDir ? searchConfigModule(fileOrDir) : loadConfigModule(fileOrDir)),
    { cwd },
  );

  debug('loaded config: %O', config);

  return config;
};
