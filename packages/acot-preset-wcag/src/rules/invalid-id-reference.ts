import { createRule } from '@acot/core';

const attributes: {
  name: string;
  list: boolean;
  help: string;
}[] = [
  {
    name: 'for',
    list: false,
    help: 'https://html.spec.whatwg.org/multipage/forms.html#attr-label-for',
  },
  {
    name: 'headers',
    list: true,
    help: 'https://html.spec.whatwg.org/multipage/tables.html#attr-tdth-headers',
  },
  {
    name: 'list',
    list: false,
    help: 'https://html.spec.whatwg.org/multipage/input.html#the-list-attribute',
  },
  {
    name: 'aria-activedescendant',
    list: false,
    help: 'https://www.w3.org/TR/wai-aria/#aria-activedescendant',
  },
  {
    name: 'aria-controls',
    list: true,
    help: 'https://www.w3.org/TR/wai-aria/#aria-controls',
  },
  {
    name: 'aria-describedby',
    list: true,
    help: 'https://www.w3.org/TR/wai-aria/#aria-describedby',
  },
  {
    name: 'aria-details',
    list: false,
    help: 'https://www.w3.org/TR/wai-aria/#aria-details',
  },
  {
    name: 'aria-errormessage',
    list: false,
    help: 'https://www.w3.org/TR/wai-aria/#aria-errormessage',
  },
  {
    name: 'aria-flowto',
    list: true,
    help: 'https://www.w3.org/TR/wai-aria/#aria-flowto',
  },
  {
    name: 'aria-labelledby',
    list: true,
    help: 'https://www.w3.org/TR/wai-aria/#aria-labelledby',
  },
  {
    name: 'aria-owns',
    list: true,
    help: 'https://www.w3.org/TR/wai-aria/#aria-owns',
  },
];

type Options = {};

export default createRule<Options>({
  meta: {
    recommended: true,
  },

  test: async (context) => {
    await Promise.all(
      attributes.map(async (attr) => {
        const nodes = await context.page.$$(`[${attr.name}]`);

        await Promise.all(
          nodes.map(async (node) => {
            const [valid, invalid] = await node.evaluate((el, attr) => {
              const value = el.getAttribute(attr.name)!;
              const ids = attr.list ? value.split(/\s+/g) : [value];

              return ids.reduce<[string[], string[]]>(
                (acc, cur) => {
                  const id = cur.trim();
                  if (document.getElementById(id) != null) {
                    acc[0].push(id);
                  } else {
                    acc[1].push(id);
                  }
                  return acc;
                },
                [[], []],
              );
            }, attr);

            const joined = {
              valid: valid.join(', '),
              invalid: invalid.join(', '),
            };

            context.debug(
              `valid: "${joined.valid}" / invalid: "${joined.invalid}"`,
            );

            if (invalid.length > 0) {
              await context.report({
                node,
                message: `"${attr.name}" attribute referent element MUST exist in the same document. (invalid: "${joined.invalid}")`,
                help: attr.help,
              });
            }
          }),
        );
      }),
    );
  },
});
