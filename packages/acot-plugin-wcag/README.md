# @acot/acot-plugin-wcag

> A WCAG-based rule set for acot.

## Install

Install via npm:

```bash
$ npm install --save-dev @acot/acot-plugin-wcag
```

## Usage

Add `@acot/wcag` to the `plugins` field of the acot config file. then configure the rules you want to use under the rules section.

```json
{
  "plugins": ["@acot/wcag"],
  "rules": {
    "@acot/wcag/button-has-name": "error"
  }
}
```

You can also enable all the recommended rules for our plugin. Add `plugin:@acot/wcag/recommended` in `extends`:

```json
{
  "extends": ["plugin:@acot/wcag/recommended"]
}
```

## Supported Rules

<!-- acot-rules:start -->

| Name                                                                                  | Description                                                     | :heavy_check_mark: |
| :------------------------------------------------------------------------------------ | :-------------------------------------------------------------- | :----------------- |
| [`@acot/wcag/button-has-name`](./docs/rules/button-has-name.md)                       | Ensures buttons have discernible text                           | :heavy_check_mark: |
| [`@acot/wcag/dialog-open-and-close`](./docs/rules/dialog-open-and-close.md)           | Focus should work as expected when opening and closing dialogs. |                    |
| [`@acot/wcag/interactive-supports-focus`](./docs/rules/interactive-supports-focus.md) | TBA                                                             | :heavy_check_mark: |
| [`@acot/wcag/table-has-valid-role`](./docs/rules/table-has-valid-role.md)             | confirm table has table role                                    | :heavy_check_mark: |

<!-- acot-rules:end -->

## Concept

### Interactive content

Some rules deal with interactive content. The definition of interactive content to be audited is as follows:

1. [3.2.5.2.7 Interactive content](https://html.spec.whatwg.org/multipage/dom.html#interactive-content) compliant elements.
1. Elements with a role attribute that conforms to the above.
1. Focusable elements.

---

_T.B.A_
