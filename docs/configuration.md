# Configuration

If you use acot as the CLI, you can configure the audit via configuration file.  
This documentation describes how to build a configuration file to take advantage of acot.

## Table of Contents

- [Overview](#overview)
  - [Configuration File Formats](#configuration-file-formats)
  - [Configuring rules](#configuring-rules)
  - [Configuring presets](#configuring-presets)
  - [Extending configuration](#extending-configuration)
  - [Overrides configuration per URL paths](#overrides-configuration-per-url-paths)
- [Reference](#reference)
  - [Basic Options](#basic-options)
  - [Browser Options](#browser-options)

## Overview

First, you need to understand an overview of the configuration file.

### Configuration File Formats

The configuration file is usually placed in the root directory of your project. And you can use JSON, YAML, or JavaScript for the format of the configuration file.

The acot CLI searches for configuration files in the following order:

1. A `acot` property in a `package.json` file.
1. A `.acotrc` file with with JSON or YAML syntax.
1. A `.acotrc.json`, `.acotrc.yaml`, `.acotrc.yml`, `.acotrc.js`, or `.acotrc.cjs` file.
1. A `acot.config.js` or `acot.config.cjs` CommonJS module exporting the object. (**recommend**)

### Configuring rules

acot can set the reporting level and options for each rule.

There are three reporting levels available:

| Reporting Level | Description                                                                                  |
| :-------------- | :------------------------------------------------------------------------------------------- |
| `off`           | Disable the rule. The rule is not used for audit.                                            |
| `warn`          | It will be reported as a warning. This usually does not affect the exit code of the CLI.     |
| `error`         | It will be reported as a error. The CLI exit code returns `1` if the applicable rule exists. |

To configure the rule in the configuration file, specify the rule name and the reporting level for that rule in the `rules` property.

```javascript
module.exports = {
  rules: {
    'rule-name-foo': 'off',
    'rule-name-bar': 'warn',
    'rule-name-baz': 'error',
  },
};
```

If you specify options for that rule, use an array.

```javascript
module.exports = {
  rules: {
    'rule-name-foo': [
      'off',
      {
        /* ... */
      },
    ],
    'rule-name-bar': [
      'warn',
      {
        /* ... */
      },
    ],
    'rule-name-baz': [
      'error',
      {
        /* ... */
      },
    ],
  },
};
```

### Configuring presets

acot can use the third-party preset. In order to use that preset, you need to specify the preset name in the `presets` property in the configuration file.

<!-- prettier-ignore-start -->
```javascript
module.exports = {
  presets: [
    '@acot/wcag', // A `@acot/acot-preset-wcag` package.
    'foo',        // A `acot-preset-foo` package.
    './bar',      // A `<configuration file path>/bar.js` file.
  ],
};
```
<!-- prettier-ignore-end -->

When using Preset from package, specify the name of Preset according to the [Naming Convention](./naming-convention.md).

### Extending configuration

The acot configuration can inherit settings such as Preset, Shareable configuration package, and local configuration file.

#### Using the configuration from a preset

Presets often provide a configuration with rules. You can use the `extends` property in the configuration file to inherit the configuration provided by Preset.

```javascript
module.exports = {
  presets: ['@acot/wcag'],
  extends: ['preset:@acot/wcag/recommended'],
};
```

The name that can be specified for `extends` property when inheriting the Preset configuration is in the following format:

```
preset:<preset name>/<configuration name>
```

#### Using a shareable configuration package

acot can take advantage of the third-party configuration package.

<!-- prettier-ignore-start -->
```javascript
module.exports = {
  extends: [
    '@acot', // A `@acot/acot-config` package.
    'foo',   // A `acot-config-foo` package.
  ],
};
```
<!-- prettier-ignore-end -->

Specify the name of Shareable configuration according to the [Naming Convention](./naming-convention.md).

#### Using a configuration file

In addition to Preset and Shareable configuration, you can inherit the configuration of another file by directly specifying the path of the configuration file.

`foo.js`:

```javascript
module.exports = {
  rules: {
    foo: 'error',
  },
};
```

`acot.config.js`:

```javascript
module.exports = {
  extends: [
    './foo.js', // A `<configuration file path>/foo.js` file.
  ],
};
```

### Overrides configuration per URL paths

acot audits a list of URLs that can be represented by a combination of `origin` and `paths`.

Often you will want to switch the configuration by the path. You can override the configuration by combining the `overrides` property, `include`, and `exclude` property in the configuration file.

<!-- prettier-ignore-start -->
```javascript
module.exports = {
  origin: 'http://localhost:8000',
  paths: [
    '/',
    '/path/foo',
    '/path/bar',
    '/path/baz',
  ],
  rules: {
    'rule-name': 'error',
  },
  overrides: [
    {
      include: ['/path/**/*'],
      exclude: ['/path/baz'],
      rules: [
        'rule-name': 'off',
      ],
    },
    {
      include: ['/path/baz'],
      rules: [
        'rule-name': 'warn',
      ],
    },
  ],
};
```
<!-- prettier-ignore-end -->

In the above example, `rule-name` is set to the following reporting level:

- `http://localhost:8000/` - `error`
- `http://localhost:8000/path/foo` - `off`
- `http://localhost:8000/path/bar` - `off`
- `http://localhost:8000/path/baz` - `warn`

## Reference

Describes all the properties available in acot's configuration file.

### Basic Options

This is the core option of configuration.

#### `rules`

**Default:** `{}`

See [Configuring rules](#configuring-rules).

#### `presets`

**Default:** `[]`

See [Configuring presets](#configuring-presets).

#### `extends`

**Default:** `[]`

See [Extending configuration](#extending-configuration).

#### `origin`

**Default:** `''`

Target server URL origin.

```javascript
module.exports = {
  origin: 'http://localhost:8000',
};
```

#### `paths`

**Default:** `[]`

Path list of the page to be audit.

```javascript
module.exports = {
  paths: ['/', '/foo', '/bar', '/baz'],
};
```

#### `connection`

Specifies in the object the settings related to the connection with the server specified in `origin`.

##### `connection.command`

**Default:** `undefined`

If you have a command that you need before connecting to the server, you can specify the command to run with `connection.command`. Often used to start a local server.

```javascript
module.exports = {
  connection: {
    command: 'npm start',
  },
};
```

##### `connection.timeout`

**Default:** `60000`

Timeout ms for connecting to the host server.

```javascript
module.exports = {
  connection: {
    timeout: 60000,
  },
};
```

#### `workingDir`

**Default:** `".acot"`

Directory path used by acot store temporary files.

```javascript
module.exports = {
  workingDir: '.acot',
};
```

#### `overrides`

**Default:** `[]`

See [Overrides configuration per URL paths](#overrides-configuration-per-url-paths).

#### `runner`

You can specify the Custom Runner to use for the audit.

```javascript
module.exports = {
  runner: {
    uses: '@acot/sitemap',
    with: {
      source: 'https://acot.example/sitemap.xml',
    },
  },
};
```

`runner.uses` is the name of the Custom Runner, and `runner.with` is the option to pass to the Custom Runner.

If you do not need to specify options, you can specify only the name of Custom Runner.

```javascript
module.exports = {
  runner: '@acot/storybook',
};
```

Specify the name of Custom Runner according to the [Naming Convention](./naming-convention.md).

#### `reporters`

You can specify the Reporter to use for the report.

```javascript
module.exports = {
  reporters: [
    {
      uses: '@acot/pretty',
      with: {},
    },
  ],
};
```

`reporters[].uses` is the name of the Runner, and `reporters[].with` is the option to pass to the Reporter.

If you do not need to specify options, you can specify only the name of Reporter.

```javascript
module.exports = {
  reporters: ['@acot/pretty'],
};
```

Specify the name of Reporter according to the [Naming Convention](./naming-convention.md).

### Browser Options

#### `headers`

**Default:** `{}`

The HTTP headers will be sent with every request the page initiates.

```javascript
module.exports = {
  headers: {
    'X-FOO': 'value',
  },
};
```

#### `viewport`

**Default:** `"800x600"`

`viewport` is compatible with [Puppeteer viewport](https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#pagesetviewportviewport).

```javascript
module.exports = {
  viewport: {
    width: 800,
    height: 600,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    isLandscape: false,
  },
};
```

In addition, you can use the simplified notation in the following formats:

```
<width>x<height>
```

For example:

```javascript
module.exports = {
  viewport: '800x600',
};
```

#### `launchOptions`

**Default:** `{ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"] }`

This option is used to start Puppeteer.

acot forces the following options to be overwritten or adding.

```json
{
  "args": ["--enable-accessibility-object-model"],
  "handleSIGINT": false,
  "handleSIGTERM": false,
  "handleSIGHUP": false
}
```

See [Puppteer launch options](https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#puppeteerlaunchoptions) for details.

#### `chromeChannel`

**Default:** `"*"`

You can specify the channel for determining the value of the `executablePath` option passed to Puppeteer's launch options.

The values that can be specified are as follows:

- `"puppteer"`
- `"canary"`
- `"stable"`
- `"*"`
