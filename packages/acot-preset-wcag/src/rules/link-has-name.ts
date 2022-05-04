import { createRule } from '@acot/core';
import { isElementHidden } from '@acot/utils';

type Options = {};

export default createRule<Options>({
  meta: {
    help: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html',
    recommended: true,
  },

  test: async (context) => {
    const nodes = await context.page.$$('aria/[role="link"]');

    await Promise.all(
      nodes.map(async (node) => {
        try {
          const hidden = await isElementHidden(node);
          if (hidden) {
            return;
          }

          const name = await node.evaluate(async (el) => {
            const ax = await (window as any).getComputedAccessibleNode(el);
            return (ax?.name ?? '').trim();
          });

          context.debug('name: %s', name);

          if (!name) {
            await context.report({
              node,
              message: 'Link MUST has name.',
            });
          }
        } catch (e) {
          context.debug(e);
        }
      }),
    );
  },
});
