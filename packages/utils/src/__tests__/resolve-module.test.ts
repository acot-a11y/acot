import path from 'path';
import { resolveModule } from '../resolve-module';

describe('resolveModule', () => {
  test('basic', () => {
    expect(resolveModule('fs')).toBe(require('fs'));
    expect(resolveModule('example')).toBe(require('../__mocks__/example.js'));
  });

  test('current working directory', () => {
    const from = path.join(__dirname, 'fixtures');

    expect(resolveModule('package-module', from)).toBe(
      require('./fixtures/node_modules/package-module.js'),
    );

    expect(resolveModule('fs', from)).toBe(require('fs'));
  });

  test('not found', () => {
    expect(() => resolveModule('__invalid_module__')).toThrow();
  });
});
