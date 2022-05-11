import { createRule } from '@acot/core';
import {
  getEventListeners,
  isElementHidden,
  isElementMatches,
} from '@acot/utils';
import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';

// FIXME @masuP9

const SELECTOR = [
  'base',
  'body',
  'button',
  'head',
  'html',
  'input',
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
          if (listeners.length === 0 && !focusable) {
            return;
          }

          const hasClick = listeners.some(({ type }) => type === 'click');
          const hasKeyboard = listeners.some(
            ({ type }) =>
              type === 'keydown' || type === 'keypress' || type === 'keyup',
          );

          context.debug({ hasClick, hasKeyboard });

          if (hasClick && !hasKeyboard) {
            await context.report({
              node,
              message:
                'Interactive element MUST have the same handler as the click event.',
            });
          }
        } catch (e) {
          context.debug(e);
        }
      }),
    );
  },
});
