import { createRule } from '@acot/core';

type Options = {};

export default createRule<Options>({
  type: 'contextual',
  selector: 'title',
  meta: {
    description:
      'Web pages have titles that describe topic or purpose. WCAG 2.1 - 2.4.2',
    recommended: false,
  },

  test: async (context, node) => {
    const title = await node.evaluate((el) => el.innerHTML);
    context.debug({ title });

    if (!title) {
      await context.report({
        node,
        message: 'page MUST has title',
      });
    }
  },
});
