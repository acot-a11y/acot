import os from 'os';
import { Acot } from '@acot/core';
import { findChrome } from '@acot/find-chrome';
import type { CoreEventMap, TestcaseResult } from '@acot/types';
import micromatch from 'micromatch';
import plur from 'plur';
import type { DocCode } from './doc-code';
import { extractCodeMeta, generateDocPath, generateDocUrl } from './doc-code';
import type { DocProject } from './doc-project';
import type { DocReporter } from './doc-reporter';
import type { DocResult } from './doc-result';
import type { DocServer } from './doc-server';
import { debug } from './logging';

export type DocRunnerConfig = {
  project: DocProject;
  parallel?: number;
};

export class DocRunner {
  private _server: DocServer;
  private _reporter: DocReporter;
  private _config: DocRunnerConfig;

  public constructor(
    server: DocServer,
    reporter: DocReporter,
    config: DocRunnerConfig,
  ) {
    this._server = server;
    this._reporter = reporter;
    this._config = {
      parallel: os.cpus().length - 1,
      ...config,
    };
  }

  public async run(pattern?: string): Promise<DocResult> {
    const { project } = this._config;
    const port = this._server.port;

    const chromium = await findChrome();
    debug('found chromium: %o', chromium);

    await this._server.bootstrap(project);

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
      acot.on('testcase:complete', this._handleTestcaseComplete);

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

    await this._reporter.onComplete(result);

    return result;
  }

  private _handleTestcaseComplete = async ([
    url,
    id,
    results,
  ]: CoreEventMap['testcase:complete']) => {
    await this._reporter.onTestcaseComplete(new URL(url).pathname, id, results);
  };
}
