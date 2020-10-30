import type { LaunchOptions } from 'puppeteer-core';
import { Browser } from '../browser';
import type { BrowserPool } from '../browser-pool';

describe('BrowserPool', () => {
  const factory = async (
    ...args: ConstructorParameters<typeof BrowserPool>
  ) => {
    const { BrowserPool } = await import('../browser-pool');

    return new BrowserPool(...args);
  };

  beforeEach(() => {
    class MockBrowser extends Browser {
      async launch(_: LaunchOptions) {
        const closer = {
          close: async () => {},
        } as any;
        this._status = 'idle';
        this._browser = closer;
        this._page = closer;
        return this;
      }
    }

    jest.doMock('../browser', () => ({
      Browser: MockBrowser,
    }));
  });

  afterEach(() => {
    jest.resetModules();
  });

  test('constructor', async () => {
    const pool = await factory({
      launchOptions: {
        dumpio: true,
        args: ['--no-sandbox'],
      },
      timeout: 1000,
    });

    expect((pool as any)._config).toEqual({
      launchOptions: {
        dumpio: true,
        args: ['--no-sandbox', '--enable-accessibility-object-model'],
        headless: true,
      },
      timeout: 1000,
    });
  });

  test('bootstrap', async () => {
    const pool = await factory({
      launchOptions: {},
      timeout: 1000,
    });

    await pool.bootstrap(4);

    expect((pool as any)._browsers.length).toBe(4);
  });

  /**
   * TODO more tests
   *   - parallel tasks
   *   - timeout
   */
  test('execute', async () => {
    const pool = await factory({
      launchOptions: {},
      timeout: 1000,
    });

    await pool.bootstrap(2);

    const mock = jest.fn().mockResolvedValue('success');
    expect(await pool.execute(mock)).toBe('success');
    expect(mock).toBeCalled();
  });

  test('terminate', async () => {
    const pool = await factory({
      launchOptions: {},
      timeout: 1000,
    });

    await pool.bootstrap(2);
    await pool.terminate();

    expect((pool as any)._browsers[0].status()).toBe('closed');
    expect((pool as any)._browsers[1].status()).toBe('closed');
  });
});
