import { MockLogger } from '@acot/mock';
import type { CommandModule } from '../command';
import type { CLI } from '../cli';
import { createCommand } from '../command';
import { CommandContainer } from '../command-container';

process.setMaxListeners(Infinity);

describe('CLI', () => {
  let logger: MockLogger;
  const pkg = { name: 'acot' };

  const factory = (
    name: string,
    fn: any = jest.fn().mockResolvedValue(0),
    commands: CommandModule<any, any>[] = [],
  ): CommandModule<any, any> & {
    mock: jest.Mock<any>;
  } => {
    const cmd = createCommand<any, any>({
      name,
      summary: '...',
      args: {},
      options: {},
      commands,
    })(fn);

    return {
      ...cmd,
      mock: fn,
    };
  };

  const createCLI = async (...args: ConstructorParameters<typeof CLI>) => {
    const { CLI } = await import('../cli');
    return new CLI(...args);
  };

  beforeEach(() => {
    logger = new MockLogger();
  });

  afterEach(() => {
    jest.resetModules();
  });

  test('options - version', async () => {
    const cmd = factory('version');
    const container = new CommandContainer([cmd]);
    const cli = await createCLI(pkg, logger, container);
    const code = await cli.run(['--version']);

    expect(code).toBe(0);
    expect(cmd.mock).toBeCalled();
  });

  test('options - help', async () => {
    const cmd = factory('help');
    const container = new CommandContainer([cmd]);
    const cli = await createCLI(pkg, logger, container);
    const code = await cli.run(['--help']);

    expect(code).toBe(0);
    expect(cmd.mock).toBeCalledWith(
      expect.objectContaining({
        args: expect.objectContaining({
          command: [],
        }),
      }),
    );
  });

  test('options - help with args', async () => {
    const cmd = factory('help');
    const container = new CommandContainer([cmd, factory('foo')]);
    const cli = await createCLI(pkg, logger, container);
    const code = await cli.run(['foo', '--help']);

    expect(code).toBe(0);
    expect(cmd.mock).toBeCalledWith(
      expect.objectContaining({
        args: expect.objectContaining({
          command: ['foo'],
        }),
      }),
    );
  });

  test('options - help without args', async () => {
    const cmd = factory('help');
    const container = new CommandContainer([cmd]);
    const cli = await createCLI(pkg, logger, container);
    const code = await cli.run([]);

    expect(code).toBe(0);
    expect(cmd.mock).toBeCalled();
  });

  test('options - quiet', async () => {
    const spy = jest.spyOn(logger, 'update');

    const cli = await createCLI(
      pkg,
      logger,
      new CommandContainer([factory('help')]),
    );

    await cli.run(['--quiet']);

    expect(spy.mock.calls[0][0].stdout!.constructor.name).toBe('PassThrough');
    expect(spy.mock.calls[0][0].stderr!.constructor.name).toBe('PassThrough');

    spy.mockRestore();
  });

  test('options - verbose', async () => {
    const spy = jest.spyOn(logger, 'update');

    jest.doMock('@acot/logger', () => ({
      Logger: MockLogger,
    }));

    const cli = await createCLI(
      pkg,
      logger,
      new CommandContainer([factory('help')]),
    );

    await cli.run(['--verbose']);

    expect(spy).toBeCalledWith({ level: 'verbose' });

    spy.mockRestore();
  });

  test('run command', async () => {
    const cmd = factory('foo');
    const container = new CommandContainer([cmd]);
    const cli = await createCLI(pkg, logger, container);
    const code = await cli.run(['foo']);

    expect(code).toBe(0);
    expect(cmd.mock).toBeCalled();
  });

  test('run nest command', async () => {
    const cmd = factory('bar');
    const container = new CommandContainer([factory('foo', null, [cmd])]);
    const cli = await createCLI(pkg, logger, container);
    const code = await cli.run(['foo', 'bar']);

    expect(code).toBe(0);
    expect(cmd.mock).toBeCalled();
  });

  test('parse error', async () => {
    const container = new CommandContainer([factory('foo')]);
    const cli = await createCLI(pkg, logger, container);
    const code = await cli.run(['--not-found']);

    expect(code).toBe(1);
  });

  test('non-existent commands', async () => {
    const container = new CommandContainer([factory('foo')]);
    const cli = await createCLI(pkg, logger, container);
    const code = await cli.run(['notfound']);

    expect(code).toBe(1);
  });
});
