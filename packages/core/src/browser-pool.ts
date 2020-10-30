import type { LaunchOptions } from 'puppeteer-core';
import { Browser } from './browser';

export type BrowserPoolConfig = {
  launchOptions: LaunchOptions;
  timeout: number;
};

export class BrowserPool {
  private _config: BrowserPoolConfig;
  private _browsers: Browser[] = [];

  public constructor(config: BrowserPoolConfig) {
    this._config = {
      ...config,
      launchOptions: {
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
        headless: true,
        ...config.launchOptions,
      },
    };

    // require flags
    this._config.launchOptions.args!.push(
      '--enable-accessibility-object-model',
    );
  }

  public async bootstrap(parallel: number): Promise<void> {
    const { launchOptions } = this._config;

    this._browsers = await Promise.all(
      Array.from(Array(parallel || 1)).map((_, i) =>
        new Browser(i).launch(launchOptions),
      ),
    );
  }

  public async terminate(): Promise<void> {
    await Promise.all(this._browsers.map((browser) => browser.close()));
  }

  public async execute<T = void, A extends any[] = any[]>(
    callback: (browser: Browser, ...args: A) => Promise<T>,
    ...args: A
  ): Promise<T> {
    const browser = await this._waitForIdleBrowser();
    let result: T;

    try {
      browser.lock();
      result = await callback(browser, ...args);
    } finally {
      browser.release();
    }

    return result;
  }

  private _waitForIdleBrowser(): Promise<Browser> {
    const { timeout } = this._config;
    const start = Date.now();

    return new Promise((resolve, reject) => {
      const callback = () => {
        const diff = Date.now() - start;
        if (diff >= timeout) {
          return reject(new Error(`Browser idle timed out. (${timeout} ms)`));
        }

        const idle = this._browsers.find(
          (browser) => browser.status() === 'idle',
        );

        if (idle) {
          return resolve(idle);
        }

        setImmediate(callback);
      };

      setImmediate(callback);
    });
  }
}
