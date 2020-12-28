# @acot/acot-runner-storybook

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

_T.B.A_
