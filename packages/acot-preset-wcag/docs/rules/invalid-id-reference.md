# invalid-id-reference

The target of the ID reference or ID reference list MUST exist in the same document.

## Supported Attributes

- [x] [for](https://html.spec.whatwg.org/multipage/forms.html#attr-label-for)
- [x] [headers](https://html.spec.whatwg.org/multipage/tables.html#attr-tdth-headers)
- [x] [list](https://html.spec.whatwg.org/multipage/input.html#the-list-attribute)
- [x] [aria-activedescendant](https://www.w3.org/TR/wai-aria/#aria-activedescendant)
- [x] [aria-controls](https://www.w3.org/TR/wai-aria/#aria-controls)
- [x] [aria-describedby](https://www.w3.org/TR/wai-aria/#aria-describedby)
- [x] [aria-details](https://www.w3.org/TR/wai-aria/#aria-details)
- [x] [aria-errormessage](https://www.w3.org/TR/wai-aria/#aria-errormessage)
- [x] [aria-flowto](https://www.w3.org/TR/wai-aria/#aria-flowto)
- [x] [aria-labelledby](https://www.w3.org/TR/wai-aria/#aria-labelledby)
- [x] [aria-owns](https://www.w3.org/TR/wai-aria/#aria-owns)

## Related Success Criteria

- [WCAG 2.1 - 1.1.1: Non-text Content](https://www.w3.org/TR/WCAG21/#non-text-content)
- [WCAG 2.1 - 1.3.1: Info and Relationships](https://www.w3.org/TR/WCAG21/#info-and-relationships)
- [WCAG 2.1 - 1.3.2 Meaningful Sequence](https://www.w3.org/TR/WCAG21/#meaningful-sequence)
- [WCAG 2.1 - 1.3.6: Identify Purpose](https://www.w3.org/TR/WCAG21/#identify-purpose)
- [WCAG 2.1 - 2.4.1: Bypass Blocks](https://www.w3.org/TR/WCAG21/#bypass-blocks)
- [WCAG 2.1 - 2.4.4: Link Purpose (In Context)](https://www.w3.org/TR/WCAG21/#link-purpose-in-context)
- [WCAG 2.1 - 3.3.2: Labels or Instructions](https://www.w3.org/TR/WCAG21/#labels-or-instructions)
- [WCAG 2.1 - 4.1.2: Name, Role, Value](https://www.w3.org/TR/WCAG21/#name-role-value)

## :white_check_mark: Correct

**Example:** `for`

> https://www.w3.org/WAI/WCAG21/Techniques/html/H44

```html
<label for="firstname">First name:</label>
<input type="text" name="firstname" id="firstname" />
```

**Example:** `headers`

> https://www.w3.org/WAI/WCAG21/Techniques/html/H43

```html
<table>
  <tr>
    <th rowspan="2" id="h">Homework</th>
    <th colspan="3" id="e">Exams</th>
    <th colspan="3" id="p">Projects</th>
  </tr>
  <tr>
    <th id="e1" headers="e">1</th>
    <th id="e2" headers="e">2</th>
    <th id="ef" headers="e">Final</th>
    <th id="p1" headers="p">1</th>
    <th id="p2" headers="p">2</th>
    <th id="pf" headers="p">Final</th>
  </tr>
  <tr>
    <td headers="h">15%</td>
    <td headers="e e1">15%</td>
    <td headers="e e2">15%</td>
    <td headers="e ef">20%</td>
    <td headers="p p1">10%</td>
    <td headers="p p2">10%</td>
    <td headers="p pf">15%</td>
  </tr>
</table>
```

**Example:** `list`

> https://html.spec.whatwg.org/multipage/form-elements.html#the-datalist-element

```html
<label>
  Animal:
  <input name="animal" list="animals" />
  <datalist id="animals">
    <option value="Cat"></option>
    <option value="Dog"></option>
  </datalist>
</label>
```

**Example:** `aria-labelledby`

> https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA7

```html
<h2 id="headline">Storms hit east coast</h2>

<p>
  Torrential rain and gale force winds have struck the east coast, causing
  flooding in many coastal towns.
  <a id="p123" href="news.html" aria-labelledby="p123 headline">Read more...</a>
</p>
```

**Example:** `for`, `aria-describedby`

> https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA1

```html
<form>
  <label for="fname">First name</label>
  <input name="" type="text" id="fname" aria-describedby="int2" />
  <p id="int2">
    A bit of instructions for this field linked with aria-describedby.
  </p>
</form>
```

**Example:** `aria-owns`, `aria-controls`, `aria-activedescendant`

> https://www.w3.org/TR/wai-aria/#combobox

```html
<div
  aria-label="Tag"
  role="combobox"
  aria-expanded="true"
  aria-owns="owned_listbox"
  aria-haspopup="listbox"
>
  <input
    type="text"
    aria-autocomplete="list"
    aria-controls="owned_listbox"
    aria-activedescendant="selected_option"
  />
</div>

<ul role="listbox" id="owned_listbox">
  <li role="option">Zebra</li>
  <li role="option" id="selected_option">Zoom</li>
</ul>
```

**Example:** `aria-errormessage`

> https://www.w3.org/TR/wai-aria-1.2/#example-23

```html
<label for="startTime"> Please enter a start time for the meeting: </label>
<input
  id="startTime"
  type="text"
  aria-errormessage="msgID"
  value=""
  aria-invalid="false"
/>
<span id="msgID" aria-live="assertive"
  ><span style="visibility:hidden"
    >Invalid time: the time must be between 9:00 AM and 5:00 PM</span
  ></span
>
```

**Example:** `aria-details`

> https://www.w3.org/TR/wai-aria-1.2/#example-21

```html
<img src="https://placebear.com/350/250" alt="bear" aria-details="det" />
<details id="det">
  <summary>Example</summary>
  <p>Bear-themed placeholder images for developers</p>
</details>
```

**Example:** `aria-flowto`

> https://www.w3.org/WAI/GL/wiki/Using_aria-flowto

```html
<h1 aria-flowto="main">The Daily Planet</h1>

<h2>Weather</h2>
<article id="weather" title="Weather" aria-flowto="sports">
  <p>
    The weather will be what it will be, if you want a forecast look out your
    window and have a guess. That's what the pros do!
  </p>
</article>

<h2>Election results</h2>
<article id="main" title="Election Results" aria-flowto="weather">
  <p>Whoever you vote for government wins. ANOK 1984</p>
</article>

<h2>Sports</h2>
<article id="sports" title="Sports">
  <p>
    Today there will be lots of goals scored, tennis played and footballs kicked
  </p>
</article>
```

## :warning: Incorrect

**Example:** `for`

```html
<label for="firstname">First name:</label>
<input type="text" name="firstname" />
```

**Example:** `headers`

```html
<table>
  <tr>
    <th rowspan="2" id="h">Homework</th>
    <th colspan="3" id="e">Exams</th>
    <th colspan="3" id="p">Projects</th>
  </tr>
  <tr>
    <th id="e1" headers="invalid-e">1</th>
    <th id="e2" headers="invalid-e">2</th>
    <th id="ef" headers="">Final</th>
    <th id="p1" headers="p">1</th>
    <th id="p2" headers="invalid-p">2</th>
    <th id="pf" headers="invalid-p">Final</th>
  </tr>
  <tr>
    <td headers="h">15%</td>
    <td headers="e e1">15%</td>
    <td headers="e invalid-e2">15%</td>
    <td headers="invalid-e ef">20%</td>
    <td headers="invalid-p invalid-p1">10%</td>
    <td headers="p p2">10%</td>
    <td headers="p pf">15%</td>
  </tr>
</table>
```

**Example:** `list`

```html
<label>
  Animal:
  <input name="animal" list="animals" />
  <datalist>
    <option value="Cat"></option>
    <option value="Dog"></option>
  </datalist>
</label>
```

**Example:** `aria-labelledby`

```html
<h2>Storms hit east coast</h2>

<p>
  Torrential rain and gale force winds have struck the east coast, causing
  flooding in many coastal towns.
  <a id="p123" href="news.html" aria-labelledby="p123 headline">Read more...</a>
</p>
```

**Example:** `for`, `aria-describedby`

```html
<form>
  <label for="fname">First name</label>
  <input name="" type="text" aria-describedby="int2" />
  <p id="invalid-id">
    A bit of instructions for this field linked with aria-describedby.
  </p>
</form>
```

**Example:** `aria-owns`, `aria-controls`, `aria-activedescendant`

```html
<div
  aria-label="Tag"
  role="combobox"
  aria-expanded="true"
  aria-owns="invalid-owns"
  aria-haspopup="listbox"
>
  <input
    type="text"
    aria-autocomplete="list"
    aria-controls="invalid-controls"
    aria-activedescendant="selected_option"
  />
</div>

<ul role="listbox">
  <li role="option">Zebra</li>
  <li role="option">Zoom</li>
</ul>
```

**Example:** `aria-errormessage`

```html
<label for="startTime"> Please enter a start time for the meeting: </label>
<input
  type="text"
  aria-errormessage="invalid-msg"
  value=""
  aria-invalid="false"
/>
<span aria-live="assertive"
  ><span style="visibility:hidden"
    >Invalid time: the time must be between 9:00 AM and 5:00 PM</span
  ></span
>
```

**Example:** `aria-details`

```html
<img src="https://placebear.com/350/250" alt="bear" aria-details="invalid" />
<details>
  <summary>Example</summary>
  <p>Bear-themed placeholder images for developers</p>
</details>
```

**Example:** `aria-flowto`

```html
<h1 aria-flowto="main">The Daily Planet</h1>

<h2>Weather</h2>
<article title="Weather" aria-flowto="sports">
  <p>
    The weather will be what it will be, if you want a forecast look out your
    window and have a guess. That's what the pros do!
  </p>
</article>

<h2>Election results</h2>
<article title="Election Results" aria-flowto="weather">
  <p>Whoever you vote for government wins. ANOK 1984</p>
</article>

<h2>Sports</h2>
<article title="Sports">
  <p>
    Today there will be lots of goals scored, tennis played and footballs kicked
  </p>
</article>
```
