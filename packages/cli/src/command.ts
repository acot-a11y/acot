import type { PackageJson } from 'type-fest';
import type yargs from 'yargs';
import type { Logger } from '@acot/logger';
import type { CommandContainer } from './command-container';
import type { globalOptions } from './global-options';

export type CommandOption = {
  [key: string]: yargs.Options;
};

export type CommandArgs<T extends CommandOption> = yargs.InferredOptionTypes<T>;

export type CommandContext<T extends CommandOption> = {
  cwd: string;
  pkg: PackageJson;
  args: CommandArgs<T>;
  container: CommandContainer;
  logger: Logger;
};

export type CommandRunner<T extends CommandOption> = (
  context: CommandContext<T>,
) => Promise<number>;

export type CommandDefinition<
  O extends CommandOption = CommandOption,
  A extends CommandOption = CommandOption
> = {
  name: string;
  summary: string;
  options: O;
  args: A;
  commands?: CommandModule<any, any>[];
};

export type CommandModule<
  O extends CommandOption = CommandOption,
  A extends CommandOption = CommandOption
> = CommandDefinition<O, A> & {
  run: CommandRunner<O & A>;
  build: yargs.BuilderCallback<any, any>;
};

export type CommandList = Map<string, CommandModule<any, any>>;

export type CommandFactory<
  O extends CommandOption = {},
  A extends CommandOption = {}
> = (
  runner: CommandRunner<O & A & typeof globalOptions>,
) => CommandModule<O, A>;

const buildCommandSignature = (name: string, args: CommandOption): string => {
  const arr = [name];

  Object.entries(args).forEach(([key, opts]) => {
    const inner = opts.array ? `${key}..` : key;
    arr.push(opts.demandOption ? `<${inner}>` : `[${inner}]`);
  });

  return arr.join(' ');
};

export const buildCommand = <
  O extends CommandOption = {},
  A extends CommandOption = {}
>(
  yargs: yargs.Argv<any>,
  module: CommandModule<O, A>,
): yargs.Argv<any> => {
  return yargs.command(
    buildCommandSignature(module.name, module.args),
    '',
    module.build,
  );
};

export const createCommand = <
  O extends CommandOption = {},
  A extends CommandOption = {}
>(
  definition: CommandDefinition<O, A>,
): CommandFactory<O, A> => {
  return (run) => {
    return {
      ...definition,
      build: (yargs) => {
        yargs.options(definition.options);

        Object.entries(definition.args).forEach(([key, opts]) => {
          yargs.positional(key, opts as any);
        });

        if (definition.commands != null) {
          definition.commands.forEach((module) => {
            buildCommand(yargs, module);
          });
        }

        return yargs;
      },
      run,
    };
  };
};
