#!/usr/bin/env node
import { Logger } from '@acot/logger';
import type { PackageJson } from 'type-fest';
import updateNotifier from 'update-notifier';
import { CLI } from './cli';
import { CommandContainer } from './command-container';
import { commands } from './commands';

(async () => {
  const logger = new Logger();

  try {
    const pkg = require('../package.json') as PackageJson;

    updateNotifier({
      pkg: pkg as any,
      distTag: pkg.version?.includes('canary') ? 'canary' : 'latest',
    }).notify();

    const cli = new CLI(pkg, logger, new CommandContainer(commands));

    process.exit(await cli.run(process.argv.slice(2)));
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }
})();
