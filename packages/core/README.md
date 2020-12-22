# @acot/core

This module is a low layer of acot.

## Installation

Install via npm:

```bash
$ npm install --save @acot/core
```

## Usage

The following is an example of using the [@acot/acot-preset-wcag](../acot-preset-wcag/) preset package. Learn `@acot/core` from how to use Simple and Advanced respectively.

### Simple

In the simple example, the following package is used.

- [puppeteer](https://github.com/puppeteer/puppeteer)

The following is an example of specifying all audited pages and their configuration.

```typescript
import puppeteer from 'puppeteer';
import { Acot, PresetLoader } from '@acot/core';

const cwd = process.cwd();

(async () => {
  const loader = new PresetLoader(cwd);

  const acot = new Acot({
    parallel: 4,
    origin: 'http://localhost:8000',
    presets: [loader.load('@acot/wcag')],
    launchOptions: {
      executablePath: puppeteer.executablePath(),
    },
    cwd,
  });

  acot.add('/', {
    rules: {
      '@acot/wcag/page-has-title': ['error', null],
      '@acot/wcag/page-has-valid-lang': ['warn', null],
    },
  });

  const summary = await acot.audit();

  console.log('errorCount: %f', summary.errorCount);
  console.log('warningCount: %f', summary.warningCount);
  console.log('passCount: %f', summary.passCount);
})();
```

### Advanced

In the advanced example, the following package is used.

- [@acot/find-chrome](../find-chrome/)
- [@acot/config](../config/)

The following is an example of performing an audit according to the [configuration file](../../docs/configuration.md) (`acot.config.js`).

```typescript
import { loadConfig, ConfigRouter } from '@acot/config';
import { findChrome } from '@acot/find-chrome';
import { Acot } from '@acot/core';

const cwd = process.cwd();

(async () => {
  const config = await loadConfig('.', { cwd });
  const router = new ConfigRouter(config);

  const acot = new Acot({
    parallel: 4,
    origin: 'http://localhost:8000',
    presets: config.presets ?? [],
    launchOptions: {
      executablePath: (await findChrome())!.executablePath,
    },
    cwd,
  });

  config.paths?.forEach((path) => {
    const entry = router.resolve(path);

    acot.add(path, {
      rules: entry.rules,
      presets: entry.presets,
      headers: entry.headers,
    });
  });

  const summary = await acot.audit();

  console.log('errorCount: %f', summary.errorCount);
  console.log('warningCount: %f', summary.warningCount);
  console.log('passCount: %f', summary.passCount);
})();
```
