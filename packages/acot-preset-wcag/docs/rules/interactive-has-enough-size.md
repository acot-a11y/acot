# interactive-has-enough-size

The size of the target for pointer inputs is at least 44 by 44 CSS pixels.

[Understanding Success Criterion 2.5.5: Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)

## Options

### `ignore: string | string[]`

**Default:** None

Ignores the element specified in the selector string from the validation target.

## :white_check_mark: Correct

Allow UA default styles.

```html
<a href="/path/to">Inline link</a>

<button type="button">Button</button>

<input type="checkbox" />

<input id="radio-control" type="radio" />

<label for="radio-control">Label</label>
```

Adequately sized targets.

```html
<button style="display: inline-block; width: 44px; height: 44px;">
  Small button
</button>
```

**Example:** `ignore: '[data-testid="small"]'`

You can use the `ignore` option to ignore certain buttons.

```html ignore:"[data-testid='small']"
<button
  style="display: inline-block; width: 43px; height: 43px;"
  data-testid="small"
>
  Small button
</button>
```

## :warning: Incorrect

```html
<input type="checkbox" />

<button style="display: inline-block; width: 43px; height: 43px;">
  Small button
</button>

<style>
  input[type='checkbox'] {
    width: 24px;
    height: 24px;
  }
</style>
```
