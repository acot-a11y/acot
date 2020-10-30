import path from 'path';
import { closestPackageJson } from '../closest-package-json';

describe('closest-package-json', () => {
  test('closestPackageJson - success', () => {
    expect(closestPackageJson(__dirname)).toEqual(
      require('../../../package.json'),
    );

    expect(closestPackageJson(path.resolve(__dirname, '../../../../'))).toEqual(
      require('../../../../../package.json'),
    );
  });

  test('closestPackageJson - failure', () => {
    expect(
      closestPackageJson('/__invalid_closest_package_json__path'),
    ).toBeNull();
  });
});
