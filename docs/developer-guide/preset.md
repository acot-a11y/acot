# Creating a preset

The preset is a grouping of rules. And, it can provide the configuration to the user. These are ecosystems that are very similar to [ESLint](https://eslint.org).

## Quick Start

You can use [create-acot-preset](https://github.com/acot-a11y/create-acot-preset) to set up an npm package for presets.

```bash
$ npx create-acot-preset example
```

After executing the above command, a directory called `acot-preset-example` will be created.

## How to creating a preset

This is a tutorial for developing `acot-preset-example` preset using TypeScript.

In this tutorial, we will create a preset package without using `create-acot-preset` for better understanding.

### Setup

Create files and directories with the following structure.

```
.
└── acot-preset-example/
    ├── README.md
    ├── package.json
    ├── tsconfig.json
    ├── docs/
    │   └── rules/
    │       └── my-rule.md
    └── src/
        ├── rules/
        │   └── my-rule.ts
        └── index.ts
```

Install the package with the following command:

```bash
$ npm init --yes
$ npm install --save-dev @acot/cli @acot/tsconfig @acot/types typescript
$ npm install --save @acot/core
```

**package.json:**

Change the `main` field as follows:

```json
  "main": "lib/index.js",
```

Change the `scripts` field as follows:

```diff
  "scripts": {
    "build": "tsc",
    "test": "acot preset test",
    "serve": "acot preset serve",
    "docgen": "acot preset docgen README.md"
  },
```

**tsconfig.json:**

Change `tsconfig.json` as follows:

```json
{
  "extends": "@acot/tsconfig",
  "compilerOptions": {
    "declaration": false,
    "outDir": "lib",
    "rootDir": "src"
  }
}
```

### Create a entry file

Export the object that contains the `rules` property. The `rules` property is a pair of rule and rule name object. See [Creating a rule](./rule.md) for the implementation of the rule.

**src/index.ts:**

```typescript
import { myRule } from './rules/my-rule';

export default {
  rules: {
    'my-rule': myRule,
  },
};
```

Rules registered as `my-rule` are available as `example/my-rule`. (format: `<preset name>/<rule name>`)

### Testing preset

`acot preset test` references the file specified in the `main` field of the `package.json` to run the test.

```bash
$ npx acot preset test
# or
$ npm test
```

_**Note:** Since the compiled file is used, it is necessary to build it before running the test._

### Generating a rule list

acot recommends that you document a list of rules that preset supports.

**README.md:**

Add the following comment out in Markdown.

```markdown
<!-- acot-rules:start -->
<!-- acot-rules:end -->
```

You can add a list of rules to Markdown with the `acot preset docgen` command.

```bash
$ npx acot preset docgen
# or
$ npm run docgen
```

### Define recommended configuration

Preset can provide multiple configs.

Add the `configs` property to the object you want to export.

```typescript
export default {
  rules: {
    /* ... */
  },
  configs: {
    recommended: {
      presets: ['example'],
      rules: {
        'example/my-rule': 'error',
      },
    },
  },
};
```

The defined config is available in the [configuration file](../configuration.md) as follows:

```json
{
  "extends": ["preset:example/recommended"]
}
```

## Additional resources

- [Creating a rule](./rule.md)
- [Configuration](../configuration.md)
- [Naming Convention](../naming-convention.md)
