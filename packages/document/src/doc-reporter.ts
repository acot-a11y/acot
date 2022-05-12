import ms from 'pretty-ms';
import { pickup } from '@acot/html-pickup';
import type { RuleId, TestcaseResult } from '@acot/types';
import chalk from 'chalk';
import indent from 'indent-string';
import logSymbols from 'log-symbols';
import plur from 'plur';
import stripAnsi from 'strip-ansi';
import { generateDocPath } from './doc-code';
import type { DocError } from './doc-error';
import type { DocResult } from './doc-result';

const symbols = {
  success: stripAnsi(logSymbols.success),
  warning: stripAnsi(logSymbols.warning),
  error: stripAnsi(logSymbols.error),
};

export type DocReporterConfig = {
  origin: string;
  color: boolean;
  stdout: NodeJS.WritableStream;
  stderr: NodeJS.WritableStream;
};

export class DocReporter {
  private _stdout: NodeJS.WritableStream;
  private _config: DocReporterConfig;
  private _chalk: chalk.Chalk;

  public constructor(config: Partial<DocReporterConfig> = {}) {
    this._config = {
      origin: 'http://localhost:1234',
      color: true,
      stdout: process.stdout,
      stderr: process.stderr,
      ...config,
    };

    this._stdout = this._config.stdout;

    this._chalk = new chalk.Instance({
      level: this._config.color ? 1 : 0,
    });
  }

  public async onTestcaseComplete(
    path: string,
    _id: RuleId,
    results: TestcaseResult[],
  ): Promise<void> {
    const chk = this._chalk;

    const data = results.reduce(
      (acc, cur) => {
        acc.duration += cur.duration;
        acc.pass += cur.status === 'pass' ? 1 : 0;
        acc.warning += cur.status === 'warn' ? 1 : 0;
        acc.error += cur.status === 'error' ? 1 : 0;
        return acc;
      },
      {
        duration: 0,
        pass: 0,
        warning: 0,
        error: 0,
      },
    );

    let output = `${path} `;
    output += chk` {gray ${symbols.success}} {bold.gray ${data.pass}}`;
    output += chk` {gray ${symbols.warning}} {bold.gray ${data.warning}}`;
    output += chk` {gray ${symbols.error}} {bold.gray ${data.error}}`;
    output += chk`  {gray (${ms(data.duration)})}`;

    this._stdout.write(`${output}\n`);
  }

  public async onComplete(result: DocResult): Promise<void> {
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

    this._stdout.write(chk.reset(`${output}\n\n`));
  }
}
