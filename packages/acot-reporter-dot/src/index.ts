import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import chalk from 'chalk';
import figures from 'figures';
import plur from 'plur';
import indent from 'indent-string';
import logSymbols from 'log-symbols';
import stripAnsi from 'strip-ansi';
import { pickup } from '@acot/html-pickup';
import { createReporterFactory } from '@acot/reporter';

const readFile = promisify(fs.readFile);

export default createReporterFactory(({ config, stdout }) => (runner) => {
  const heading = (text: string) =>
    chalk`{bold.cyan ${figures.bullet}} {bold ${text}}`;

  stdout.write('\n');

  runner.on('setup:start', async () => {
    stdout.write(heading('BOOTSTRAP') + '\n');
    stdout.write(chalk.green('.'));
  });

  runner.on('setup:complete', async () => {
    stdout.write(chalk.green('.'));
  });

  runner.on('connect:start', async () => {
    stdout.write(chalk.cyan('.'));
  });

  runner.on('connect:complete', async () => {
    stdout.write(chalk.cyan('.'));
  });

  runner.on('collect:start', async () => {
    stdout.write(chalk.blue('.'));
  });

  runner.on('collect:complete', async () => {
    stdout.write(chalk.blue('.'));
  });

  runner.on('launch:start', async () => {
    stdout.write(chalk.magenta('.'));
  });

  runner.on('launch:complete', async () => {
    stdout.write(chalk.magenta('.') + '\n\n');
  });

  runner.on('audit:start', async () => {
    stdout.write(heading('AUDIT') + '\n');
  });

  runner.on('test:complete', async ([, , result]) => {
    if (result.errorCount) {
      stdout.write(chalk.red('!'));
    } else if (result.warningCount) {
      stdout.write(chalk.yellow('.'));
    } else {
      stdout.write(chalk.gray('.'));
    }
  });

  runner.on('audit:complete', async ([summary]) => {
    stdout.write('\n\n');

    if (summary.results.length === 0) {
      return;
    }

    stdout.write(heading('RESULTS') + '\n');

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
            const lines = [[status, msg, rule].join('  ')];
            const meta: string[] = [];

            if (res.htmlpath != null && res.selector) {
              const html = await readFile(
                path.resolve(config.workingDir!, res.htmlpath),
                'utf8',
              );

              const selector = res.selector;
              const code = pickup(html, selector, { color: false });

              meta.push(code, `at "${selector}"`);
            }

            if (res.help) {
              const url = chalk.underline(res.help);
              meta.push(`see ${url}`);
            }

            if (meta.length > 0) {
              lines.push(indent(chalk.gray(meta.join('\n')), 3));
            }

            return `${lines.join('\n')}`;
          }),
        );

        const filtered = groups.filter((g) => g);
        if (filtered.length === 0) {
          return;
        }

        const url = chalk.bold.underline(result.url);

        const short = [
          chalk.cyan(`${stripAnsi(logSymbols.success)} ${result.passCount}`),
          chalk.red(`${stripAnsi(logSymbols.error)} ${result.errorCount}`),
          chalk.yellow(
            `${stripAnsi(logSymbols.warning)} ${result.warningCount}`,
          ),
        ].join(' ');

        stdout.write(`${url} - ${short}\n`);
        stdout.write(`${filtered.join('\n\n')}\n\n`);
      }),
    );

    const count = (s: string, n: number) => `${n} ${plur(s, n)}`;

    stdout.write('\n');

    stdout.write(
      [
        chalk.bold.cyan(count('pass', summary.passCount)),
        chalk.bold.red(count('error', summary.errorCount)),
        chalk.bold.yellow(count('warning', summary.warningCount)),
      ].join('  '),
    );

    stdout.write('\n\n');
  });
});
