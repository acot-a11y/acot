import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import type { Config } from '@acot/types';
import chalk from 'chalk';
import enquirer from 'enquirer';
import execa from 'execa';
import Listr from 'listr';
import { emojify } from 'node-emoji';
import prettier from 'prettier';
import isURL from 'validator/lib/isURL';
import { createCommand } from '../command';
import { debug } from '../logging';

const writeFile = promisify(fs.writeFile);

const FORMATS = [
  { name: 'javascript', message: 'JavaScript', hint: 'acot.config.js' },
  { name: 'json', message: 'JSON', hint: '.acotrc.json' },
];

const NPM_CLIENTS = ['npm', 'yarn'];

type PromptResult = {
  origin: string;
  server: string;
  command: string | null;
  useConfig: boolean;
  runner: string;
  format: string;
  installPuppeteer: boolean;
  npmClient: string;
};

type Validator = (value: string) => string | boolean;

const prompt = async <T = string>(
  option: Parameters<typeof enquirer.prompt>[0],
): Promise<T> => {
  const opts = option as any;
  const res = await enquirer.prompt(opts);
  return (res as any)[opts.name] as T;
};

const assertWith = (value: string, validator: Validator) => {
  const res = validator(value);
  if (typeof res === 'string') {
    throw new TypeError(res);
  }
};

const validateOrigin: Validator = (value) => {
  const val = value.trim();

  if (!val) {
    return 'Required!';
  }

  if (
    !isURL(val, {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_tld: false,
    })
  ) {
    return 'URL Origin must be valid URL. (e.g. https://example.com)';
  }

  return true;
};

const validateFormat: Validator = (value) => {
  const val = value.trim();
  const names = FORMATS.map((o) => o.name);

  if (!names.includes(val)) {
    return `Config file format must be one of the following: ${names.join(
      ', ',
    )}`;
  }

  return true;
};

const validateNpmClient: Validator = (value) => {
  const val = value.trim();

  if (NPM_CLIENTS.includes(val)) {
    return `npm client must be one of the following: ${NPM_CLIENTS.join(', ')}`;
  }

  return true;
};

const isPuppeteerInstalled = (): boolean => {
  try {
    require('puppeteer');
    return true;
  } catch {
    return false;
  }
};

const promptUserIfNeeded = async (defaults: Partial<PromptResult>) => {
  const result: PromptResult = {
    origin: '',
    server: '',
    command: null,
    useConfig: false,
    runner: '',
    format: '',
    installPuppeteer: false,
    npmClient: '',
  };

  if (defaults.origin !== undefined) {
    result.origin = defaults.origin!.trim();
  } else {
    result.origin = await prompt({
      type: 'input',
      name: 'origin',
      message: 'What is the origin for the audit target?',
      validate: validateOrigin,
      result(value) {
        return value.trim().replace(/\/$/, '');
      },
    });
  }

  if (defaults.server !== undefined) {
    result.server = defaults.server;
  } else {
    result.server = await prompt({
      type: 'select',
      name: 'server',
      message: 'What kind of server do you want to connect to?',
      choices: [
        {
          name: 'exiting',
          message: 'Running server',
          hint: '(e.g. https://example.com)',
        },
        {
          name: 'command',
          message: 'Local server',
          hint: '(e.g. http://localhost:8000)',
        },
      ],
    });
  }

  if (defaults.command !== undefined) {
    result.command = defaults.command!.trim();
  } else if (result.server === 'command') {
    result.command = await prompt({
      type: 'input',
      name: 'command',
      message: 'What is the command to start the server?',
      validate(value) {
        const val = value.trim();
        if (!val) {
          return 'Required';
        }
        return true;
      },
      result(value) {
        return value.trim();
      },
    });
  }

  if (defaults.useConfig !== undefined) {
    result.useConfig = defaults.useConfig;
  } else {
    result.useConfig = await prompt<boolean>({
      type: 'toggle',
      name: 'useConfig',
      message: 'Do you want to use the config recommended by acot?',
      initial: 1,
    });
  }

  if (defaults.runner !== undefined) {
    result.runner = defaults.runner;
  } else {
    result.runner = await prompt({
      type: 'select',
      name: 'runner',
      message: 'Which Runner do you want to use?',
      choices: [
        {
          name: 'default',
          message: 'Default runner',
        },
        {
          name: '@acot/storybook',
          message: 'Storybook runner',
        },
      ],
      result(value) {
        return value === 'default' ? '' : value;
      },
    });
  }

  if (defaults.format !== undefined) {
    result.format = defaults.format!.trim();
  } else {
    result.format = await prompt({
      type: 'select',
      name: 'format',
      message: 'Which format do you prefer for the config file?',
      choices: FORMATS,
      initial: 0,
      validate: validateFormat,
    });
  }

  if (defaults.installPuppeteer !== undefined) {
    result.installPuppeteer = defaults.installPuppeteer;
  } else {
    if (isPuppeteerInstalled()) {
      result.installPuppeteer = false;
    } else {
      result.installPuppeteer = await prompt({
        type: 'toggle',
        name: 'installPuppeteer',
        message: 'Do you want to install Puppeteer as a dependency?',
        initial: 1,
      });
    }
  }

  if (defaults.npmClient !== undefined) {
    result.npmClient = defaults.npmClient!.trim();
  } else {
    result.npmClient = await prompt({
      type: 'select',
      name: 'npmClient',
      message:
        'Which is the npm client used to install the dependent packages?',
      choices: NPM_CLIENTS,
      initial: 0,
      validate: validateNpmClient,
    });
  }

  return result;
};

