# best-practice

> Run the rules specified in the "best-practice" tag of Axe.

_T.B.A_

https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md#best-practices-rules

## :white_check_mark: Correct

```html acot-template:templates/custom.html
<!-- Example: `empty-heading` rule of axe -->
<h1>Heading Level 1</h1>
```

## :warning: Incorrect

```html acot-template:templates/custom.html
<!-- Example: `empty-heading` rule of axe -->
<h1></h1>
<h1 aria-hidden="true">Heading Level 1</h1>
```
