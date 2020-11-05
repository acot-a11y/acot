import path from 'path';
import { ModuleLoader } from '@acot/module-loader';
import type { Preset, PresetModule, RuleMap } from '@acot/types';
import { isFilepath } from '@acot/utils';
import { debug } from './logging';

export class PresetLoader {
  private _cache: Map<string, Preset>;
  private _loader: ModuleLoader<PresetModule>;

  public constructor(cwd = process.cwd()) {
    this._cache = new Map();
    this._loader = new ModuleLoader('preset', { from: cwd });
  }

  public load(name: string): Preset {
    debug('preset loader load: %s', name);

    // cache
    if (this._cache.has(name)) {
      return this._cache.get(name)!;
    }

    const module = this._loader.tryLoad(name);
    if (module == null) {
      throw new ReferenceError(`"${name}" preset does not found`);
    }

    const preset = this._transform(name, module);

    this._cache.set(name, preset);

    return preset;
  }

  private _transform(name: string, module: PresetModule): Preset {
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
