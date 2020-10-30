import stripAnsi from 'strip-ansi';
import type { MockLogger } from '@acot/mock-logger';
import type { CommandRunner, CommandDefinition } from '../../command';
import { createCommand } from '../../command';
import { createMockLogger } from '../../__mocks__/logger';
import { CommandContainer } from '../../command-container';

describe('command/help', () => {
  let run: CommandRunner<any>;
  let logger: MockLogger;

  const factory = (definition: Partial<CommandDefinition<any, any>>) =>
    createCommand({
      name: 'command',
      summary: `${definition.name ?? 'command'} summary`,
      options: {},
      args: {},
      ...definition,
    })({} as any);

  const container = new CommandContainer([
    factory({
      name: 'with-options',
      options: {
        opt1: { type: 'boolean', description: 'opt1 desc' },
        opt2: { type: 'boolean', description: 'opt2 desc', alias: 'o' },
        opt3: { type: 'boolean', description: 'opt3 desc', alias: ['p'] },
      },
    }),
    factory({
      name: 'without-options',
      options: {},
      args: {
        files: {
          type: 'string',
          array: true,
        },
      },
    }),
    factory({
      name: 'parent',
      options: {
        'the-name-of-a-long-command-option': {
          type: 'string',
          description: 'description of command options.',
          alias: 't',
        },
      },
      commands: [
        factory({
          name: 'sub1',
          options: {
            opt1: { type: 'boolean', description: 'opt1 desc', alias: 'o' },
          },
        }),
        factory({ name: 'sub2' }),
      ],
    }),
  ]);

  const pkg = {
    description: 'This is help command test.',
  };

  beforeEach(async () => {
    run = (await import('../help')).default.run;
    logger = createMockLogger();
  });

  afterEach(() => {
    // logger.destroy();
  });

  test('no arguments', async () => {
    const code = await run({
      logger,
      container,
      pkg,
      args: {},
    } as any);

    expect(code).toBe(0);
    expect(logger.stdout.map(stripAnsi)[0]).toMatchSnapshot();
  });

  test('command - with options', async () => {
    const code = await run({
      logger,
      container,
      pkg,
      args: {
        command: ['with-options'],
      },
    } as any);

    expect(code).toBe(0);
    expect(logger.stdout.map(stripAnsi)[0]).toMatchSnapshot();
  });

  test('command - without options', async () => {
    const code = await run({
      logger,
      container,
      pkg,
      args: {
        command: ['without-options'],
      },
    } as any);

    expect(code).toBe(0);
    expect(logger.stdout.map(stripAnsi)[0]).toMatchSnapshot();
  });

  test('command - parent', async () => {
    const code = await run({
      logger,
      container,
      pkg,
      args: {
        command: ['parent'],
      },
    } as any);

    expect(code).toBe(0);
    expect(logger.stdout.map(stripAnsi)[0]).toMatchSnapshot();
  });

  test('subcommand', async () => {
    const code = await run({
      logger,
      container,
      pkg,
      args: {
        command: ['parent', 'sub1'],
      },
    } as any);

    expect(code).toBe(0);
    expect(logger.stdout.map(stripAnsi)[0]).toMatchSnapshot();
  });

  test('nonexistent command', async () => {
    const code = await run({
      logger,
      container,
      pkg,
      args: {
        command: ['notfound'],
      },
    } as any);

    expect(code).toBe(1);
    expect(logger.stdout.length).toBe(0);
    expect(logger.stderr.map(stripAnsi)[0]).toMatchSnapshot();
  });
});
