import path from 'path';
import { ModuleLoader } from '@acot/module-loader';
import type { Plugin, PluginModule, RuleMap } from '@acot/types';
import { isFilepath } from '@acot/utils';
import { debug } from './logging';

export class PluginLoader {
  private _cache: Map<string, Plugin>;
  private _loader: ModuleLoader<PluginModule>;

  public constructor(cwd = process.cwd()) {
    this._cache = new Map();
    this._loader = new ModuleLoader('plugin', { from: cwd });
  }

  public load(name: string): Plugin {
    debug('plugin loader load: %s', name);

    // cache
    if (this._cache.has(name)) {
      return this._cache.get(name)!;
    }

    const module = this._loader.tryLoad(name);
    if (module == null) {
      throw new ReferenceError(`"${name}" plugin does not found`);
    }

    const plugin = this._transform(name, module);

    this._cache.set(name, plugin);

    return plugin;
  }

  private _transform(name: string, module: PluginModule): Plugin {
    const id = isFilepath(name) ? path.parse(path.normalize(name)).name : name;

    return {
      id,
      rules: Object.entries(module.rules ?? {}).reduce<RuleMap>(
        (acc, [name, rule]) => {
          acc.set(`${id}/${name}`, rule);
          return acc;
        },
        new Map(),
      ),
      configs: new Map(Object.entries(module.configs ?? {})),
    };
  }
}
