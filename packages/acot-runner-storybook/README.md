# @acot/acot-runner-storybook

An acot custom runner for [Storybook](https://github.com/storybookjs/storybook).

The `@acot/acot-runner-storybook` crawls all the Stories in Storybook and sets them up for acot to audit.

## Installation

Install via npm:

```bash
$ npm install --save-dev @acot/acot-runner-storybook
```

## Usage

Add `@acot/storybook` to the `runner` field of the [configuration file](../../docs/configuration.md).

```json
{
  "runner": "@acot/storybook"
}
```

### Custom config for each story

You can pass a custom config to the `parameters.acot` field in Story's metadata, as in the following example:

```typescript
// Component Story Format (CSF) Example:
export default {
  title: 'Button',
  component: Button,
  parameters: {
    acot: {
      rules: {
        '@acot/wcag/button-has-name': 'off',
      },
    },
  },
};
```

## Options

### `include`

**Type:** `string[]`  
**Required:** `false`

The Story name pattern to include in the audit target. See the [micromatch][mm] documentation for pattern strings.

```json
{
  "runner": {
    "uses": "@acot/storybook",
    "with": {
      "include": ["*", "/atoms/**/*"]
    }
  }
}
```

### `exclude`

**Type:** `string[]`  
**Required:** `false`

The Story name pattern to exclude in the audit target. See the [micromatch][mm] documentation for pattern strings.

```json
{
  "runner": {
    "uses": "@acot/storybook",
    "with": {
      "exclude": ["/utils/**/*"]
    }
  }
}
```

### `timeout`

**Type:** `number`  
**Default:** `60000`  
**Required:** `false`

Maximum time in milliseconds to wait for the browser instance to collect stories.

```json
{
  "runner": {
    "uses": "@acot/storybook",
    "with": {
      "timeout": 120000
    }
  }
}
```

## Storybook compatibility

### Storybook versions

- [x] Storybook v5
- [ ] Storybook v6 (**TODO**)

### UI frameworks

Since `@acot/acot-runner-storybook` doesn't rely on UI frameworks like React, Angular, or Vue.js, it can be used in conjunction with any UI framework of your choice!

[mm]: https://github.com/micromatch/micromatch
