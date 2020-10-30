import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import chalk from 'chalk';
import boxen from 'boxen';
import table from 'text-table';
import ora from 'ora';
import indent from 'indent-string';
import type { TestResult } from '@acot/types';
import logUpdate from 'log-update';
import logSymbols from 'log-symbols';
import plur from 'plur';
import { pickup } from '@acot/html-pickup';
import { createReporterFactory } from '../factory';

const readFile = promisify(fs.readFile);

const getSymbol = (result: TestResult) => {
  let symbol = logSymbols.success;
  if (result.errorCount > 0) {
    symbol = logSymbols.error;
  } else {
    symbol = logSymbols.warning;
  }
  return symbol;
};

const count = (s: string, n: number) => `${n} ${plur(s, n)}`;

class AuditProgress {
  protected _current = 0;
  protected _urls: string[];
  protected _stream: NodeJS.WritableStream;
  protected _map: Map<
    string,
    [spinner: ora.Ora, text: string, result: TestResult | null]
  >;
  protected _timer: NodeJS.Timeout | null = null;
  protected _update: logUpdate.LogUpdate;

  public constructor(urls: string[], stream: NodeJS.WritableStream) {
    this._urls = urls;
    this._stream = stream;
    this._map = new Map();
    this._update = logUpdate.create(stream);
  }

  public start() {
    this._urls.forEach((url) => {
      const text = chalk.bold(url);
      this._map.set(url, [
        ora({ color: 'gray', stream: this._stream }),
        text,
        null,
      ]);
    });

    this._loop();
  }

  public increment(result: TestResult) {
    const entry = this._map.get(result.url)!;
    const summary = [
      count('error', result.errorCount),
      count('warning', result.warningCount),
      count('pass', result.passCount),
    ].join(', ');

    const text = chalk`{bold ${result.url}} {gray (${summary})}`;

    this._map.set(result.url, [entry[0], text, result]);
    this._current++;

    if (this._current >= this._urls.length) {
      this.stop();
      this._render();
    }
  }

  public stop() {
    if (this._timer != null) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  private _render() {
    const total = this._urls.length;
    const percent = Math.floor((this._current / total) * 100);
    let output = chalk`{bold Running on ${total} URLs:} {cyan ${percent}%}\n`;

    this._map.forEach(([spinner, text, result]) => {
      if (result != null) {
        output += `${getSymbol(result)} ${text}\n`;
      } else {
        output += `${spinner.frame()}${text}\n`;
      }
    });

    this._update(output);
  }

  private _loop() {
    this._timer = setInterval(() => {
      this._render();
    }, 60);
  }
}

class AuditLinearProgress extends AuditProgress {
  public increment(result: TestResult) {
    this._current++;

    const total = this._urls.length;
    const current = this._current.toString().padStart(`${total}`.length, '0');

    const summary = [
      count('error', result.errorCount),
      count('warning', result.warningCount),
      count('pass', result.passCount),
    ].join(', ');

    const output = [
      `[${current}/${total}]`,
      chalk.bold(result.url),
      chalk`{gray (${summary})}`,
    ].join(' ');

    this._stream.write(`${output}\n`);

    if (this._current >= total) {
      this._stream.write('\n');
    }
  }

