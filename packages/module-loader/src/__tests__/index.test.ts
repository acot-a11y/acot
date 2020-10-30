import path from 'path';
import { shorthand2pkg, tryResolveModule } from '@acot/utils';
import type { ModuleLoaderConfig } from '..';

const createLoader = async (config: Partial<ModuleLoaderConfig> = {}) => {
  const { ModuleLoader } = await import('..');

  return new ModuleLoader('pkg', {
    from: path.resolve(__dirname, 'fixtures'),
    ...config,
  });
};

describe('ModuleLoader', () => {
  afterEach(() => {
    jest.resetModules();
  });

  test('file', async () => {
    const loader = await createLoader();
    const name = './local';
    const module = require('./fixtures/local.js');

    expect(loader.load(name)).toBe(module);
    expect(loader.tryLoad(name)).toBe(module);
  });

  test.each([
    ['example', require('./fixtures/node_modules/acot-pkg-example.js')],
    ['@scope', require('./fixtures/node_modules/@scope/acot-pkg.js')],
    [
      '@scope/package',
      require('./fixtures/node_modules/@scope/acot-pkg-package.js'),
    ],
  ])('package ("%s")', async (name, module) => {
    const loader = await createLoader();

    expect(loader.load(name)).toBe(module);
    expect(loader.tryLoad(name)).toBe(module);
  });

  test('not found', async () => {
    const loader = await createLoader();
    const name = '__invalid_module__';

    expect(() => {
      loader.load(name);
    }).toThrowError(ReferenceError);

    expect(loader.tryLoad(name)).toBeNull();
  });

  test('cache - file', async () => {
    const mockedTryResolveModule = jest.fn(tryResolveModule);
    jest.doMock('@acot/utils', () => ({
      tryResolveModule: mockedTryResolveModule,
      shorthand2pkg,
    }));

    const loader = await createLoader({ cache: true });
    const name = './local';
    const module = require('./fixtures/local.js');

    expect(mockedTryResolveModule).toBeCalledTimes(0);

    expect(loader.load(name)).toBe(module);
    expect(mockedTryResolveModule).toBeCalledTimes(1);

    expect(loader.load(name)).toBe(module);
    expect(mockedTryResolveModule).toBeCalledTimes(1);
  });

  test('cache - package', async () => {
    const mockedTryResolveModule = jest.fn(tryResolveModule);
    jest.doMock('@acot/utils', () => ({
      tryResolveModule: mockedTryResolveModule,
      shorthand2pkg,
    }));

    const loader = await createLoader({ cache: true });
    const name = 'example';
    const module = require('./fixtures/node_modules/acot-pkg-example.js');

    expect(mockedTryResolveModule).toBeCalledTimes(0);

    expect(loader.load(name)).toBe(module);
    expect(mockedTryResolveModule).toBeCalledTimes(2);

    expect(loader.load(name)).toBe(module);
    expect(mockedTryResolveModule).toBeCalledTimes(2);
  });
});
