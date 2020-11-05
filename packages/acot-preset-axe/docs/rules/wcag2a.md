# wcag2a

Run the rules specified in the "wcag2a" tag of Axe.

https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md#wcag-20-level-a--aa-rules

## :white_check_mark: Correct

```html acot-template:templates/custom.html
<!-- Example: `aria-roles` rule of axe -->
<div role="banner">Banner role</div>
```

## :warning: Incorrect

Abstract role:

```html acot-template:templates/custom.html
<!-- Example: `aria-roles` rule of axe -->
<div role="invalid-role">Invalid role</div>
```
