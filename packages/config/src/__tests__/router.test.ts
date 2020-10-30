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
    plugins: [],
    overrides: [
      {
        include: ['/dir1/**/*'],
        rules: {
          root: ['warn', null],
          childA: ['error', null],
        },
        plugins: [],
      },
      {
        include: ['/dir2/file1'],
        rules: {
          root: ['off', null],
          childB: ['warn', null],
        },
        plugins: [],
      },
      {
        include: ['/dir3/*/file1'],
        rules: {
          root: ['warn', null],
          chlidC: ['error', null],
        },
        plugins: [],
      },
      {
        include: ['/dir3/nest3/*'],
        exclude: ['/**/*/file2'],
        rules: {
          root: ['warn', null],
          childD: ['warn', null],
        },
        plugins: [],
      },
    ],
  };

  test.each([
    ['/', config],
    ['/dir1/file1', config.overrides![0]],
    ['/dir1/file1?query=value', config.overrides![0]],
    ['/dir2/file1', config.overrides![1]],
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
