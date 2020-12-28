import type { ResolvedConfig } from '@acot/types';
import { ConfigRouter } from '../router';

describe('ConfigRouter', () => {
  const config: ResolvedConfig = {
    launchOptions: {},
    paths: [
      '/',
      '/dir1/file1',
      '/dir1/file2',
      '/dir2/file1',
      '/dir3/nest1/file1',
      '/dir3/nest2/file1',
      '/dir3/nest2/file2',
      '/dir3/nest3/file1',
      '/dir3/nest3/file2',
      '/dir3/nest3/file3',
    ],
    rules: {
      root: ['error', null],
    },
    presets: [],
    overrides: [
      {
        include: ['/dir1/**/*'],
        rules: {
          root: ['warn', null],
          childA: ['error', null],
        },
        presets: [],
      },
      {
        include: ['/dir2/file1'],
        rules: {
          childB: ['warn', null],
        },
        presets: [],
      },
      {
        include: ['/dir3/*/file1'],
        rules: {
          root: ['warn', null],
          chlidC: ['error', null],
        },
        presets: [],
      },
      {
        include: ['/dir3/nest3/*'],
        exclude: ['/**/*/file2'],
        rules: {
          root: ['warn', null],
          childD: ['warn', null],
        },
        presets: [],
      },
    ],
  };

  test.each([
    ['/', config],
    ['/dir1/file1', config.overrides![0]],
    ['/dir1/file1?query=value', config.overrides![0]],
    [
      '/dir2/file1',
      {
        ...config.overrides![1],
        rules: {
          ...config.rules,
          ...config.overrides![1].rules,
        },
      },
    ],
    ['/dir3/nest2/file1', config.overrides![2]],
    ['/dir3/nest3/file3', config.overrides![3]],
    ['/dir3/nest3/file2', config],
  ])('resolve("%s")', (input, expected) => {
    const router = new ConfigRouter(config);

    expect(router.resolve(input)).toEqual(expected);
  });

  test('resolve - not found', () => {
    const router = new ConfigRouter(config);

    expect(router.resolve('/__404__')).toEqual(config);
  });
});
