# experimental

Run the rules specified in the "experimental" tag of Axe.

https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md#experimental-rules

## :white_check_mark: Correct

```html acot-template:templates/custom.html
<!-- Example: `label-content-name-mismatch` rule of axe -->
<div role="link" aria-label="Next Page">Next</div>
```

## :warning: Incorrect

```html acot-template:templates/custom.html
<!-- Example: `label-content-name-mismatch` rule of axe -->
<div role="link" aria-label="OK">Next</div>
```
