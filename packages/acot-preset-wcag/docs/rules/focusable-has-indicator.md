# focusable-has-indicator

Focusable element has a focus indicator.

> Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible. [WCAG 2.1 - 2.4.7: Focus Visible](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html)

**WARN: Test will fail when make focus indicator without style of focused element.**

## :white_check_mark: Correct

```html
<a href="https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html"
  >WCAG 2.1 - 2.4.7: Focus Visible</a
>

<button type="button">button</button>
```

```html
<a href="#">Custom Outline style</a>

<style>
  *:focus {
    outline: 3px double black;
  }
</style>
```

```html
<button type="button">Button styled with border</button>

<style>
  button:focus {
    outline: none;
    border: 3px solid black;
  }
</style>
```

## :warning: Incorrect

```html
<!-- correct case -->
<a href="#">Custom Outline style</a>

<!-- incorrect case -->
<button type="button">Button styled with outline: none</button>

<style>
  button:focus {
    outline: none;
  }
</style>
```
