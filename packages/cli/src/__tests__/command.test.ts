import yargs from 'yargs';
import { createCommand, buildCommand } from '../command';

describe('command', () => {
  const context: any = 'context';
  let parser: yargs.Argv<any>;
  let runner: jest.Mock;

  beforeEach(() => {
    parser = yargs
      .help(false)
      .version(false)
      .detectLocale(false)
      .parserConfiguration({
        'set-placeholder-key': true,
      })
      .fail((msg, err) => {
        throw err != null ? err : new Error(msg);
      })
      .strict();

    runner = jest.fn().mockResolvedValueOnce('run');
  });

  test('createCommand - options', async () => {
    const module = createCommand({
      name: 'test',
      summary: '...',
      options: {
        num: {
          type: 'number',
          alias: 'n',
          description: 'A number options',
          default: 5,
        },
      },
      args: {},
    })(runner);

    buildCommand(parser, module);

    expect(() => {
      parser.parse(['notfound']);
    }).toThrow();

    expect(parser.parse(['test']).num).toBe(5);
    expect(parser.parse(['test', '-n', '10']).num).toBe(10);
    expect(parser.parse(['test', '--num', '15']).num).toBe(15);

    module.run(context);

    expect(runner).toBeCalledWith(context);
  });

  test('createCommand - arguments', async () => {
    const module = createCommand({
      name: 'test',
      summary: '...',
      options: {},
      args: {
        value: {
          type: 'string',
        },
      },
    })(runner);

    buildCommand(parser, module);

    expect(parser.parse(['test']).value).toBeUndefined();
    expect(parser.parse(['test', 'foo']).value).toBe('foo');
    expect(parser.parse(['test', 'bar']).value).toBe('bar');
  });

  test('createCommand - sub command', async () => {
    const sub1 = createCommand({
      name: 'sub1',
      summary: '...',
      options: {
        opt1: {
          type: 'boolean',
          default: false,
        },
      },
      args: {},
    })(runner);

    const sub2 = createCommand({
      name: 'sub2',
      summary: '...',
      options: {
        opt2: {
          type: 'boolean',
          default: false,
        },
      },
      args: {},
    })(runner);

    const module = createCommand({
      name: 'parent',
      summary: '...',
      options: {},
      args: {},
      commands: [sub1, sub2],
    })(runner);

    buildCommand(parser, module);

    expect(parser.parse(['parent']).opt1).toBeUndefined();
    expect(parser.parse(['parent']).opt2).toBeUndefined();

    expect(parser.parse(['parent', 'sub1']).opt1).toBe(false);
    expect(parser.parse(['parent', 'sub1', '--opt1']).opt1).toBe(true);
    expect(parser.parse(['parent', 'sub1', '--opt1']).opt2).toBeUndefined();

    expect(parser.parse(['parent', 'sub2']).opt2).toBe(false);
    expect(parser.parse(['parent', 'sub2', '--opt2']).opt2).toBe(true);
    expect(parser.parse(['parent', 'sub2', '--opt2']).opt1).toBeUndefined();

    expect(() => {
      parser.parse(['parent', 'notfound']);
    }).toThrow();

    expect(() => {
      parser.parse(['parent', '--opt1']);
    }).toThrow();

    expect(() => {
      parser.parse(['parent', 'sub1', '--unknown']);
    }).toThrow();
  });

  test('buildCommand', () => {
    const mock = {
      command: jest.fn(),
    };

    const module = createCommand({
      name: 'test',
      summary: '...',
      options: {},
      args: {
        a: { type: 'boolean' },
        b: { type: 'string', array: true },
        c: { type: 'number', demandOption: true },
      },
    })(runner);

    buildCommand(mock as any, module);

    expect(mock.command).toBeCalledTimes(1);
    expect(mock.command).toBeCalledWith('test [a] [b..] <c>', '', module.build);
  });
});
