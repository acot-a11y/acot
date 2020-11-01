import type {
  Browser as PuppeteerBrowser,
  Page,
  LaunchOptions,
} from 'puppeteer-core';
import { launch } from 'puppeteer-core';
const debug = require('debug')('acot:core');

export class Browser {
  protected _id: number;
  protected _browser: PuppeteerBrowser | null;
  protected _page: Page | null;

  public constructor(id: number) {
    this._id = id;
    this._browser = null;
    this._page = null;
  }

  public id(): number {
    return this._id;
  }

  public async page(): Promise<Page> {
    if (this._browser == null) {
      throw new Error(
        'You will need to launch the Browser in order to create the page.',
      );
    }

    this._page = await this._browser.newPage();

    this._page.on('console', (message) => {
      const args = message.args();
      for (const msg of args) {
        debug('browser.console: %O', msg);
      }
    });

    return this._page;
  }

  public async launch(launchOptions: LaunchOptions): Promise<Browser> {
    this._browser = await launch(launchOptions);

    return this;
  }

  public async close(): Promise<Browser> {
    try {
      await this._page?.close();
    } catch (e) {
      debug(e);
    }

    try {
      await this._browser?.close();
    } catch (e) {
      debug(e);
    }

    return this;
  }
}
