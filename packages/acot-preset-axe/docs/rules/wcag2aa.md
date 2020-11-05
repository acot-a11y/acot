# wcag2aa

> Run the rules specified in the "wcag2aa" tag of Axe.

_T.B.A_

https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md#wcag-20-level-a--aa-rules

## :white_check_mark: Correct

```html acot-template:templates/custom.html
<!-- Example: `color-contrast` rule of axe -->
<p style="color: white; background: black;">Text content</p>
```

## :warning: Incorrect

```html acot-template:templates/custom.html
<!-- Example: `color-contrast` rule of axe -->
<p style="color: white; background: beige;">Text content</p>
```
