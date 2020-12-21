# Naming Convention

acot uses a naming convention when referencing packages in acot's ecosystem. The naming convention is inspired by the [ESLint](https://github.com/eslint/eslint) rules.

## Overview

This naming convention translates package names and their shorthands into each other.

The following three tokens are used for the naming convention format.

| Token       | Description                             |
| :---------- | :-------------------------------------- |
| `<context>` | The context used on the acot ecosystem. |
| `<name>`    | The package identity.                   |
| `@<scope>`  | The package scope name.                 |

Using these tokens, the package name and its shorthand are converted as follows:

| Package Name                     | Shorthand         |
| :------------------------------- | :---------------- |
| `acot-<context>-<name>`          | `<name>`          |
| `@<scope>/acot-<context>`        | `@<scope>`        |
| `@<scope>/acot-<context>-<name>` | `@<scope>/<name>` |

### Target contexts

The target contexts are as follows:

- `preset`
- `config`
- `runner`
- `reporter`

## Examples

The following is an example used in the configuration file.

```javascript
module.exports = {
  presets: [
    // acot-preset-foo
    'foo',
    // @example/acot-preset
    '@example',
    // @example/acot-preset-bar
    '@example/bar',
  ],

  extends: [
    // acot-config-foo
    'foo',
    // @example/acot-config
    '@example',
    // @example/acot-config-bar
    '@example/bar',
  ],

  // acot-runner-baz
  runner: 'baz',

  // @example/acot-reporter-qux
  reporter: '@example/qux',
};
```
