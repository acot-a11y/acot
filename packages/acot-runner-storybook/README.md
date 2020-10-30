# @acot/acot-runner-storybook

> An acot custom runner for [Storybook](https://github.com/storybookjs/storybook).

The `@acot/acot-runner-storybook` crawls all the Stories in Storybook and sets them up for acot to audit.

## Installation

Install via npm:

```bash
$ npm install --save-dev @acot/acot-runner-storybook
```

## Usage

Add `@acot/storybook` to the `runner` field of the acot config file.

```json
{
  "runner": "@acot/storybook"
}
```

or the CLI's `--runner` flag with `@acot/storybook`.

```bash
$ acot run --runner "@acot/storybook"
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

## Storybook compatibility

### Storybook versions

- [x] Storybook v5

_T.B.A_

### UI frameworks

Since `@acot/acot-runner-storybook` doesn't rely on UI frameworks like React, Angular, or Vue.js, it can be used in conjunction with any UI framework of your choice!

---

_T.B.A_
