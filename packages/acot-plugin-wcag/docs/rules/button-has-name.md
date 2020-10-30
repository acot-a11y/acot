# button-has-name

> _T.B.A_

_T.B.A_

## :white_check_mark: Correct

```html
<button type="button">Label</button>
<button type="button" aria-label="Label"></button>
<button type="button" title="Label"></button>
```

:point_down: The following code is ignored by testers.

```html acot-ignore
<button type="button"></button>
```

## :warning: Incorrect

```html
<button type="button"></button>
```

```html
<button type="button" aria-label=""></button>
```

```html
<button type="button" style="display: none;"></button>
```
