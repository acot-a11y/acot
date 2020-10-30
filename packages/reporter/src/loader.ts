import path from 'path';
import { ModuleLoader } from '@acot/module-loader';
import type { ReporterFactory } from '@acot/types';
import { tryResolveModule } from '@acot/utils';

const BUILT_IN_DIR = path.resolve(__dirname, 'reporters');

export class ReporterLoader {
  private _loader: ModuleLoader<ReporterFactory>;

  public constructor(cwd = process.cwd()) {
    this._loader = new ModuleLoader('reporter', {
      from: cwd,
    });
  }

  public load(name: string): ReporterFactory {
    let factory: ReporterFactory | null;

    // built-in
    [factory] = tryResolveModule<ReporterFactory>(
      path.join(BUILT_IN_DIR, name),
    );

    if (factory != null) {
      return factory;
    }

    // package or local files
    factory = this._loader.tryLoad(name);
    if (factory != null) {
      return factory;
    }

    throw new ReferenceError(`The reporter "${name}" was not found.`);
  }
}
