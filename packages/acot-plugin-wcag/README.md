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
| Name                                                                                    | Description                                                                | :heavy_check_mark: |
| :-------------------------------------------------------------------------------------- | :------------------------------------------------------------------------- | :----------------- |
| [`@acot/wcag/interactive-has-enough-size`](./docs/rules/interactive-has-enough-size.md) | The size of the target for pointer inputs is at least 44 by 44 CSS pixels. | :heavy_check_mark: |
| [`@acot/wcag/interactive-has-name`](./docs/rules/interactive-has-name.md)               |                                                                            |                    |
| [`@acot/wcag/interactive-supports-focus`](./docs/rules/interactive-supports-focus.md)   | TBA                                                                        | :heavy_check_mark: |
| [`@acot/wcag/page-has-lang`](./docs/rules/page-has-lang.md)                             | WCAG 2.1 - 2.4.2                                                           |                    |
<!-- acot-rules:end -->

## Concept

### Interactive content

Some rules deal with interactive content. The definition of interactive content to be audited is as follows:

1. [3.2.5.2.7 Interactive content](https://html.spec.whatwg.org/multipage/dom.html#interactive-content) compliant elements.
1. Elements with a role attribute that conforms to the above.
1. Focusable elements.

---

_T.B.A_
