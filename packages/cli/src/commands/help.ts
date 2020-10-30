import chalk from 'chalk';
import type yargs from 'yargs';
import { createCommand } from '../command';
import { globalOptions } from '../global-options';
import { buildUsage } from '../utils/usage';

const buildOptionName = (name: string, opts: yargs.Options) => {
  if (opts.alias != null) {
    const aliases = typeof opts.alias === 'string' ? [opts.alias] : opts.alias;
    const alias = aliases.map((s) => `-${s}`).join(', ');
    return `${alias}, --${name}`;
  }

  return `    --${name}`;
};

const globalOptionContent = {
  header: 'GLOBAL OPTIONS',
  content: Object.entries(globalOptions).map(([name, opts]) => ({
    name: buildOptionName(name, opts),
    summary: opts.description,
  })),
};

export default createCommand({
  name: 'help',
  summary: 'Show help.',
  args: {
    command: {
      type: 'string',
      array: true,
    },
  },
  options: {},
})(async ({ logger, pkg, args, container }) => {
  const command = args.command ?? [];
  const name = command.join('.');

  // command help
  if (name !== '') {
    const module = container.get(name);
    if (module == null) {
      logger.error(`"${name}" command does not exists`);
      return 1;
    }

    let usage = `acot ${command.join(' ')}`;

    if (module.commands != null) {
      usage += ' <command>';
    }

    const args = Object.entries(module.args);
    if (args.length > 0) {
      const multiple = args.length > 1;
      const overview = args
        .map(([arg, opts]) => {
          return opts.array === true ? `<${arg}..>` : `<${arg}>`;
        })
        .join(' | ');

      usage += ` ${multiple ? '{' : ''}${overview}${multiple ? '}' : ''}`;
    }

    if (Object.keys(module.options).length > 0) {
      usage += ' [flags]';
    }

    const availableCommands =
      module.commands != null
        ? module.commands.map((cmd) => ({
            name: cmd.name,
            summary: cmd.summary,
          }))
        : [];

    const cmdOptions = Object.entries(module.options).map(([key, opts]) => ({
      name: buildOptionName(key, opts),
      summary: opts.description!,
    }));

    logger.print(
      buildUsage([
        {
          content: module.summary,
          raw: true,
        },
        {
          header: 'USAGE',
          content: usage,
        },
        ...(availableCommands.length > 0
          ? [
              {
                header: 'AVAILABLE COMMANDS',
                content: availableCommands,
              },
            ]
          : []),
        ...(cmdOptions.length > 0
          ? [
              {
                header: 'COMMAND OPTIONS',
                content: cmdOptions,
              },
            ]
          : []),
        globalOptionContent,
      ]),
    );

    return 0;
  }

  // global help
  logger.print(
    buildUsage([
      {
        content: pkg.description!,
        raw: true,
      },
      {
        header: 'USAGE',
        content: `acot <command> [subcommand..] [flags]`,
      },
      {
        header: 'AVAILABLE COMMANDS',
        content: container.main().map((module) => ({
          name: module.name,
          summary: module.summary,
        })),
      },
      globalOptionContent,
      {
        content: chalk`{gray Run {bold \`acot help [command..]\`} for help with a specific command.}`,
        raw: true,
      },
    ]),
  );

  return 0;
});
