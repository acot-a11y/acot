/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import path from 'path';
import { formatWithOptions } from 'util';
import figures from 'figures';
import stripAnsi from 'strip-ansi';
import chalk from 'chalk';
import indent from 'indent-string';

type ForegroundColor = typeof chalk.ForegroundColor;

/**
 * Log levels are mapped as follows.
 *
 * | Level   | Type  |
 * | :------ | :---- |
 * | info    | log   |
 * | info    | info  |
 * | warning | warn  |
 * | error   | error |
 */

const logLevels = {
  verbose: 10,
  info: 20,
  warning: 30,
  error: 40,
};

const distMap = {
  log: 'stdout',
  info: 'stdout',
  warn: 'stderr',
  error: 'stderr',
} as const;

type LogType = keyof typeof distMap;

type Display = {
  label: string;
  color?: ForegroundColor;
  inverse?: boolean;
};

const logDisplays: { [P in LogType]: Display } = {
  log: {
    label: figures.bullet,
    color: 'blue',
  },
  info: {
    label: figures.info,
    color: 'cyan',
  },
  warn: {
    label: ' WARN ',
    color: 'yellow',
    inverse: true,
  },
  error: {
    label: ' ERROR ',
    color: 'red',
    inverse: true,
  },
};

export type LogLevel = keyof typeof logLevels;

export type LoggerConfig = {
  level: LogLevel;
  color: boolean;
  break: number;
  depth: number;
  stdout: NodeJS.WritableStream;
  stderr: NodeJS.WritableStream;
};

export class Logger {
  private _enabled: boolean;
  private _config: LoggerConfig;
  private _value: number;
  private _chalk: chalk.Chalk;

  public constructor(config: Partial<LoggerConfig> = {}) {
    this._enabled = true;
    this._config = {
      level: 'warning',
      color: true,
      break: process.stdout.columns,
      depth: 10,
      stdout: process.stdout,
      stderr: process.stderr,
      ...(config || {}),
    };

    this._chalk = new chalk.Instance({
      level: this._config.color ? 1 : 0,
    });

    this._value = logLevels[this._config.level];
  }

  public getStdout(): NodeJS.WritableStream {
    return this._config.stdout;
  }

  public getStderr(): NodeJS.WritableStream {
    return this._config.stderr;
  }

  public extends(config: Partial<LoggerConfig> = {}): Logger {
    return new Logger({
      ...this._config,
      ...config,
    });
  }

  public update(config: Partial<LoggerConfig>): Logger {
    this._config = {
      ...this._config,
      ...config,
    };

    this._value = logLevels[this._config.level];

    return this;
  }

  public enable(): Logger {
    this._enabled = true;
    return this;
  }

  public disable(): Logger {
    this._enabled = false;
    return this;
  }

  private _formatArgs(args: any[]): any[] {
    const cwd = process.cwd() + path.sep;

    return args.map((arg) => {
      if (arg instanceof Error && typeof arg.stack === 'string') {
        const stack = arg.stack
          .split('\n')
          .splice(1)
          .map((line) =>
            indent(
              line
                .trim()
                .replace('file://', '')
                .replace(cwd, '')
                .replace(/^(at\s+)/, (_, l) => this._chalk.gray(l))
                .replace(/\((.+)\)/, (_, l) => `(${this._chalk.gray(l)})`),
              4,
            ),
          )
          .join('\n');

        return `${this._chalk.bold.red(
          `${arg.name}: ${arg.message}`,
        )}\n${stack}`;
      }
      return arg;
    });
  }

  private _formatWithOptions(format: any, ...args: any[]): string {
    return formatWithOptions(
      {
        breakLength: this._config.break,
        depth: this._config.depth,
        colors: this._chalk.level !== 0,
      },
      format,
      ...args,
    );
  }

  private _format(head: number, args: any[]): string {
    const formatted = this._formatWithOptions(
      ...(this._formatArgs(args) as [any, ...any[]]),
    );

    const at = (target: string) => {
      const i = formatted.indexOf(target);
      return i > -1 ? i : null;
    };

    const pos = at('\n') || formatted.length;
    const first = formatted.slice(0, pos);
    const other = formatted.slice(pos);

    return first + (other ? indent(other, head) : '');
  }

  public print(format: any, ...args: any[]): Logger {
    if (this._enabled) {
      this._config.stdout.write(
        this._formatWithOptions(format, ...args) + '\n',
      );
    }

    return this;
  }

  private _trace<T extends LogType>(
    type: T,
    format: any,
    ...args: any[]
  ): Logger {
    if (!this._enabled) {
      return this;
    }

    const display = logDisplays[type];
    let head = display.label;
    if (display.color != null) {
      let wrap = this._chalk.bold[display.color];
      wrap = display.inverse ? wrap.inverse : wrap;
      head = wrap(head);
    }

    head += ' ';

    const body = this._format(stripAnsi(head).length, [format, ...args]);

    this._config[distMap[type]].write(head + body + '\n');

    return this;
  }

  public log(format: any, ...args: any[]): Logger {
    if (this._value <= logLevels.info) {
      this._trace('log', format, ...args);
    }

    return this;
  }

  public info(format: any, ...args: any[]): Logger {
    if (this._value <= logLevels.info) {
      this._trace('info', format, ...args);
    }

    return this;
  }

  public warn(format: any, ...args: any[]): Logger {
    if (this._value <= logLevels.warning) {
      this._trace('warn', format, ...args);
    }

    return this;
  }

  public error(format: any, ...args: any[]): Logger {
    if (this._value <= logLevels.error) {
      this._trace('error', format, ...args);
    }

    return this;
  }
}
