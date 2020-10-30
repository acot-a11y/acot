import { findChrome } from '@acot/find-chrome';
import type { LaunchOptions } from 'puppeteer-core';
import { Browser } from '../browser';

describe('Browser', () => {
  let launchOptions: LaunchOptions;

  beforeEach(async () => {
    const found = await findChrome({
      channel: 'puppeteer',
    });

    launchOptions = {
      executablePath: found!.executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
      headless: true,
    };
  });

  test('launch to close', async () => {
    const browser = new Browser(10);
    expect(browser.status()).toBe('closed');

    const res = await browser.launch(launchOptions);
    expect(browser.status()).toBe('idle');
    expect(res).toBe(browser);
    expect((browser.page() as any).constructor.name).toBe('Page');

    browser.lock();
    expect(browser.status()).toBe('active');

    browser.release();
    expect(browser.status()).toBe('idle');

    await browser.close();
    expect(browser.status()).toBe('closed');
  });
});
