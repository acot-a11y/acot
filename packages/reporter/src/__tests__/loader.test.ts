import path from 'path';
import { ReporterLoader } from '../loader';

describe('ReporterLoader', () => {
  let loader: ReporterLoader;

  beforeEach(() => {
    loader = new ReporterLoader(path.resolve(__dirname, 'fixtures'));
  });

  test('load - built-in', () => {
    expect(loader.load('pretty')).toBe(require('../reporters/pretty').default);
  });

  test('load - local file', () => {
    expect(loader.load('./local')).toBe(require('./fixtures/local'));
    expect(loader.load('./local.js')).toBe(require('./fixtures/local'));
  });

  test('load - package', () => {
    expect(loader.load('test')).toBe(
      require('./fixtures/node_modules/acot-reporter-test.js'),
    );
  });

  test('load - not found', () => {
    expect(() => {
      loader.load('invalid-module');
    }).toThrowError(ReferenceError);
  });
});
