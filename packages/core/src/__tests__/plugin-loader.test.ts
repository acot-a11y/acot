import path from 'path';
import { PluginLoader } from '../plugin-loader';

describe('PluginLoader', () => {
  let loader: PluginLoader;

  beforeEach(() => {
    loader = new PluginLoader(path.resolve(__dirname, 'fixtures'));
  });

  test('load - file', () => {
    const plugin = loader.load('./plugin');

    expect(plugin).toEqual({
      id: 'plugin',
      configs: new Map([
        [
          'a',
          {
            rules: { r1: 'off' },
          },
        ],
        [
          'b',
          {
            rules: { r2: 'warn' },
          },
        ],
      ]),
      rules: new Map([
        ['plugin/rule1', 'rule1'],
        ['plugin/rule2', 'rule2'],
        ['plugin/rule3', 'rule3'],
      ]),
    });
  });

  test('load - nest file', () => {
    const plugin = loader.load('./deep/plugin-name');

    expect(plugin).toEqual({
      id: 'plugin-name',
      configs: new Map(),
      rules: new Map([['plugin-name/rule1', 'rule1']]),
    });
  });

  test('load - package', () => {
    const plugin = loader.load('example');

    expect(plugin).toEqual({
      id: 'example',
      configs: new Map(),
      rules: new Map([
        ['example/example_rule1', 'example_rule1'],
        ['example/example_rule2', 'example_rule2'],
        ['example/example_rule3', 'example_rule3'],
      ]),
    });
  });

  test('load - scope package', () => {
    const plugin = loader.load('@scope/example');

    expect(plugin).toEqual({
      id: '@scope/example',
      configs: new Map(),
      rules: new Map([['@scope/example/scope1', 'scope1']]),
    });
  });

  test('load - not found', () => {
    expect(() => loader.load('__invalid_module__')).toThrowError(
      ReferenceError,
    );
  });

  test('cache', () => {
    const name = './plugin';
    const plugin1 = loader.load(name);
    const plugin2 = loader.load(name);
    expect(plugin1).toBe(plugin2);
  });
});
