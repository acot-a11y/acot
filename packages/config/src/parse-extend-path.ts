import { shorthand2pkg, isFilepath } from '@acot/utils';

const PLUGIN_PREFIX = 'plugin:';

export type ExtendPath = {
  resource: 'file' | 'plugin' | 'config';
  id: string;
  path: string | null;
  name: string | null;
};

export const parseExtendPath = (input: string): ExtendPath => {
  // for file
  if (isFilepath(input)) {
    return {
      resource: 'file',
      id: input,
      path: null,
      name: null,
    };
  }

  // for plugin
  if (input.startsWith(PLUGIN_PREFIX)) {
    const last = input.lastIndexOf('/');
    if (last < 0) {
      throw new Error(
        `Configuration name is required to refer to the plugin's configs. (expect "${PLUGIN_PREFIX}{id}/{configname}", but actual "${input}")`,
      );
    }

    const id = input.substring(PLUGIN_PREFIX.length, last);
    const name = input.substring(last + 1);

    return {
      resource: 'plugin',
      id: shorthand2pkg(id, 'plugin'),
      path: null,
      name,
    };
  }

  // for shareable config
  if (input.indexOf(':') > -1) {
    throw new Error(
      `Configuration name is an invalid format. (expect "{configname}/[path/to...]", but actual "${input}")`,
    );
  }

  const segments = input.split('/');
  const separate = /^@/.test(input) ? 2 : 1;
  const id = segments.slice(0, separate).join('/');
  const parts = segments.slice(separate).join('/');

  return {
    resource: 'config',
    id: `${shorthand2pkg(id, 'config')}${parts ? `/${parts}` : ''}`,
    path: parts || null,
    name: null,
  };
};
