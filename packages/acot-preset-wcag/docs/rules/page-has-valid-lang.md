# page-has-valid-lang

The `html` element MUST has a valid lang attribute.

> The objective of this technique is to identify the default language of a document by providing the lang and/or xml:lang attribute on the html element.

[H57: Using language attributes on the html element | Techniques for WCAG 2.0](https://www.w3.org/TR/WCAG20-TECHS/H57.html)

## :white_check_mark: Correct

```html acot-template:templates/empty.html
<html lang="en-GB"></html>
```

## :warning: Incorrect

```html acot-template:templates/empty.html
<html lang="en-FOO"></html>
```

```html acot-template:templates/empty.html
<!-- missing html element -->
```

```html acot-template:templates/empty.html
<html></html>
```

```html acot-template:templates/empty.html
<html lang=""></html>
```
