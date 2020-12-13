import { findChrome } from '@acot/find-chrome';
import type { LaunchOptions } from '@acot/types';
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

    const res = await browser.launch(launchOptions);

    expect(res).toBe(browser);
    expect(((await browser.page()) as any).constructor.name).toBe('Page');

    await browser.close();
  });
});
