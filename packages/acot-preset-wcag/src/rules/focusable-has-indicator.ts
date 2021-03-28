import { createRule } from '@acot/core';

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
  immutable: true,
  meta: {
    help: 'https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html',
    recommended: true,
  },

  test: async (context) => {
    const nodes = await context.page.$$(SELECTOR);

    for (const node of nodes) {
      try {
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

        const before = await node.evaluate(getComputedOutlineStyleAndCssText);

        await node.focus();

        const after = await node.evaluate(getComputedOutlineStyleAndCssText);

        context.debug('outline: %O', after.outline);

        if (
          after.outline.color !== 'transparent' &&
          after.outline.style !== 'none' &&
          after.outline.width !== '0px'
        ) {
          continue;
        }

        const isSameStyle = before.css === after.css;

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
    }
  },
});
