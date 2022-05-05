import type { LaunchOptions } from '@acot/types';
import { findChrome } from '@acot/find-chrome';
import { Browser } from './browser';
import { Queue } from './queue';
import { debug } from './logging';

const WORK_INTERVAL = 30;

export type BrowserTask<T extends any[] = any[]> = (
  browser: Browser,
  ...args: T
) => Promise<void>;

export type BrowserJob = {
  fn: BrowserTask;
  args: any[];
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
};

export type BrowserPoolConfig = {
  launchOptions: LaunchOptions;
  timeout: number;
};

export class BrowserPool {
  private _config: BrowserPoolConfig;
  private _queue: Queue<BrowserJob> = new Queue();
  private _available: Set<Browser> = new Set();
  private _busy: Set<Browser> = new Set();
  private _interval: NodeJS.Timeout | null = null;

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
    const enableAOM = '--enable-blink-features=AccessibilityObjectModel';
    if (!this._config.launchOptions.args!.includes(enableAOM)) {
      this._config.launchOptions.args!.push(enableAOM);
    }

    this._config.launchOptions.handleSIGINT = false;
    this._config.launchOptions.handleSIGTERM = false;
    this._config.launchOptions.handleSIGHUP = false;
  }

  public async bootstrap(parallel: number): Promise<void> {
    let opts = this._config.launchOptions;

    if (!opts.executablePath) {
      debug('try chrome auto detection...');

      const chrome = await findChrome();
      if (chrome == null) {
        throw new Error('Executable Chromium was not found.');
      }

      debug('auto detected chrome: %O', chrome);

      opts = {
        ...opts,
        executablePath: chrome.executablePath,
      };
    }

    await Promise.all(
      Array.from(Array(parallel || 1)).map(async (_, i) => {
        this._available.add(await new Browser(i).launch(opts));
      }),
    );

    this._interval = setInterval(() => this._work(), WORK_INTERVAL);
  }

  public async terminate(): Promise<void> {
    if (this._interval != null) {
      clearInterval(this._interval);
    }

    await Promise.allSettled(
      [...this._available, ...this._busy].map((browser) => browser.close()),
    );

    this._available.clear();
    this._busy.clear();
    this._queue.clear();
    this._interval = null;
  }

  public execute<T extends any[] = any[]>(
    priority: number,
    fn: BrowserTask<T>,
    ...args: T
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this._queue.enqueue(priority, {
        fn: fn as BrowserTask,
        args,
        resolve,
        reject,
      });
    });
  }

  private async _work(): Promise<void> {
    if (this._available.size === 0 || this._queue.size === 0) {
      return;
    }

    const job = this._queue.dequeue()!;
    const browser = [...this._available.values()].shift()!;

    this._available.delete(browser);
    this._busy.add(browser);

    try {
      await job.fn(browser, ...job.args);
      job.resolve();
    } catch (e) {
      job.reject(e);
    }

    this._busy.delete(browser);
    this._available.add(browser);
  }
}
