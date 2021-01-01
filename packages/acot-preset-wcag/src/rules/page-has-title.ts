import type { ElementHandle } from 'puppeteer-core';
import { createRule } from '@acot/core';

type Options = {};

export default createRule<Options>({
  immutable: true,
  meta: {
    tags: ['wcag2.1', 'wcag2.4.2'],
    recommended: true,
  },

  test: async (context) => {
    const title = await context.page.evaluate(() => document.title);

    context.debug('title="%s"', title);

    if (!title) {
      let node: ElementHandle | undefined;
      try {
        const el = await context.page.$('head');
        if (el != null) {
          node = el;
        }
      } catch (e) {
        context.debug(e);
      }

      await context.report({
        node,
        message: 'Page MUST have a title.',
      });
    }
  },
});
