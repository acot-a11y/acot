import type { ElementHandle } from 'puppeteer-core';
import { createRule } from '@acot/core';
import tags from 'language-tags';

type Options = {};

export default createRule<Options>({
  type: 'global',
  immutable: true,
  meta: {
    recommended: true,
  },

  test: async (context) => {
    const html: ElementHandle<HTMLElement> | null = await context.page.$(
      'html',
    );

    if (html == null) {
      return await context.report({
        message: 'html element MUST be exists.',
      });
    }

    const lang = await html.evaluate(
      (el) => el.getAttribute('lang') || el.getAttribute('xml:lang'),
    );

    if (!lang) {
      return await context.report({
        node: html,
        message:
          'html element MUST have the "lang" or "xml:lang" attribute specified.',
      });
    }

    const valid = tags.check(lang);
    context.debug('lang="%s"', lang, valid);

    if (!valid) {
      return await context.report({
        node: html,
        message: `"${lang}" lang attribute specified for the html element is invalid. The value of the lang attribute MUST be conforms to BCP 47: Tags for the Identification of Languages or its successor.`,
      });
    }
  },
});
