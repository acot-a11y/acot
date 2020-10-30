import { isFilepath } from '../is-filepath';

describe('isFilepath', () => {
  test.each([
    // name
    ['name', false],
    ['path/to', false],
    ['path/to/deep', false],
    ['@scope', false],
    ['@scope/foo', false],

    // path
    ['README.md', true],
    ['./README.md', true],
    ['path/to.js', true],
    ['./path/to.js', true],
    ['./path/to', true],
    ['/root/path', true],
  ])('"%s" = %p', (input, expected) => {
    expect(isFilepath(input)).toBe(expected);
  });
});
