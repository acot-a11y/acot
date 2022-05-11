# dialog-focus

Move focus to inside dialog or set dialog after trigger.

> When a open dialog, move focus to an element contained in the dialog. Or [Inserting dynamic content into the Document Object Model immediately following its trigger element](https://www.w3.org/WAI/WCAG21/Techniques/client-side-script/SCR26).

[Understanding Success Criterion 2\.4\.3: Focus Order](https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html)

## Options

### `ignore: string | string[]`

**Default:** None

Ignores the element specified in the selector string from the validation target.

## :white_check_mark: Correct

```html
<button type="button" aria-haspopup="dialog">open</button>

<dialog>
  <button type="type">OK</button>
</dialog>

<script>
  const dialog = document.querySelector('dialog');
  const openButton = document.querySelector('button[aria-haspopup="dialog"]');
  openButton.addEventListener('click', (e) => {
    dialog.showModal();
  });
</script>
```

```html
<button type="button" aria-haspopup="dialog">open</button>

<div role="dialog" hidden>
  <button type="type">OK</button>
</div>

<script>
  const dialog = document.querySelector('[role=dialog]');
  const openButton = document.querySelector('button[aria-haspopup="dialog"]');
  openButton.addEventListener('click', (e) => {
    dialog.hidden = false;
  });
</script>
```

**Example:** `ignore: '[data-testid="dialog"]'`

The button does not respond, but does not report an error because it is excluded.

```html ignore:"[data-testid='dialog']"
<button type="button" aria-haspopup="dialog" data-testid="dialog">open</button>

<dialog>
  <button type="type">OK</button>
</dialog>
```

## :warning: Incorrect

```html
<button type="button" aria-haspopup="dialog">open</button>

<a href="https://example.com">link</a>

<div role="dialog" hidden>
  <button type="type">OK</button>
</div>

<script>
  const dialog = document.querySelector('[role=dialog]');
  const openButton = document.querySelector('button[aria-haspopup="dialog"]');
  openButton.addEventListener('click', (e) => {
    dialog.hidden = false;
  });
</script>
```
