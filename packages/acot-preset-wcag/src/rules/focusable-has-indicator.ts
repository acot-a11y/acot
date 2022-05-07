import { createRule } from '@acot/core';
import pLimit from 'p-limit';

const limit = pLimit(1);

const SELECTOR = [
  'input',
  'select',
  'textarea',
  'a[href]',
  'button',
  '[tabindex]',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  'details>summary:first-of-type',
  'details',
].join(',');

type Options = {};

export default createRule<Options>({
  meta: {
    help: 'https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html',
    recommended: true,
  },

  test: async (context) => {
    const nodes = await context.page.$$(SELECTOR);

    await Promise.all(
      nodes.map(async (node) => {
        try {
          const { before, after } = await limit(() =>
            node.evaluate((el) => {
              const getComputedOutlineStyleAndCssText = (el: Element) => {
                const styles = window.getComputedStyle(el);

                return {
                  outline: {
                    color: styles.outlineColor,
                    style: styles.outlineStyle,
                    width: styles.outlineWidth,
                  },
                  css: JSON.stringify(styles),
                };
              };

              const before = getComputedOutlineStyleAndCssText(el);
              (el as HTMLElement).focus();
              const after = getComputedOutlineStyleAndCssText(el);

              return { before, after };
            }),
          );

          context.debug('outline: %o', after!.outline);

          if (
            after!.outline.color !== 'transparent' &&
            after!.outline.style !== 'none' &&
            after!.outline.width !== '0px'
          ) {
            return;
          }

          const isSameStyle = before!.css === after!.css;

          context.debug(`before === after: ${isSameStyle}`);

          if (isSameStyle) {
            await context.report({
              node,
              message: `The focusable element MUST have visible focus indicator when focused.`,
            });
          }
        } catch (e) {
          context.debug(e);
        }
      }),
    );
  },
});
