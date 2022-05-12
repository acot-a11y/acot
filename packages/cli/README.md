# @acot/cli

acot's built-in Command Line Interface.

Its main function is to execute an audit. It also provides other features to help you create configuration files and develop presets.

## Installation

Install via npm:

```bash
$ npm install --save-dev @acot/cli

# or

$ npm install --save-dev @acot/cli puppeteer
```

**Note:**

`acot` can be installed globally, but we recommend doing a local install.

## Usage

Please install `@acot/cli` first before `npx acot`. Other than `npx`, you can also drop it inside of an npm run script or you may instead execute with the relative path instead. `./node_modules/.bin/acot`.

```bash
$ npx acot <command> [flags]
```

Run `npx acot --help` or `npx acot help` for full help.

### Global Flags

#### `-q`, `--quiet`

Disable stdout/stderr.

**Example:**

```bash
$ npx acot run --quiet
```

#### `-v`, `--verbose`

Enable logging. Indicators such as Progress and Spinner are disabled.

**Example:**

```bash
$ npx acot run --verbose
```

#### `--debug`

Dump debug information for acot modules. Can filter output by specifying the module name.

**Example:**

```bash
# all modules
$ npx acot run --debug

# core module
$ npx acot run --debug "core"

# cli module
$ npx acot run --debug "cli"

# acot-preset-wcag rules
$ npx acot run --debug "wcag/*"
```

### `--no-color`

Force disabling of color. acot uses the [chalk](https://github.com/chalk/chalk) package. See the [chalk documentation](https://github.com/chalk/chalk) for more details.

**Example:**

```bash
$ npx acot run --no-color
```

#### `--help`

Show help.

**Example:**

```bash
$ npx acot --help
$ npx acot run --help
```

#### `--version`

Output the version number.

**Example:**

```bash
$ npx acot --version
```

### Commands

The acot CLI has several subcommands. The following is an overview of them and how to use them.

#### `init`

Building a config file and installing dependent packages. See the [Configuration](../../docs/configuration.md) for details.

```bash
acot init [flags]
```

**Flags:**

```bash
-o, --origin                  Audit server base URL.
-C, --command                 Command to launch the local server.
    --use-recommended-config  Use the config recommended by acot.
-r, --runner                  Runner to use for audit.
-s, --format                  Format to use for the configuration file.
    --install-puppeteer       Install Puppeteer as a dependency.
    --no-install-puppeteer    Not install Puppeteer as a dependency.
    --npm-client              npm client to use for dependent packages installations. (npm or yarn)
```

**Example:**

```bash
# Answer all questions interactively
$ npx acot init

# Answer some questions with flag
$ npx acot --format javascript --use-recommended-config
```

#### `run`

Running an audit. acot automatically reads and uses the configuration file. If you want to change the file to use, use `--config` flag.

```bash
acot run <paths..> [flags]
```

**Flags:**

```bash
-o, --origin                  Target server URL origin.
-C, --command                 Command to launch the local server.
    --reporter                Name of the reporter. (default: "@acot/pretty")
    --reporter-with           Reporter options. Specify the JSON as a string.
-p, --parallel                Number of parallel audit browsers. (default: "os.cpus().length - 1")
-c, --config                  Provide path to a acot configuration file (e.g. "./acot.config.js")
-V, --viewport                Viewport used for browser access. One of JSON string or "<number>x<number>".
    --working-dir             Directory path used by acot store temporary files. (default: ".acot")
    --max-warnings            Warning threshold to be treated as an error.
    --connection-timeout      Timeout ms for connecting to the host server.
    --browser-timeout         Timeout ms to wait for pooled browsers.
    --ready-timeout           Timeout ms waiting for page load.
    --chrome-channel          Channel to search local Chromium. One of "puppeteer", "canary", "stable", "*". (default: "*")
    --chrome-executable-path  Executable Chromium path.
    --launch-options          JSON string of launch config for Puppeteer.
```

**Example:**

```bash
$ npx acot run
$ npx acot run --origin "https://example.com"
$ npx acot run --reporter "dot"
$ npx acot run --config "./acot.config.storybook.js"
$ npx acot run --command "npm start"
```

#### `preset test`

Test the rules provided by the preset according to the documentation.

```bash
acot preset test [flags]
```

**Flags:**

```bash
-p, --project   Directory path that contains the package.json that makes up the preset.
-d, --docs      Directory path that contains the rule documentation.
    --port      Port number for preview server.
    --parallel  Number of parallel audit browsers. (default: "os.cpus().length - 1")
```

**Example:**

```bash
$ npx acot preset test
$ npx acot preset test --port 3000
$ npx acot preset test --project "./packages/acot-preset"
$ npx acot preset test --docs "./docs"
```

#### `preset serve`

Launch a server that delivers the documentation created for the rules provided by the preset as HTML.

```bash
acot preset serve [flags]
```

**Flags:**

```bash
-p, --project   Directory path that contains the package.json that makes up the preset.
-d, --docs      Directory path that contains the rule documentation.
    --port      Port number for preview server.
-w, --watch     Watch document files.
    --no-open   Does not open the browser automatically.
```

**Example:**

```bash
$ npx acot preset serve
$ npx acot preset serve --port 3000
$ npx acot preset serve --watch
```

#### `preset docgen`

Document generation of the list of rules provided by the preset.

```bash
acot preset docgen <target> [flags]
```

**Flags:**

```bash
-p, --project   Directory path that contains the package.json that makes up the preset.
-d, --docs      Directory path that contains the rule documentation.
    --dry-run   Writes the document to standard output instead of a file.
```

**Example:**

```bash
$ npx acot preset docgen
$ npx acot preset docgen --dry-run
```

#### `help`

Show help.

```bash
acot help <command..>
```

**Example:**

```bash
$ npx acot help
$ npx acot help run
$ npx acot help preset serve
```

#### `version`

Show version.

```bash
acot version
```

**Example:**

```bash
$ npx acot version
```
