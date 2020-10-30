import { ModuleLoader } from '@acot/module-loader';
import type { RunnerFactory } from '@acot/types';

export class RunnerLoader {
  private _loader: ModuleLoader<RunnerFactory>;

  public constructor(cwd = process.cwd()) {
    this._loader = new ModuleLoader('runner', {
      from: cwd,
    });
  }

  public load(name: string): RunnerFactory {
    const factory = this._loader.tryLoad(name);
    if (factory != null) {
      return factory;
    }

    throw new ReferenceError(`The runner "${name}" was not found.`);
  }
}
