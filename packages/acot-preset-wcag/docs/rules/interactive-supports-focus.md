# interactive-supports-focus

_T.B.A_

## Options

### `ignore: string | string[]`

**Default:** None

Ignores the element specified in the selector string from the validation target.

## :white_check_mark: Correct

```html
<button type="button">Button</button>
<div>Div</div>
<span>Span</span>
```

```html
<div id="div" tabindex="0">Element</div>

<script>
  const div = document.getElementById('div');
  const handler = () => {
    /* ... */
  };
  div.addEventListener('click', handler, false);
  div.addEventListener('keydown', handler, false);
</script>
```

**Example:** `ignore: '[data-testid="ignore"]'`

```html ignore:"[data-testid='ignore']"
<div id="div" tabindex="0" data-testid="ignore">Element</div>

<script>
  const div = document.getElementById('div');
  const handler = () => {
    /* ... */
  };
  div.addEventListener('click', handler, false);
</script>
```

## :warning: Incorrect

```html
<div id="div" tabindex="0">Element</div>

<script>
  const div = document.getElementById('div');
  const handler = () => {
    /* ... */
  };
  div.addEventListener('click', handler, false);
</script>
```
