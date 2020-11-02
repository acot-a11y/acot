import os from 'os';
import path from 'path';
import { loadConfig, mergeConfig } from '@acot/config';
import { Acot } from '@acot/core';
import type { ChromeChannel } from '@acot/find-chrome';
import { findChrome } from '@acot/find-chrome';
import { ReporterLoader } from '@acot/reporter';
import type {
  Reporter,
  ReporterFactoryConfig,
  ResolvedConfig,
  Runner,
  RunnerFactoryConfig,
  Timing,
} from '@acot/types';
import { parseViewport } from '@acot/utils';
import isCI from 'is-ci';
import table from 'markdown-table';
import { createCommand } from '../command';
import { debug } from '../logging';
import { createDefaultRunner } from '../runner';

const generateTimingTable = (timing: Timing) => {
  const entries = Object.entries(timing);
  const total = entries.reduce((acc, cur) => acc + cur[1], 0);

  const rows = entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map((row) => {
      const ms = row[1];
      return [row[0], ms.toFixed(3), `${((ms / total) * 100).toFixed(1)}%`];
    });

  rows.unshift(['Rule', 'Time (ms)', 'Relative']);

  return table(rows, {
    align: ['l', 'r', 'r'],
  });
};

export default createCommand({
  name: 'run',
  summary: 'Running an audit.',
  args: {
    paths: {
      type: 'string',
      array: true,
      description: 'Path list of the page to be audit.',
    },
  },
  options: {
    origin: {
      type: 'string',
      alias: 'o',
      description: 'Target server URL origin.',
    },
    command: {
      type: 'string',
      alias: 'C',
      description: 'Command to launch the local server.',
    },
    reporter: {
      type: 'string',
      alias: 'r',
      description: 'Name of the reporter. (default: "pretty")',
    },
    parallel: {
      type: 'number',
      alias: 'p',
      default: os.cpus().length,
      description: 'Number of parallel audit browsers.',
    },
    config: {
      type: 'string',
      alias: 'c',
      description:
        'Provide path to a acot configuration file (e.g. "./acot.config.js")',
    },
    viewport: {
      type: 'string',
      alias: 'V',
      description:
        'Viewport used for browser access. One of JSON string or "<number>x<number>".',
    },
    'working-dir': {
      type: 'string',
      description:
        'Directory path used by acot store temporary files. (default: ".acot")',
    },
    'max-warnings': {
      type: 'number',
      description: 'Warning threshold to be treated as an error.',
    },
    'connection-timeout': {
      type: 'number',
      default: 1000 * 60,
      description: 'Timeout ms for connecting to the host server.',
    },
    'browser-timeout': {
      type: 'number',
      default: 1000 * 30,
      description: 'Timeout ms to wait for pooled browsers.',
    },
    'ready-timeout': {
      type: 'number',
      default: 1000 * 30,
      description: 'Timeout ms waiting for page load.',
    },
    performance: {
      type: 'boolean',
      default: false,
      description: 'Dump the execution time per rule.',
    },
    'chrome-channel': {
      type: 'string',
      description:
        'Channel to search local Chromium. One of "puppeteer", "canary", "stable", "*". (default: "*")',
    },
    'chrome-executable-path': {
      type: 'string',
      description: 'Executable Chromium path.',
    },
    'launch-options': {
      type: 'string',
      description: 'JSON string of launch config for Puppeteer.',
    },
  },
})(async ({ logger, cwd, args }) => {
  // configure
  let config: ResolvedConfig;
  try {
    const base = await loadConfig(args.config ?? '.', { cwd });

    const found = await findChrome({
      executablePath: args['chrome-executable-path'],
      channel: (args['chrome-channel'] ??
        base.chromeChannel ??
        '*') as ChromeChannel,
    });

    if (found == null) {
      throw new Error('Executable Chromium was not found.');
    }

    debug('found chromium: %O', found);

    const launchOptions = args['launch-options']
      ? JSON.parse(args['launch-options'])
      : base.launchOptions;

    const connection = base.connection ?? {};
    const override: ResolvedConfig = {
      workingDir: path.resolve(
        cwd,
        args['working-dir'] ?? base.workingDir ?? '.acot',
      ),
      launchOptions: {
        ...launchOptions,
        executablePath: found.executablePath,
      },
      connection: {
        ...connection,
        command: args['command'] ?? connection?.command ?? undefined,
        timeout: args['connection-timeout'] ?? connection?.timeout ?? undefined,
      },
      paths: args.paths!.length > 0 ? args.paths : [],
      rules: {},
    };

    if (args.origin) {
      override.origin = args.origin;
    }

    if (args.viewport) {
      override.viewport = parseViewport(args.viewport);
    }

    config = mergeConfig(base, override);

    debug('merged config: %O', config);
  } catch (e) {
    logger.error('invalid config:', e);
    return 1;
  }

  // core
  const acot = new Acot({
    launchOptions: config.launchOptions,
    parallel: args.parallel,
    plugins: config.plugins,
    origin: config.origin!,
    workingDir: config.workingDir!,
    viewport: config.viewport,
    browserTimeout: args['browser-timeout'],
    readyTimeout: args['ready-timeout'],
    cwd,
  });

  // reporter
  let report: Reporter;
  try {
    const cfg: ReporterFactoryConfig<any> = {
      stdout: logger.getStdout(),
      stderr: logger.getStderr(),
      verbose: !!args.verbose || isCI,
      options: {},
      config,
    };

    if (args.reporter == null && config.reporter != null) {
      report = config.reporter.uses({
        ...cfg,
        options: config.reporter.with ?? {},
      });
    } else {
      const loader = new ReporterLoader(cwd);
      const factory = loader.load(args.reporter || 'pretty');
      report = factory(cfg);
    }
  } catch (e) {
    logger.error(e);
    return 1;
  }

  // runner
  let runner: Runner;
  try {
    const cfg: RunnerFactoryConfig = {
      core: acot,
      config,
      options: {},
    };

    if (config.runner != null) {
      runner = config.runner.uses({
        ...cfg,
        options: config.runner.with ?? {},
      });
    } else {
      runner = createDefaultRunner(cfg);
    }
  } catch (e) {
    logger.error(e);
    return 1;
  }

  // run
  try {
    report(runner);

    const summary = await runner.run();

    if (args.performance) {
      logger.print(generateTimingTable(summary.timing));
      logger.print('');
    }

    const maxWarnings = args['max-warnings'];
    let code = summary.errorCount > 0 ? 1 : 0;

    if (
      code === 1 &&
      maxWarnings != null &&
      maxWarnings >= 0 &&
      summary.warningCount > maxWarnings
    ) {
      code = 1;
    }

    return code;
  } catch (e) {
    logger.error(e);
    return 1;
  }
});
