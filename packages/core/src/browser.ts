import type {
  Browser as PuppeteerBrowser,
  Page,
  LaunchOptions,
} from 'puppeteer-core';
import { launch } from 'puppeteer-core';
const debug = require('debug')('acot:core');

export type BrowserStatus = 'idle' | 'active' | 'closed';

export class Browser {
  protected _id: number;
  protected _browser!: PuppeteerBrowser;
  protected _page!: Page;
  protected _status: BrowserStatus = 'closed';

  public constructor(id: number) {
    this._id = id;
  }

  public id(): number {
    return this._id;
  }

  public status(): BrowserStatus {
    return this._status;
  }

  public lock(): void {
    this._status = 'active';
  }

  public release(): void {
    this._status = 'idle';
  }

  public page(): Page {
    return this._page;
  }

  public async launch(launchOptions: LaunchOptions): Promise<Browser> {
    this._browser = await launch(launchOptions);
    this._page = await this._browser.newPage();

    this._page.on('console', (message) => {
      const args = message.args();
      for (const msg of args) {
        // logger.log('console: %s', msg);
        debug('browser.console: %O', msg);
      }
    });

    this._status = 'idle';

    return this;
  }

  public async close(): Promise<Browser> {
    try {
      await this._page.close();
    } catch (e) {
      // logger.log('Closing the page failed', e);
      debug(e);
    }

    try {
      await this._browser.close();
    } catch (e) {
      // logger.log('Closing the browser failed', e);
      debug(e);
    }

    this._status = 'closed';

    return this;
  }
}
