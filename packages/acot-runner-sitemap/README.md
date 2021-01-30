# @acot/acot-runner-sitemap

An acot custom runner reading audit pages from sitemap.

## Installation

Install via npm:

```bash
$ npm install --save-dev @acot/acot-runner-sitemap
```

## Usage

Add `@acot/sitemap` to the `runner` field of the [configuration file](../../docs/configuration.md).

```json
{
  "runner": {
    "uses": "@acot/sitemap",
    "with": {
      "source": "https://acot.example/sitemap.xml",
      "random": [
        {
          "pattern": "/articles/**/*",
          "limit": 3
        }
      ]
    }
  }
}
```

## Options

### `source`

**Type:** `string`  
**Required:** `true`

The URL of `sitemap.xml`

```json
{
  "runner": {
    "uses": "@acot/sitemap",
    "with": {
      "source": "https://acot.example/sitemap.xml"
    }
  }
}
```

## `include`

**Type:** `string[]`  
**Required:** `false`

Page path pattern to include in audit target. See the [micromatch][mm] documentation for pattern strings.

```json
{
  "runner": {
    "uses": "@acot/sitemap",
    "with": {
      "source": "https://acot.example/sitemap.xml",
      "include": ["*", "/guidelines/core-*", "/docs/**/*"]
    }
  }
}
```

## `exclude`

**Type:** `string[]`  
**Required:** `false`

Page path pattern to exclude in audit target. See the [micromatch][mm] documentation for pattern strings.

```json
{
  "runner": {
    "uses": "@acot/sitemap",
    "with": {
      "source": "https://acot.example/sitemap.xml",
      "exclude": ["/articles/**/*"]
    }
  }
}
```

## `limit`

**Type:** `number`  
**Required:** `false`

Maximum number of pages to include in the audit target. If no value is specified, all pages will be audit targets.

```json
{
  "runner": {
    "uses": "@acot/sitemap",
    "with": {
      "source": "https://acot.example/sitemap.xml",
      "limit": 30
    }
  }
}
```

## `random`

**Type:** `{ pattern: string; limit: number }[]`  
**Required:** `false`

Randomly include the number of `limit`s in the audit target from the page list that matches `pattern`. This option is typically used when there are a large number of pages using the same template.

```json
{
  "runner": {
    "uses": "@acot/sitemap",
    "with": {
      "source": "https://acot.example/sitemap.xml",
      "random": [
        {
          "pattern": "/articles/**/*",
          "limit": 3
        },
        {
          "pattern": "/news/*",
          "limit": 2
        }
      ]
    }
  }
}
```

## `headers`

**Type:** `Record<string, string>`  
**Required:** `false`

The key-value of the header used when fetching the `sitemap.xml` specified in [source](#source).

```json
{
  "runner": {
    "uses": "@acot/sitemap",
    "with": {
      "source": "https://acot.example/sitemap.xml",
      "headers": {
        "X-KEY": "value"
      }
    }
  }
}
```

[mm]: https://github.com/micromatch/micromatch