const result2string = (result: PromptResult) => {
  const config: Config = {};

  if (result.useConfig) {
    config.extends = ['@acot'];
  }

  if (result.command) {
    config.connection = {
      command: result.command!,
    };
  }

  if (result.runner) {
    config.runner = result.runner;
  }

  config.origin = result.origin;

  if (result.runner !== '@acot/storybook') {
    config.paths = ['/'];
  }

  const content = JSON.stringify(config, null, '  ');

  switch (result.format) {
    case 'javascript': {
      return prettier.format(`module.exports = ${content}`, {
        parser: 'babel',
        semi: true,
        singleQuote: true,
        trailingComma: 'all',
      });
    }

    case 'json': {
      return prettier.format(content, {
        parser: 'json',
      });
    }

    default:
      throw new Error('Invalid config format');
  }
};

export default createCommand({
  name: 'init',
  summary: 'Building a config file and installing dependent packages.',
  args: {},
  options: {
    origin: {
      type: 'string',
      alias: 'o',
      description: 'Audit server base URL.',
    },
    command: {
      type: 'string',
      alias: 'C',
      description: 'Command to launch the local server.',
    },
    'use-recommended-config': {
      type: 'boolean',
      description: 'Use the config recommended by acot.',
    },
    runner: {
      type: 'string',
      alias: 'r',
      description: 'Runner to use for audit.',
    },
    format: {
      type: 'string',
      alias: 's',
      description: 'Format to use for the configuration file.',
    },
    'install-puppeteer': {
      type: 'boolean',
      description: 'Install Puppeteer as a dependency.',
    },
    'no-install-puppeteer': {
      type: 'boolean',
      description: 'Not install Puppeteer as a dependency.',
    },
    'npm-client': {
      type: 'string',
      description:
        'npm client to use for dependent packages installations. (npm or yarn)',
    },
  },
})(async ({ cwd, logger, args }) => {
  // collect configuration data
  const defaults: Partial<PromptResult> = {};

  if (args.origin) {
    defaults.origin = args.origin;
    assertWith(defaults.origin, validateOrigin);
  }

  if (args.command) {
    defaults.server = 'command';
    defaults.command = args.command;
  }

  if (args['use-recommended-config']) {
    defaults.useConfig = true;
  }

  if (args.runner) {
    defaults.runner = args.runner;
  }

  if (args.format) {
    defaults.format = args.format;
    assertWith(defaults.format, validateFormat);
  }

  if (args['install-puppeteer']) {
    defaults.installPuppeteer = true;
  } else if (args['no-install-puppeteer']) {
    defaults.installPuppeteer = false;
  }

  if (args['npm-client']) {
    defaults.npmClient = args['npm-client'];
    assertWith(defaults.npmClient, validateNpmClient);
  }

  let result: PromptResult;
  try {
    result = await promptUserIfNeeded(defaults);
  } catch (e) {
    // cancel
    if (typeof e === 'string' && e === '') {
      return 0;
    }

    throw e;
  }

  debug('prompt result:', result);

  // tasks
  const tasks = new Listr([
    {
      title: 'Create config file',
      task: () => {
        const content = result2string(result);

        let filepath = '';
        switch (result.format) {
          case 'javascript':
            filepath = path.resolve(cwd, 'acot.config.js');
            break;
          case 'json':
            filepath = path.resolve(cwd, '.acotrc.json');
            break;
        }

        return writeFile(filepath, content, 'utf8');
      },
    },

    {
      title: `Install package dependencies with ${result.npmClient}`,
      enabled: () =>
        !!(result.useConfig || result.runner || result.installPuppeteer),
      task: () => {
        const deps: string[] = [];

        if (result.useConfig) {
          deps.push('@acot/acot-config');
        }

        if (result.installPuppeteer) {
          deps.push('puppeteer');
        }

        switch (result.runner) {
          case '@acot/storybook':
            deps.push('@acot/acot-runner-storybook');
            break;
        }

        switch (result.npmClient) {
          case 'npm':
            return execa('npm', ['install', '-D', ...deps]);
          case 'yarn':
            return execa('yarn', ['add', '-D', ...deps]);
          default:
            throw new Error('Invalid npm client');
        }
      },
    },
  ]);

  logger.print('');
  logger.print(chalk`{gray.bold (Setup acot)}`);

  await tasks.run();

  logger.print(
    [
      '',
      emojify(chalk`{bold Welcome to acot!} :tada:`),
      '',
      chalk`You can start taking the first step in making your site accessible with \`{cyan.bold $ npx acot run}\`.`,
      'We hope that acot will help you with your accessibility efforts.',
      'Enjoy!',
      '',
    ].join('\n'),
  );

  return 0;
});
