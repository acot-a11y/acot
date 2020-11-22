# img-has-name

img element or img role MUST has name.

> All non-text content that is presented to the user has a text alternative that serves the equivalent purpose

[WCAG 2.1 - 1.1.1: Non-text Content](https://www.w3.org/TR/WCAG21/#non-text-content)

## :white_check_mark: Correct

```html
<img src="https://placebear.com/350/250" alt="bear" />

<svg role="img" aria-label="bear"></svg>
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
