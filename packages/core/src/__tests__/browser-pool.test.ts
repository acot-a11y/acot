import type { LaunchOptions } from '@acot/types';
import { Browser } from '../browser';
import type { BrowserPool } from '../browser-pool';

describe('BrowserPool', () => {
  let pool: BrowserPool;

  const factory = async (
    ...args: ConstructorParameters<typeof BrowserPool>
  ) => {
    const { BrowserPool } = await import('../browser-pool');

    return new BrowserPool(...args);
  };
  class MockBrowser extends Browser {
    public launchOptions: LaunchOptions = {} as any;

    async launch(launchOptions: LaunchOptions) {
      this.launchOptions = launchOptions;

      const closer = {
        close: async () => {},
      } as any;

      this._browser = closer;
      this._page = closer;

      this.close = jest.fn().mockReturnValue(Promise.resolve());

      return this;
    }
  }

  beforeEach(() => {
    jest.doMock('../browser', () => ({
      Browser: MockBrowser,
    }));
  });

  afterEach(async () => {
    await pool.terminate();
    jest.resetModules();
  });

  test('constructor', async () => {
    pool = await factory({
      launchOptions: {
        dumpio: true,
        args: ['--no-sandbox'],
      },
      timeout: 1000,
    });

    expect(pool['_config']).toEqual({
      launchOptions: {
        dumpio: true,
        args: ['--no-sandbox', '--enable-accessibility-object-model'],
        headless: true,
        handleSIGINT: false,
        handleSIGTERM: false,
        handleSIGHUP: false,
      },
      timeout: 1000,
    });
  });

  test('bootstrap - chrome auto detection', async () => {
    pool = await factory({
      launchOptions: {},
      timeout: 1000,
    });

    await pool.bootstrap(4);

    expect(pool['_available'].size).toBe(4);

    for (const browser of pool['_available']) {
      expect(
        (browser as MockBrowser).launchOptions.executablePath,
      ).not.toBeFalsy();
    }
  });

  test('bootstrap - specify chrome executablePath', async () => {
    const executablePath = '/path/to';

    pool = await factory({
      launchOptions: {
        executablePath,
      },
      timeout: 1000,
    });

    await pool.bootstrap(4);

    expect(pool['_available'].size).toBe(4);

    for (const browser of pool['_available']) {
      expect((browser as MockBrowser).launchOptions.executablePath).toBe(
        executablePath,
      );
    }
  });

  /**
   * TODO more tests
   *   - parallel tasks
   *   - timeout
   */
  test('execute', async () => {
    pool = await factory({
      launchOptions: {},
      timeout: 1000,
    });

    await pool.bootstrap(2);

    const mock = jest.fn().mockReturnValue(Promise.resolve());
    await pool.execute(1, mock);
    expect(mock).toBeCalled();
  });

  test('terminate', async () => {
    pool = await factory({
      launchOptions: {},
      timeout: 1000,
    });

    await pool.bootstrap(2);
    const browsers = [...(pool as any)._available];
    await pool.terminate();

    expect(browsers[0].close).toBeCalled();
    expect(browsers[1].close).toBeCalled();
  });
});
