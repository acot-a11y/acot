![acot - Accessibility Testing Framework](docs/assets/repository-header.png)

[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/acot-a11y/acot/CI?logo=github&style=flat-square)](https://github.com/acot-a11y/acot/actions?workflow=CI)
[![MIT LICENSE](https://img.shields.io/github/license/acot-a11y/acot?label=license&style=flat-square)](./LICENSE)

---

<p align="center">
  <strong>!! THE ACOT IS STILL IN ALPHA STATUS AND MAY BE BROKEN BY THE UPGRADE !!</strong>
</p>

---

## Overview

> More accessible web, all over the world.

`acot` is an open-source Accessibility Testing Framework that uses headless Chrome ([puppeteer](https://github.com/puppeteer/puppeteer)) to provide a means of testing any website or web app. It support for making the Web accessible with a flexible, highly reliable rule set that leverages browser-native APIs such as the AOM and DOM.

### Reliability

- By using the results rendered by the browser, a highly reliable audit is possible.
- `acot` provides original rules. In addition, it offers rules based on the proven [axe](https://github.com/dequelabs/axe-core).

### Extensibility

- You can use the rules published in the [ESLint](https://eslint.org/) Like plugin system.
- It's easy to implement and publish the rule sets you need for your team.
- The divided packages allow you to assemble a custom workflow that works best for your team.

### Portability

- You can create and publish your own configuration with Sharable Config.
- Provides Custom Runner for integration with Storybook.

## Getting Started

Install via npm:

```bash
$ npm install --save-dev @acot/cli

# or

$ npm install --save-dev @acot/cli puppeteer
```

You can build the configuration file and install the dependent packages with the following commands:

```bash
$ npx acot init
```

And then, The `run` subcommand performs an audit based on the configuration file.

```bash
$ npx acot run
```

See the [CLI documentation](packages/cli) for details.

## Requirements

- Node.js 12.0.0+

## How does it work?

_T.B.A_

## Packages

`acot` has a feature which is divided into several packages.

### Foundations

- [@acot/core](./packages/core/)
- [@acot/cli](./packages/cli/)

### Configs

- [@acot/acot-config](./packages/acot-config/)

### Plugings

- [@acot/acot-plugin-wcag](./packages/acot-plugin-wcag/)
- [@acot/acot-plugin-axe](./packages/acot-plugin-axe/)

### Runners

- [@acot/acot-runner-storybook](./packages/acot-runner-storybook/)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## FAQ

_T.B.A_

## Contributing

We are always welcoming your contribution :clap:

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT © wadackel](./LICENSE)
