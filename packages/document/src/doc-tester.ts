import os from 'os';
import type { TestcaseResult } from '@acot/types';
import { Acot } from '@acot/core';
import { findChrome } from '@acot/find-chrome';
import plur from 'plur';
import micromatch from 'micromatch';
import type { DocServer } from './doc-server';
import type { DocCode } from './doc-code';
import { generateDocUrl, extractCodeMeta, generateDocPath } from './doc-code';
import type { DocProject } from './doc-project';
import type { DocResult } from './doc-result';
import { debug } from './logging';

export type DocTesterConfig = {
  parallel: number;
};

export class DocTester {
  private _server: DocServer;
  private _config: DocTesterConfig;

  public constructor(server: DocServer, config: Partial<DocTesterConfig> = {}) {
    this._server = server;
    this._config = {
      parallel: os.cpus().length,
      ...config,
    };
  }

  public async test(project: DocProject, pattern?: string): Promise<DocResult> {
    const port = this._server.port;

    const chromium = await findChrome();
    debug('found chromium: %O', chromium);

    await this._server.bootstrap(project);

    debug('listening...');

    // acot
    const acot = new Acot({
      launchOptions: {
        executablePath: chromium?.executablePath,
      },
      parallel: this._config.parallel,
      presets: [project.preset],
      origin: `http://localhost:${port}`,
    });

    const skips = new Set<DocCode>();

    project.codes.forEach((code) => {
      if (
        code.meta['acot-ignore'] === true ||
        (pattern != null && micromatch.isMatch(code.rule, pattern))
      ) {
        skips.add(code);
        return;
      }

      acot.add(generateDocPath(code), {
        rules: {
          [`${project.preset.id}/${code.rule}`]: [
            'error',
            extractCodeMeta(code),
          ],
        },
      });
    });

    const result: DocResult = {
      skips: Array.from(skips),
      passes: [],
      errors: [],
    };

    try {
      const summary = await acot.audit();

      project.codes.forEach((code) => {
        if (skips.has(code)) {
          return;
        }

        const url = generateDocUrl(port, code);

        let results: TestcaseResult[] = [];
        for (const result of summary.results) {
          if (result.url !== url) {
            continue;
          }
          results = result.results;
          break;
        }

        const length = results.length;
        const actual = `actual: ${length} ${plur('problem', length)}`;

        switch (code.type) {
          case 'correct': {
            const errors = results.filter((p) => p.status === 'error');
            if (errors.length > 0) {
              result.errors.push({
                code,
                message: `Should be 0 problem. (${actual})`,
                results: errors,
              });
            } else {
              result.passes.push(code);
            }
            break;
          }

          case 'incorrect': {
            const found = results.find((p) => p.status === 'error');
            if (found == null) {
              result.errors.push({
                code,
                message: `Should have more than 1 results. (${actual})`,
                results: [],
              });
            } else {
              result.passes.push(code);
            }
            break;
          }
        }
      });
    } catch (e) {
      debug('Unexpected doc-test error:', e);
    }

    await this._server.terminate();

    return result;
  }
}