  /* eslint-disable @typescript-eslint/no-empty-function */
  public start() {}
  public stop() {}
  /* eslint-enable @typescript-eslint/no-empty-function */
}

export default createReporterFactory(
  ({ verbose, config, stdout }) => (runner) => {
    const heading = chalk.bold.gray;

    const createSpinner = (text: string) =>
      ora({ text, color: 'gray', stream: stdout, isEnabled: !verbose }).start();

    let spinner: ora.Ora;

    stdout.write(
      boxen(
        table([
          ['acot core:', chalk.green`v${runner.version.core}`],
          ['runner:', chalk.green`${runner.name} (v${runner.version.self})`],
          ['origin:', chalk.green.underline`${config.origin}`],
        ]),
        { borderColor: 'gray', padding: 1 },
      ) + '\n\n',
    );

    let progress: AuditProgress | AuditLinearProgress | null = null;

    runner.on('setup:start', () => {
      stdout.write(heading('(Bootstrap)') + '\n');
      spinner = createSpinner('Setting up...');
    });

    runner.on('setup:complete', () => {
      spinner.succeed('Setup');
    });

    runner.on('connect:start', () => {
      spinner = createSpinner('Connecting...');
    });

    runner.on('connect:complete', () => {
      spinner.succeed(`Connected (${config.origin})`);
    });

    runner.on('collect:start', () => {
      spinner = createSpinner('Collecting...');
    });

    runner.on('collect:complete', ([results]) => {
      spinner.succeed(`Collected (${results.length} cases)`);
    });

    runner.on('launch:start', () => {
      spinner = createSpinner('Launching...');
    });

    runner.on('launch:complete', ([urls]) => {
      spinner.succeed('Launched!');
      stdout.write('\n');
      progress = verbose
        ? new AuditLinearProgress(urls, stdout)
        : new AuditProgress(urls, stdout);
    });

    runner.on('audit:start', () => {
      stdout.write(heading('(Audit)') + '\n');
      progress!.start();
    });

    runner.on('test:complete', ([, , result]) => {
      progress!.increment(result);
    });

    runner.on('audit:complete', async ([summary]) => {
      if (summary.results.length === 0) {
        return;
      }

      stdout.write(heading('(Results)') + '\n');

      await Promise.all(
        summary.results.map(async (result) => {
          if (result.results.length === 0) {
            return;
          }

          if (result.errorCount === 0 && result.warningCount === 0) {
            return;
          }

          const groups = await Promise.all(
            result.results.map(async (res) => {
              let status: string;
              switch (res.status) {
                case 'error':
                  status = logSymbols.error;
                  break;
                case 'warn':
                  status = logSymbols.warning;
                  break;
                default:
                  return '';
              }

              const msg = res.message;
              const rule = chalk.gray(res.rule);
              const lines = [indent([status, msg, rule].join('  '), 2)];
              const meta: string[] = [];

              if (res.tags.length > 0) {
                meta.push(res.tags.join(', '));
              }

              if (res.htmlpath != null && res.selector) {
                const html = await readFile(
                  path.resolve(config.workingDir!, res.htmlpath),
                  'utf8',
                );

                const selector = res.selector;
                const code = pickup(html, selector, { color: false });

                meta.push(code, `at "${selector}"`);
              }

              if (meta.length > 0) {
                const metaStr = meta
                  .map((m, i) => {
                    return i === meta.length - 1 ? `└─ ${m}` : `├─ ${m}`;
                  })
                  .join('\n');

                lines.push(indent(chalk.gray(metaStr), 5));
              }

              return `${lines.join('\n')}`;
            }),
          );

          const filtered = groups.filter((g) => g);
          if (filtered.length === 0) {
            return;
          }

          const label = result.errorCount
            ? chalk.bgRed.black.bold(' ERROR ')
            : chalk.bgYellow.black.bold(' WARN ');

          const url = chalk.bold(result.url);

          stdout.write(`${label} ${url}\n${filtered.join('\n\n')}\n\n`);
        }),
      );

      if (summary.errorCount > 0) {
        stdout.write(
          chalk.red(
            `${summary.errorCount} ${plur('error', summary.errorCount)}\n`,
          ),
        );
      }

      if (summary.warningCount > 0) {
        stdout.write(
          chalk.yellow(
            `${summary.warningCount} ${plur(
              'warning',
              summary.warningCount,
            )}\n`,
          ),
        );
      }

      if (summary.passCount > 0) {
        stdout.write(
          chalk.green(
            `${summary.passCount} ${plur('pass', summary.passCount)}\n`,
          ),
        );
      }

      stdout.write('\n');
    });
  },
);
