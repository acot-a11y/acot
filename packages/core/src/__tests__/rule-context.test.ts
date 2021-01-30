import path from 'path';
import fs from 'fs';
import type { CreateRuleContextParams } from '../rule-context';

describe('rule-context', () => {
  const page = {
    content: async () => 'content',
  };

  const defaults: CreateRuleContextParams = {
    process: 1,
    status: 'error',
    rule: 'rule',
    url: 'http://localhost:1234/path/to',
    help: '',
    workingDir: __dirname,
    page: page as any,
    options: ['error' as const, null],
    results: [],
    measure: () => 0,
  };

  const factory = async (partial: Partial<CreateRuleContextParams> = {}) => {
    const { createRuleContext } = await import('../rule-context');

    return createRuleContext({
      ...defaults,
      ...partial,
    });
  };

  let writeFile: jest.SpyInstance;

  beforeEach(() => {
    jest.doMock('puppeteer-element2selector', () => ({
      element2selector: () => '#selector',
    }));

    writeFile = jest
      .spyOn<any, any>(fs, 'writeFile')
      .mockImplementation((...args: any[]) => {
        args.forEach((arg) => {
          if (typeof arg === 'function') {
            arg();
          }
        });
      });
  });

  afterEach(() => {
    jest.resetModules();
    writeFile.mockRestore();
  });

  test('normalize options', async () => {
    expect((await factory()).options).toEqual({});

    expect(
      (await factory({ options: ['error', { foo: 'bar' }] })).options,
    ).toEqual({
      foo: 'bar',
    });
  });

  test('report - with node', async () => {
    const results: any[] = [];

    const ctx = await factory({
      results,
    });

    const node = {
      evaluate: jest.fn().mockResolvedValueOnce('html'),
      screenshot: jest.fn().mockReturnValueOnce(Promise.resolve()),
    };

    await ctx.report({
      message: 'msg',
      help: '',
      node: node as any,
    });

    const htmlpath = 'http-localhost-1234-path-to-rule-1.html';
    const imagepath = 'http-localhost-1234-path-to-rule-1.png';

    expect(writeFile.mock.calls[0][0]).toBe(
      path.join(defaults.workingDir, htmlpath),
    );

    expect(writeFile.mock.calls[0][1]).toBe('content');
    expect(writeFile.mock.calls[0][2]).toBe('utf8');

    expect(node.screenshot).toBeCalledWith({
      path: path.join(defaults.workingDir, imagepath),
    });

    expect(results).toEqual([
      {
        duration: 0,
        htmlpath,
        imagepath,
        process: defaults.process,
        rule: defaults.rule,
        help: defaults.help,
        status: defaults.status,
        message: 'msg',
        selector: '#selector',
      },
    ]);
  });

  test('report - with screenshot failure', async () => {
    const results: any[] = [];

    const ctx = await factory({
      results,
    });

    const node = {
      evaluate: jest.fn().mockResolvedValueOnce('html'),
      screenshot: jest.fn().mockReturnValueOnce(Promise.reject()),
    };

    await ctx.report({
      message: 'msg',
      help: '',
      node: node as any,
    });

    const htmlpath = 'http-localhost-1234-path-to-rule-1.html';
    const imagepath = 'http-localhost-1234-path-to-rule-1.png';

    expect(writeFile.mock.calls[0][0]).toBe(
      path.join(defaults.workingDir, htmlpath),
    );

    expect(writeFile.mock.calls[0][1]).toBe('content');
    expect(writeFile.mock.calls[0][2]).toBe('utf8');

    expect(node.screenshot).toBeCalledWith({
      path: path.join(defaults.workingDir, imagepath),
    });

    expect(results).toEqual([
      {
        duration: 0,
        htmlpath,
        imagepath: null,
        process: defaults.process,
        rule: defaults.rule,
        help: defaults.help,
        status: defaults.status,
        message: 'msg',
        selector: '#selector',
      },
    ]);
  });

  test('report - without node', async () => {
    const results: any[] = [];

    const ctx = await factory({
      results,
    });

    await ctx.report({
      message: 'msg',
      help: '',
    });

    const htmlpath = 'http-localhost-1234-path-to-rule-1.html';

    expect(writeFile.mock.calls[0][0]).toBe(
      path.join(defaults.workingDir, htmlpath),
    );

    expect(writeFile.mock.calls[0][1]).toBe('content');
    expect(writeFile.mock.calls[0][2]).toBe('utf8');

    expect(results).toEqual([
      {
        duration: 0,
        htmlpath,
        imagepath: null,
        process: defaults.process,
        rule: defaults.rule,
        help: defaults.help,
        status: defaults.status,
        selector: null,
        message: 'msg',
      },
    ]);
  });

  test('report - help', async () => {
    const results: any[] = [];

    const ctx = await factory({
      results,
      help: 'https://acot.example/1',
    });

    await ctx.report({
      message: 'msg',
      help: 'https://acot.example/2',
    });

    expect(results).toEqual([
      expect.objectContaining({
        help: 'https://acot.example/2',
      }),
    ]);
  });
});
