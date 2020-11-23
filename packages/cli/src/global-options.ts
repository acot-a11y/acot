export const globalOptions = {
  quiet: {
    type: 'boolean',
    alias: 'q',
    description: 'Disable stdout/stderr',
  },
  verbose: {
    type: 'boolean',
    alias: ['v'],
    description: 'Enable logging.',
  },
  debug: {
    type: 'string',
    description:
      'Dump debug information for acot modules. Can filter output by specifying the module name. (e.g. --debug "core")',
  },
  'no-color': {
    type: 'boolean',
    description: 'Force disabling of color',
  },
  help: {
    type: 'boolean',
    description: 'Show help',
  },
  version: {
    type: 'boolean',
    description: 'Output the version number',
  },
} as const;
