import { createRule } from '@acot/core';

type Options = {};

export default createRule<Options>({
  type: 'contextual',
  selector: 'button, [role="button"]:not(input)',
  meta: {
    description: 'Ensures buttons have discernible text',
    recommended: true,
  },

  test: async (context, node) => {
    const name = await node.evaluate(async (el) => {
      const ax = await (window as any).getComputedAccessibleNode(el);
      return (ax?.name ?? '').trim();
    });

    context.debug('name: %s', name);

    if (!name) {
      await context.report({
        node,
        message: 'Missing accessible labels',
      });
    }
  },
});
