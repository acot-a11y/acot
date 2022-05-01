import { pickup } from '@acot/html-pickup';
import chalk from 'chalk';
import indent from 'indent-string';
import plur from 'plur';
import logSymbols from 'log-symbols';
import type { DocResult } from './doc-result';
import type { DocError } from './doc-error';
import { generateDocPath } from './doc-code';

export type DocResultReporterConfig = {
  origin: string;
  color: boolean;
};

export class DocResultReporter {
  private _config: DocResultReporterConfig;
  private _chalk: chalk.Chalk;

  public constructor(config: Partial<DocResultReporterConfig> = {}) {
    this._config = {
      origin: 'http://localhost:1234',
      color: true,
      ...config,
    };

    this._chalk = new chalk.Instance({
      level: this._config.color ? 1 : 0,
    });
  }

  public format(result: DocResult): string {
    const { origin } = this._config;
    const chk = this._chalk;

    let output = '\n';

    const groups = result.errors.reduce<Map<string, DocError[]>>((acc, cur) => {
      if (acc.has(cur.code.rule)) {
        acc.get(cur.code.rule)!.push(cur);
      } else {
        acc.set(cur.code.rule, [cur]);
      }
      return acc;
    }, new Map());

    groups.forEach((local, rule) => {
      const fail = chk.bold.red.inverse(' FAIL ');
      const title = chk.bold.underline(rule);
      const stat = chk.gray`(${local.length} ${plur('error', local.length)})`;

      output += `${fail} ${title} ${stat}\n\n`;

      local.forEach((error) => {
        output += chk`{red ${logSymbols.error}} {bold.red ${error.message}}`;
        output += '\n';

        error.results.forEach((result) => {
          output += indent(chk`{bold ${result.message}}\n`, 4);

          const meta: string[] = [];

          if (result.selector != null) {
            const html = pickup(error.code.html, result.selector, {
              color: false,
            });

            if (html != null) {
              meta.push(html);
              meta.push(`at "${result.selector}"`);
            }
          }

          meta.push(origin + generateDocPath(error.code));

          const metaStr = meta
            .map((m, i) => {
              return i === meta.length - 1 ? `└─ ${m}` : `├─ ${m}`;
            })
            .join('\n');

          output += indent(chk.gray(metaStr), 4);
          output += '\n';
        });
      });

      output += '\n';
    });

    const passed = Array.from(new Set(result.passes.map((code) => code.rule)));
    const failed = Array.from(groups.keys());
    const total = Array.from(new Set([...passed, ...failed]));

    const all = {
      total: total.length,
      passed: passed.length,
      failed: failed.length,
    };

    const cases = {
      total: result.passes.length + result.errors.length,
      passed: result.passes.length,
      failed: result.errors.length,
    };

    const display = (obj: {
      total: number;
      passed: number;
      failed: number;
    }) => {
      const items = [];

      if (obj.passed > 0) {
        items.push(chk.bold.green(`${obj.passed} passed`));
      }

      if (obj.failed > 0) {
        items.push(chk.bold.red(`${obj.failed} failed`));
      }

      items.push(`${obj.total} total`);

      return items.join(', ');
    };

    const footer: string[] = [];
    footer.push(chk`{bold Rules:     } ${display(all)}`);
    footer.push(chk`{bold Test Cases:} ${display(cases)}`);

    output += footer.join('\n');

    return chk.reset(`${output}\n`);
  }
}
