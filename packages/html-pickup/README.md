# @acot/html-pickup

> Use the CSS Selector to pick up the elements from the HTML string.

## Installation

Install via npm:

```bash
$ npm install --save @acot/html-pickup
```

## Usage

_T.B.A_

```typescript
import { pickup } from '@acot/html-pickup';

const html = `
<html>
  <body>
    <header>
      <h1>Title</h1>
    </header>

    <main id="container">
      <h2>Sub title</h2>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ul>
    </main>
  </body>
</html>
`;

const el = pickup(html, '#container');

console.log(el);
// "<main id="container"><h2>Sub title</h2><ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul></main>"
```
