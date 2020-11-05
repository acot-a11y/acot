# interactive-supports-focus

_T.B.A_

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
