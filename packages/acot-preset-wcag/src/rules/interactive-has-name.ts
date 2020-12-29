import { createRule } from '@acot/core';
import { getEventListeners } from '@acot/utils';
import type { ComputedAccessibleNode } from '@acot/types';

type Options = {};

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

export default createRule<Options>({
  type: 'global',
  immutable: true,
  meta: {
    recommended: true,
  },

  test: async (context) => {
    try {
      const elements = await context.page.$$(SELECTOR);

      await Promise.all(
        elements.map(async (node) => {
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

          context.debug('name: %O', name);

          context.debug({ hasClick });

          if ((hasClick || focusable) && !name) {
            await context.report({
              node,
              message: 'Interactive element MUST have the name',
            });
          }
        }),
      );
    } catch (e) {
      context.debug('error: ', e);
    }
  },
});
