import { createRule } from '@acot/core';
import type { ComputedAccessibleNode } from '@acot/types';
import {
  getEventListeners,
  isElementHidden,
  isElementMatches,
} from '@acot/utils';
import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';

const SELECTOR = [
  'base',
  'body',
  'head',
  'html',
  'link',
  'meta',
  'noscript',
  'script',
  'slot',
  'style',
  'template',
  'title',
]
  .map((s) => `:not(${s})`)
  .join('');

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
    help: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html',
    recommended: true,
  },

  test: async (context) => {
    const { ignore } = context.options;

    const nodes = await context.page.$$(SELECTOR);

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
            const ax = await ((window as any).getComputedAccessibleNode(
              el,
            ) as Promise<ComputedAccessibleNode>);
            return (ax?.name ?? '').trim();
          });

          // if focusable
          // TODO refactor
          const focusable = await node.evaluate((el) => {
            let tabindex: number | null = parseInt(
              el.getAttribute('tabindex') || '',
              10,
            );

            tabindex = !Number.isNaN(tabindex) ? tabindex : null;

            if (tabindex != null && tabindex >= 0) {
              return true;
            }

            if (el instanceof HTMLElement) {
              try {
                el.focus();
                return document.activeElement === el;
              } catch (e) {}
            }

            return false;
          });

          context.debug('focusable: %O', focusable);

          const listeners = await getEventListeners(node);
          const hasClick = listeners.some(({ type }) => type === 'click');

          context.debug('name: %s', name);
          context.debug({ hasClick });

          if ((hasClick || focusable) && !name) {
            await context.report({
              node,
              message: 'Interactive element MUST have the name.',
            });
          }
        } catch (e) {
          context.debug(e);
        }
      }),
    );
  },
});
