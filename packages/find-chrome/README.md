# @acot/find-chrome

> Find Chrome available in your runtime environment.

## Installation

Install via npm:

```bash
$ npm install --save @acot/find-chrome
```

## Usage

_T.B.A_

```typescript
import { findChrome } from '@acot/find-chrome';

(async () => {
  const { executablePath, type } = await findChrome(/* options */);
})();
```

## Thanks

Hard inspired by the following projects:

- [storycrawler](https://github.com/reg-viz/storycap/blob/master/packages/storycrawler/src/find-chrome.ts)
- [carlo](https://github.com/GoogleChromeLabs/carlo/blob/master/lib/find_chrome.js)
