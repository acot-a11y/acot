# @acot/acot-preset-axe

An axe rule set for acot.

## Installation

Install via npm:

```bash
$ npm install --save-dev @acot/acot-preset-axe
```

## Usage

Add `@acot/axe` to the `presets` field of the acot config file. then configure the rules you want to use under the rules section.

```json
{
  "presets": ["@acot/axe"],
  "rules": {
    "@acot/axe/wcag2a": "error"
  }
}
```

You can also enable all the recommended rules for our preset. Add `preset:@acot/axe/recommended` in `extends`:

```json
{
  "extends": ["preset:@acot/axe/recommended"]
}
```

## Supported Rules

<!-- acot-rules:start -->

| Name                                                       | Summary                                                    | :heavy_check_mark: |
| :--------------------------------------------------------- | :--------------------------------------------------------- | :----------------- |
| [`@acot/axe/best-practice`](./docs/rules/best-practice.md) | Run the rules specified in the "best-practice" tag of Axe. | :heavy_check_mark: |
| [`@acot/axe/experimental`](./docs/rules/experimental.md)   | Run the rules specified in the "experimental" tag of Axe.  | :heavy_check_mark: |
| [`@acot/axe/wcag21a`](./docs/rules/wcag21a.md)             | Run the rules specified in the "wcag21a" tag of Axe.       | :heavy_check_mark: |
| [`@acot/axe/wcag21aa`](./docs/rules/wcag21aa.md)           | Run the rules specified in the "wcag21aa" tag of Axe.      | :heavy_check_mark: |
| [`@acot/axe/wcag2a`](./docs/rules/wcag2a.md)               | Run the rules specified in the "wcag2a" tag of Axe.        | :heavy_check_mark: |
| [`@acot/axe/wcag2aa`](./docs/rules/wcag2aa.md)             | Run the rules specified in the "wcag2aa" tag of Axe.       | :heavy_check_mark: |
| [`@acot/axe/wcag2aaa`](./docs/rules/wcag2aaa.md)           | Run the rules specified in the "wcag2aaa" tag of Axe.      | :heavy_check_mark: |

<!-- acot-rules:end -->
