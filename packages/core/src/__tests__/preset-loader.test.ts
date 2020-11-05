import path from 'path';
import { PresetLoader } from '../preset-loader';

describe('PresetLoader', () => {
  let loader: PresetLoader;

  beforeEach(() => {
    loader = new PresetLoader(path.resolve(__dirname, 'fixtures'));
  });

  test('load - file', () => {
    const preset = loader.load('./preset');

    expect(preset).toEqual({
      id: 'preset',
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
        ['preset/rule1', 'rule1'],
        ['preset/rule2', 'rule2'],
        ['preset/rule3', 'rule3'],
      ]),
    });
  });

  test('load - nest file', () => {
    const preset = loader.load('./deep/preset-name');

    expect(preset).toEqual({
      id: 'preset-name',
      configs: new Map(),
      rules: new Map([['preset-name/rule1', 'rule1']]),
    });
  });

  test('load - package', () => {
    const preset = loader.load('example');

    expect(preset).toEqual({
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
    const preset = loader.load('@scope/example');

    expect(preset).toEqual({
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
    const name = './preset';
    const preset1 = loader.load(name);
    const preset2 = loader.load(name);
    expect(preset1).toBe(preset2);
  });
});
