import { ModuleLoader } from '@acot/module-loader';
import type { ReporterFactory } from '@acot/types';

export class ReporterLoader {
  private _loader: ModuleLoader<ReporterFactory>;

  public constructor(cwd = process.cwd()) {
    this._loader = new ModuleLoader('reporter', {
      from: cwd,
    });
  }

  public load(name: string): ReporterFactory {
    const factory = this._loader.tryLoad(name);
    if (factory != null) {
      return factory;
    }

    throw new ReferenceError(`The reporter "${name}" was not found.`);
  }
}
