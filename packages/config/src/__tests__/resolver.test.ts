import path from 'path';
import { resolveConfig } from '../resolver';

const FIXTURES_DIR = path.resolve(__dirname, 'fixtures');

describe('resolveConfig', () => {
  const result = {
    rules: {},
  };

  test('empty', async () => {
    const resolved = await resolveConfig({});

    expect(resolved).toEqual(result);
  });

  test('normalize rules', async () => {
    const resolved = await resolveConfig({
      rules: {
        rule1: 'warn',
        rule2: ['off', { opts: true }],
      },
    });

    expect(resolved).toEqual({
      ...result,
      rules: {
        rule1: ['warn', null],
        rule2: ['off', { opts: true }],
      },
    });
  });

  test('normalize launchOptions', async () => {
    const resolved = await resolveConfig({
      launchOptions: {
        headless: false,
      },
    });

    expect(resolved).toEqual({
      ...result,
      launchOptions: {
        headless: false,
      },
    });
  });

  test('normalize viewport', async () => {
    const resolved = await resolveConfig({
      viewport: '1000x800',
    });

    expect(resolved).toEqual({
      ...result,
      viewport: {
        width: 1000,
        height: 800,
      },
    });
  });

  test('extends', async () => {
    const resolved = await resolveConfig(
      {
        extends: ['./external.json'],
        rules: {
          rule2: 'error',
        },
      },
      {
        cwd: FIXTURES_DIR,
      },
    );

    expect(resolved).toEqual({
      ...result,
      rules: {
        rule1: ['warn', null],
        rule2: ['error', null],
        rule3: ['warn', null],
      },
    });
  });

  test('extends chain', async () => {
    const resolved = await resolveConfig(
      {
        extends: ['./chain.js'],
        rules: {
          rule2: 'error',
          rule5: 'off',
        },
      },
      {
        cwd: FIXTURES_DIR,
      },
    );

    expect(resolved).toEqual({
      ...result,
      rules: {
        rule1: ['warn', null],
        rule2: ['error', null],
        rule3: ['warn', null],
        rule4: ['warn', null],
        rule5: ['off', null],
      },
    });
  });

  test('extends external package', async () => {
    const resolved = await resolveConfig(
      {
        extends: [
          'preset:pkg-name/recommended',
          'preset:@scope/pkg-name/recommended',
          'cfg-name',
          '@scope',
        ],
        rules: {
          a: 'error',
        },
      },
      {
        cwd: FIXTURES_DIR,
      },
    );

    expect(resolved).toEqual({
      ...result,
      rules: {
        a: ['error', null],
        'pkg-name-recommended': ['error', null],
        'scope-pkg-name-recommended': ['error', null],
        'cfg-name': ['error', null],
        'scope-config': ['error', null],
      },
    });
  });
});
