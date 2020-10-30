import path from 'path';
import { RunnerLoader } from '../loader';

describe('RunnerLoader', () => {
  let loader: RunnerLoader;

  beforeEach(() => {
    loader = new RunnerLoader(path.resolve(__dirname, 'fixtures'));
  });

  test('load - file', () => {
    expect(loader.load('./runner')).toBe('runner');
  });

  test('load - package', () => {
    expect(loader.load('example')).toBe('example');
  });
});
