import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { resolveModule } from '@acot/utils';
import { PresetLoader } from '@acot/core';
import type { PackageJson } from 'type-fest';
import type { Preset } from '@acot/types';
import glob from 'fast-glob';
import type { DocProject } from './doc-project';
import type { DocCode } from './doc-code';
import { DocParser } from './doc-parser';
import { debug } from './logging';

const readFile = promisify(fs.readFile);

type ResolvedPackageJson = {
  name: string;
  main: string;
};

export type DocProjectLoaderConfig = {
  docs: string;
};

export class DocProjectLoader {
  private _config: DocProjectLoaderConfig;

  public constructor(config: Partial<DocProjectLoaderConfig> = {}) {
    this._config = {
      docs: path.join('docs', 'rules'),
      ...config,
    };
  }

  public async load(project: string): Promise<DocProject> {
    const { docs } = this._config;

    // package.json
    const { name, main } = this._loadPackageJson(project);

    // preset
    const preset = this._loadPreset(project, main);

    // codes
    const codes = await this._loadCodes(project, docs);

    return {
      root: project,
      name,
      main,
      preset,
      codes,
    };
  }

  private _loadPackageJson(project: string): ResolvedPackageJson {
    const pkg = resolveModule<PackageJson>(path.join(project, 'package.json'));

    if (!pkg.name || !pkg.main) {
      throw new Error(
        'Should be specify the "name" and "main" fields in "package.json".',
      );
    }

    return {
      name: pkg.name,
      main: pkg.main,
    };
  }

  private _loadPreset(project: string, main: string): Preset {
    const preset = new PresetLoader(project).load(main);

    debug('loaded preset: %O', preset);

    return preset;
  }

  private async _loadCodes(project: string, docs: string): Promise<DocCode[]> {
    const parser = new DocParser();

    const targets = glob.sync(path.join(project, docs, '*.md'));

    const files = await Promise.all(
      targets.map(async (filepath) => {
        const content = await readFile(filepath, 'utf8');

        return {
          path: filepath,
          content,
        };
      }),
    );

    const codes: DocCode[] = [];

    for (const file of files) {
      codes.push(...parser.parse(file));
    }

    return codes;
  }
}
