import { createRule } from '@acot/core';
import { isElementHidden, isElementMatches } from '@acot/utils';
import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';

const schema = Type.Strict(
  Type.Object(
    {
      ignore: Type.Optional(
        Type.Union([Type.String(), Type.Array(Type.String())]),
      ),
    },
    {
      additionalProperties: false,
    },
  ),
);

type Options = Static<typeof schema>;

export default createRule<Options>({
  schema,

  meta: {
    help: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
    recommended: true,
  },

  test: async (context) => {
    const { ignore } = context.options;

    const nodes = await context.page.$$('aria/[role="img"]');

    await Promise.all(
      nodes.map(async (node) => {
        try {
          const [hidden, ignored] = await Promise.all([
            isElementHidden(node),
            isElementMatches(node, ignore ?? []),
          ]);

          if (hidden || ignored) {
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
              message: 'img element or img role MUST has name.',
            });
          }
        } catch (e) {
          context.debug(e);
        }
      }),
    );
  },
});
