import path from 'path';
import { tryResolveModule, shorthand2pkg } from '@acot/utils';
const debug = require('debug')('acot:module-loader');

export type ModuleLoaderConfig = {
  from: string;
  cache: boolean;
};

export class ModuleLoader<T> {
  private _prefix: string;
  private _config: ModuleLoaderConfig;
  private _cache = new Map<string, T>();

  public constructor(prefix: string, config: Partial<ModuleLoaderConfig> = {}) {
    this._prefix = prefix;

    this._config = {
      from: process.cwd(),
      cache: false,
      ...config,
    };
  }

  public load(name: string): T {
    debug('load start: %s', name);

    // cache (if needed)
    if (this._config.cache) {
      if (this._cache.has(name)) {
        debug('cache hit: key="%s"', name);
        return this._cache.get(name)!;
      }

      debug('resolve for module in files because cache not found...');
    }

    let module: T | null;

    // file
    module = this._tryLoadFile(name);
    if (module != null) {
      this._setCacheIfNeeded(name, module);
      return module;
    }

    debug('resolve for module in package because file not found...');

    // package
    module = this._tryLoadPackage(name);
    if (module != null) {
      this._setCacheIfNeeded(name, module);
      return module;
    }

    throw new ReferenceError(`"${name}" module does not found`);
  }

  public tryLoad(name: string): T | null {
    try {
      return this.load(name);
    } catch (e) {
      debug('load error: ', e);
      return null;
    }
  }

  private _tryLoadFile(filepath: string): T | null {
    const fpath = path.join(this._config.from, filepath);
    debug('file load... ("%s")', fpath);

    const [module, error] = tryResolveModule<T>(fpath);
    if (error) {
      debug('file load error:', error);
    }

    return module;
  }

  private _tryLoadPackage(name: string): T | null {
    const id = shorthand2pkg(name, this._prefix);
    debug('package load... ("%s")', id);

    const [module, error] = tryResolveModule<T>(id, this._config.from);
    if (error) {
      debug('package load error:', error);
    }

    return module;
  }

  private _setCacheIfNeeded(name: string, module: T): void {
    if (this._config.cache) {
      this._cache.set(name, module);
    }
  }
}
