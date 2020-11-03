import { PassThrough } from 'stream';
import type { PackageJson } from 'type-fest';
import yargs from 'yargs/yargs';
import { Logger } from '@acot/logger';
import { globalOptions } from './global-options';
import { buildCommand } from './command';
import type { CommandContainer } from './command-container';
const debug = require('debug')('acot:cli');

process.on('uncaughtException', (e: null | undefined | Partial<Error>) => {
  new Logger().error('Uncaught exception:', e);
  process.exit(1);
});

process.on('unhandledRejection', (e: null | undefined | Partial<Error>) => {
  new Logger().error('Unhandled rejection:', e);
  process.exit(1);
});

export class CLI {
  private _pkg: PackageJson;
  private _logger: Logger;
  private _container: CommandContainer;

  public constructor(
    pkg: PackageJson,
    logger: Logger,
    container: CommandContainer,
  ) {
    this._pkg = pkg;
    this._logger = logger;
    this._container = container;
  }

  public async run(argv: string[]): Promise<number> {
    const logger = this._logger;

    const parser = yargs()
      .help(false)
      .version(false)
      .detectLocale(false)
      .parserConfiguration({
        'set-placeholder-key': true,
      })
      .fail((msg, err) => {
        throw err != null ? err : new Error(msg);
      })
      .options(globalOptions)
      .exitProcess(false);

    let parsed = parser.parse(argv);

    if (parsed.debug) {
      const debug = require('debug');
      debug.enable('acot:*');
    }

    if (parsed.quiet) {
      const stream = new PassThrough();
      logger.update({ stdout: stream, stderr: stream });
    } else if (parsed.verbose) {
      logger.update({ level: 'verbose' });
    }

    parser.strict();

    this._container.all().forEach((module) => {
      buildCommand(parser, module);
    });

    try {
      debug('receive argv: %O', argv);
      parsed = parser.parse(argv);
      debug('parsed argv: %O', parsed);
    } catch (e) {
      logger.error(e);
      debug('Parse error:', e);
      return 1;
    }

    const context = {
      cwd: process.cwd(),
      pkg: this._pkg,
      container: this._container,
      logger,
    };

    try {
      const { _, $0, ...args } = parsed;

      if (parsed.version) {
        return await this._container.mustGet('version').run({
          ...context,
          args,
        });
      }

      if (parsed.help) {
        return await this._container.mustGet('help').run({
          ...context,
          args: {
            ...args,
            command: _,
          },
        });
      }

      const command = _.join('.') || 'help';

      debug(`command "${command}"`);
      debug('running command...');

      return await this._container.mustGet(command).run({
        ...context,
        args,
      });
    } catch (e) {
      logger.error(e);
      return 1;
    }
  }
}
