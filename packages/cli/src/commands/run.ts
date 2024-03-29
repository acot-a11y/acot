import os from 'os';
import path from 'path';
import { loadConfig, mergeConfig } from '@acot/config';
import { Acot } from '@acot/core';
import type { ChromeChannel } from '@acot/find-chrome';
import { findChrome } from '@acot/find-chrome';
import { ReporterLoader } from '@acot/reporter';
import { RunnerLoader } from '@acot/runner';
import type {
  Reporter,
  ReporterFactoryConfig,
  ResolvedConfig,
  Runner,
  RunnerFactoryConfig,
} from '@acot/types';
import { parseViewport } from '@acot/utils';
import isCI from 'is-ci';
import { createCommand } from '../command';
import { debug } from '../logging';

const DEFAULT_REPORTER = '@acot/pretty';
const DEFAULT_RUNNER = '@acot';

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
    reporters: {
      type: 'array',
      description: `List of the reporter names. (default: "${DEFAULT_REPORTER}")`,
    },
    runner: {
      type: 'string',
      description: `Name of the runner. (default: "${DEFAULT_RUNNER}")`,
    },
    'runner-with': {
      type: 'string',
      description: 'Runner options. Specify the JSON as a string.',
    },
    parallel: {
      type: 'number',
      alias: 'p',
      default: os.cpus().length - 1,
      description:
        'Number of parallel audit browsers. (default: "os.cpus().length - 1")',
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
    presets: config.presets,
    origin: config.origin!,
    workingDir: config.workingDir!,
    viewport: config.viewport,
    browserTimeout: args['browser-timeout'],
    readyTimeout: args['ready-timeout'],
    cwd,
  });

  // reporter
  const reporters: Reporter[] = [];
  try {
    const cfg: ReporterFactoryConfig<any> = {
      stdout: logger.getStdout(),
      stderr: logger.getStderr(),
      verbose: !!args.verbose || isCI,
      config,
      options: {},
    };

    if (args.reporters == null && config.reporters != null) {
      config.reporters.forEach((reporter) => {
        reporters.push(
          reporter.uses({
            ...cfg,
            options: reporter.with ?? {},
          }),
        );
      });
    } else {
      const loader = new ReporterLoader(cwd);
      (args.reporters ?? [DEFAULT_REPORTER]).forEach((reporter) => {
        if (typeof reporter === 'string') {
          reporters.push(loader.load(reporter)(cfg));
        }
      });
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
      options: {
        ...(config.runner?.with ?? {}),
        ...JSON.parse(args['runner-with'] ?? '{}'),
      },
    };

    if (args.runner == null && config.runner != null) {
      runner = config.runner.uses(cfg);
    } else {
      const loader = new RunnerLoader(cwd);
      runner = loader.load(args.runner || DEFAULT_RUNNER)(cfg);
    }
  } catch (e) {
    logger.error(e);
    return 1;
  }

  // run
  try {
    reporters.forEach((report) => report(runner));

    const summary = await runner.run();

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
