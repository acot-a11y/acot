# img-has-name

The `img` element or img role MUST has name.

> All non-text content that is presented to the user has a text alternative that serves the equivalent purpose

[WCAG 2.1 - 1.1.1: Non-text Content](https://www.w3.org/TR/WCAG21/#non-text-content)

## Options

### `ignore: string | string[]`

**Default:** None

Ignores the element specified in the selector string from the validation target.

## :white_check_mark: Correct

```html
<img src="https://placebear.com/350/250" alt="bear" />

<svg role="img" aria-label="bear"></svg>
```

If the element is not exposed to the accessibility API, name allows an empty.

```html
<div aria-hidden="true">
  <img src="https://placebear.com/350/250" />
</div>
```

**Example:** `ignore: '[data-testid="img"]'`

Some `img` element can be ignored by specifying the `ignore` option.

```html ignore:"[data-testid='img']"
<img src="https://placebear.com/350/250" data-testid="img" />
```

## :warning: Incorrect

```html
<img src="https://placebear.com/350/250" />
```

```html
<div
  role="img"
  style="background: url(https://placebear.com/350/250); width: 350px; height: 250px;"
></div>
```
