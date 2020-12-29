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
  type: 'global',
  immutable: true,
  meta: {
    tags: ['wcag21aa', '2.4.7 Focus visible'],
    recommended: true,
  },

  test: async (context) => {
    try {
      const elements = await context.page.$$(SELECTOR);

      for (const node of elements) {
        const getComputedOutlineStyleAndCssText = (el: Element) => {
          const CSSStyleDeclaration = window.getComputedStyle(el);

          return {
            outline: {
              color: CSSStyleDeclaration.outlineColor,
              style: CSSStyleDeclaration.outlineStyle,
              width: CSSStyleDeclaration.outlineWidth,
            },
            cssText: CSSStyleDeclaration.cssText,
          };
        };

        const beforeStyle = await node.evaluate(
          getComputedOutlineStyleAndCssText,
        );

        await node.focus();

        const afterStyle = await node.evaluate(
          getComputedOutlineStyleAndCssText,
        );

        context.debug('outline: %O', afterStyle.outline);

        if (
          afterStyle.outline.color !== 'transparent' &&
          afterStyle.outline.style !== 'none' &&
          afterStyle.outline.width !== '0px'
        ) {
          continue;
        }

        context.debug(
          `beforeStyle === afterStyle: ${
            beforeStyle.cssText === afterStyle.cssText
          }`,
        );

        if (beforeStyle.cssText === afterStyle.cssText) {
          await context.report({
            node,
            message: `The focusable element MUST have visible focus indicator when focused.`,
          });
        }
      }
    } catch (e) {
      context.debug('error: ', e);
    }
  },
});
