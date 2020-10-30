#!/usr/bin/env node
import { Logger } from '@acot/logger';
import type { PackageJson } from 'type-fest';
import { CLI } from './cli';
import { CommandContainer } from './command-container';
import { commands } from './commands';

(async () => {
  const logger = new Logger();

  try {
    const pkg = require('../package.json') as PackageJson;
    const container = new CommandContainer(commands);
    const cli = new CLI(pkg, logger, container);
    process.exit(await cli.run(process.argv.slice(2)));
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }
})();
