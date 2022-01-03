# @acot/acot-reporter-github

GitHub reporter for `@acot/cli`.

## Installation

Install via npm:

```bash
$ npm install --save @acot/acot-reporter-github
```

## Prerequisites

There are a few necessary setups for integrating acot with GitHub.

1. Install the [acot-a11y GitHub App](https://github.com/apps/acot-a11y) in the repository where you want to use GitHub integration.
1. Generate a token for GitHub integration from the [token manager application](https://gh-app.acot.dev).

## Usage

```javascript
module.exports = {
  reporter: {
    use: '@acot/github',
    with: {
      token: '...',
    },
  },
};
```

### Pass the token as an environment variable

If you pass a token to the `ACOT_GITHUB_APP_TOKEN` environment variable, the GitHub reporter will automatically resolve the token for you. It is one technique to avoid writing the token directly into the configuration file.

```javascript
module.exports = {
  reporter: '@acot/github',
};
```