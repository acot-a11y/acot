# wcag21aa

> Run the rules specified in the "wcag21aa" tag of Axe.

_T.B.A_

https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md#wcag-21-level-a--aa-rules

## :white_check_mark: Correct

```html acot-template:templates/custom.html
<!-- Example: `avoid-inline-spacing` rule of axe -->
<p style="font-size: 200%">
  I stepped on a Corn Flake, now I'm a Cereal Killer...
</p>
```

## :warning: Incorrect

```html acot-template:templates/custom.html
<!-- Example: `avoid-inline-spacing` rule of axe -->
<p style="line-height: 1.5 !important;">Banana error</p>
```
