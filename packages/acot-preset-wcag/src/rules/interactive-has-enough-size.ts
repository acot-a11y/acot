import { createRule } from '@acot/core';

const SIZE = 44;

const SELECTOR = [
  '[draggable="true"]',
  '[role="button"]',
  '[role="checkbox"]',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="option"]',
  '[role="radio"]',
  '[role="range"]',
  '[role="searchbox"]',
  '[role="spinbutton"]',
  '[role="switch"]',
  '[role="tab"]',
  '[role="textbox"]',
  'a[href]',
  'area',
  'audio:not([controls="false"])',
  'button',
  'embed',
  'img[usemap]',
  'input:not([type="hidden"])',
  'label',
  'object[usemap]',
  'select',
  'summary',
  'textarea',
  'video:not([controls="false"])',
].join(',');

type Options = {};

export default createRule<Options>({
  meta: {
    help: 'https://www.w3.org/WAI/WCAG21/Understanding/target-size.html',
    recommended: true,
  },

  test: async (context) => {
    const nodes = await context.page.$$(SELECTOR);

    await Promise.all(
      nodes.map(async (node) => {
        const styles = await node.evaluate((el) => {
          const rect = el.getBoundingClientRect();

          return {
            display: window.getComputedStyle(el).getPropertyValue('display'),
            width: rect.width,
            height: rect.height,
          };
        });

        context.debug('styles: %O', styles);

        if (styles.display === 'inline') {
          return;
        }

        if (Math.min(styles.width, styles.height) >= SIZE) {
          return;
        }

        const isDefaultStyles = await node.evaluate((el) => {
          const get = (e: Element) =>
            JSON.stringify(window.getComputedStyle(e));

          const body = document.body;
          const root = document.createElement('div');
          const shadow = root.attachShadow({ mode: 'closed' });
          const dummy = el.cloneNode(true) as Element;

          dummy.setAttribute('style', '');
          shadow.appendChild(dummy);
          body.appendChild(root);

          const result = get(dummy) === get(el);

          body.removeChild(root);

          return result;
        });

        context.debug('isDefaultStyles:', isDefaultStyles);

        if (!isDefaultStyles) {
          await context.report({
            node,
            message: `The target size must be at least 44 x 44 CSS pixels, but actual: ${styles.width} x ${styles.height} CSS pixels.`,
          });
        }
      }),
    );
  },
});
