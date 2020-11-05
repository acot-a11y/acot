import { parseExtendPath } from '../parse-extend-path';

describe('parseExternalPath', () => {
  test.each([
    [
      './fileid.js',
      {
        resource: 'file',
        id: './fileid.js',
        path: null,
        name: null,
      },
    ],
    [
      './nest/fileid.js',
      {
        resource: 'file',
        id: './nest/fileid.js',
        path: null,
        name: null,
      },
    ],
    [
      'preset:pkg/recommended',
      {
        resource: 'preset',
        id: 'acot-preset-pkg',
        path: null,
        name: 'recommended',
      },
    ],
    [
      'preset:@scope/recommended',
      {
        resource: 'preset',
        id: '@scope/acot-preset',
        path: null,
        name: 'recommended',
      },
    ],
    [
      'preset:@scope/pkg/recommended',
      {
        resource: 'preset',
        id: '@scope/acot-preset-pkg',
        path: null,
        name: 'recommended',
      },
    ],
    [
      'pkg',
      {
        resource: 'config',
        id: 'acot-config-pkg',
        path: null,
        name: null,
      },
    ],
    [
      'pkg/path/to',
      {
        resource: 'config',
        id: 'acot-config-pkg/path/to',
        path: 'path/to',
        name: null,
      },
    ],
    [
      'acot-config-pkg/path/to',
      {
        resource: 'config',
        id: 'acot-config-pkg/path/to',
        path: 'path/to',
        name: null,
      },
    ],
    [
      '@scope',
      {
        resource: 'config',
        id: '@scope/acot-config',
        path: null,
        name: null,
      },
    ],
    [
      '@scope/acot-config',
      {
        resource: 'config',
        id: '@scope/acot-config',
        path: null,
        name: null,
      },
    ],
    [
      '@scope/acot-config/path/to',
      {
        resource: 'config',
        id: '@scope/acot-config/path/to',
        path: 'path/to',
        name: null,
      },
    ],
    [
      '@scope/pkg',
      {
        resource: 'config',
        id: '@scope/acot-config-pkg',
        path: null,
        name: null,
      },
    ],
    [
      '@scope/pkg/path/to',
      {
        resource: 'config',
        id: '@scope/acot-config-pkg/path/to',
        path: 'path/to',
        name: null,
      },
    ],
    [
      '@scope/acot-config-pkg',
      {
        resource: 'config',
        id: '@scope/acot-config-pkg',
        path: null,
        name: null,
      },
    ],
    [
      '@scope/acot-config-pkg/path/to',
      {
        resource: 'config',
        id: '@scope/acot-config-pkg/path/to',
        path: 'path/to',
        name: null,
      },
    ],
  ])('valid "%s"', (input, expected) => {
    expect(parseExtendPath(input)).toEqual(expected);
  });

  test.each([
    'preset:pkg',
    'pkg:recommended',
    'pkg/path/to:recommended',
    'acot-config-pkg:recommended',
    'acot-config-pkg/path/to:recommended',
  ])('invalid "%s"', (input) => {
    expect(() => {
      parseExtendPath(input);
    }).toThrowError(Error);
  });
});
