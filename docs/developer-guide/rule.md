# Creating a rule

The rule can be used by including it in the preset.

If you want to include the `my-rule` rule in the `acot-preset-example`, include it in the preset rules as follows:

```typescript
import { myRule } from './rules/my-rule';

export default {
  rules: {
    'my-rule': myRule,
  },
};
```

## How to creating a rule

This is a tutorial on developing and testing `my-rule` using TypeScript.

### Setup

See [Creating a preset](./preset.md).

### Create a rule file

Define rules using the `createRule` function provided by `@acot/core`.

**src/rules/my-rule.ts:**

```typescript
import { createRule } from '@acot/core';

type Options = {};

export const myRule = createRule<Options>({
  test: async (context) => {
    // ...
  },
});
```

The function set in the `test` property is used for auditing the page.

Here are the options you can pass to `createRule`.

#### `test`

It is a function for audit using puppeteer. Call `context.report` to report the problem to core.

```typescript
createRule<Options>({
  test: async (context) => {
    const title = await context.page.evaluate(() => document.title);

    if (!title) {
      await context.report({
        message: 'Page MUST have a title.',
      });
    }
  },
});
```

`context` is an object with the following structure:

- `page` <[puppeteer.Page]> Page class instance of puppeteer.
- `report(descriptor)` <[function]> A function that reports a problem.
  - `descriptor` <[Object]>
    - `message` <[string]> A message for problem details.
    - `help` <?[string]> The URL of the help page for problem solving.
    - `node` <?[puppeteer.ElementHandle]> The HTML element to display in the report.
  - returns: <[Promise]<[void]>> The report runs asynchronously.
- `debug(format, ...args)` <[function]> A function that debugs rules. It usually does not appear in reports.
  - `format` <?[any]>
  - `...args` <...[any]>
  - returns: <[void]>
- `options` <`T`> The option values passed to rule in configuration.

#### `schema`

Validate optional values in [JSON Schema](https://json-schema.org/) format.

```typescript
type Options = {
  foo: string;
  bar: string;
};

createRule<Options>({
  schema: {
    properties: {
      foo: {
        type: 'string',
      },
      bar: {
        type: 'number',
      },
    },
    additionalProperties: false,
  },

  test: async (context) => {
    // context.options.foo: string
    // context.options.bar: number
  },
});
```

#### `meta`

Give meta information to rule.

#### `meta.help`

The URL of the help page that is commonly used when reporting problems.

```typescript
createRule<Options>({
  meta: {
    help: 'https://acot.example/foo/bar',
  },

  /* ... */
});
```

If you pass `help` in the `report` function, it will be overwritten.

#### `meta.recommended`

Tells the rule list output to `acot preset docgen` command whether it is` recommended`.

```typescript
createRule<Options>({
  meta: {
    recommended: true,
  },

  /* ... */
});
```

_**Note:** Apart from this value, you must include the rule in the preset `recommended` config._

### Testing rule

acot uses [Documentation Testing](https://en.wikipedia.org/wiki/Documentation_testing) to test its rules. We believe it is best to test using the documentation you have provided to convey the correct information to the users of the rule.

By including the `Correct` or `Incorrect` keyword in heading level 2, subsequent blocks of code will be treated as test code.

**docs/rules/my-rule.md:**

````markdown
# my-rule

RULE DESCRIPTION

## Correct

```html acot-head
<title>Text 1</title>
```

```html acot-head
<title>Text 2</title>
```

## Incorrect

```html acot-head
<title></title>
```
````

Correct / Incorrect have the following meanings, respectively.

- `## Correct`
  - All code blocks should not report problems.
- `## Incorrect`
  - All code blocks should report problems.

#### How to write a code block

The simplest is to write the HTML as is.

````markdown
```html
<a href="#link">Text</a>
```
````

You can also add meta information to your code block.

````markdown
```html acot-head, optionKey1:"optionValue1"
<a href="#link">Text</a>
```
````

The reserved meta is follows:

- `acot-head` - Expand the code into the `head` element.
- `acot-ignore` - Exclude code blocks from testing.
- `acot-template` - Change the HTML template used by default. (Example: `acot-template:my-template.html`)

Other than the reserved meta, it is passed as an option for rule.

#### How to check documentation HTML

If you want to actually check the described document in HTML, execute the following command.

```bash
$ npx acot preset serve
```

## Additional resources

- [Creating a preset](./preset.md)

<!-- prettier-ignore-start -->
[Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array "Array"
[Object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object "Object"
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise "Promise"
[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type "Boolean"
[function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function "Function"
[number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type "Number"
[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type "String"
[any]: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#any
[void]: https://www.typescriptlang.org/docs/handbook/2/functions.html#void
[puppeteer.Page]: https://github.com/puppeteer/puppeteer/blob/v8.0.0/docs/api.md#class-page
[puppeteer.ElementHandle]: https://github.com/puppeteer/puppeteer/blob/v8.0.0/docs/api.md#class-elementhandle
<!-- prettier-ignore-end -->
