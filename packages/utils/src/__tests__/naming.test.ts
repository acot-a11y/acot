import { pkg2shorthand, shorthand2pkg } from '../naming';

describe('utils/naming', () => {
  test.each([
    ['foo', 'preset', 'foo'],
    ['acot-preset-scope', 'preset', 'scope'],
    ['@scope/acot-preset', 'preset', '@scope'],
    ['@scope/acot-preset-test', 'preset', '@scope/test'],
    ['bar', 'reporter', 'bar'],
    ['acot-reporter-scope', 'reporter', 'scope'],
    ['@scope/acot-reporter', 'reporter', '@scope'],
    ['@scope/acot-reporter-test', 'reporter', '@scope/test'],
  ])('pkg2shorthand("%s", "%s") = "%s"', (input, prefix, expected) => {
    expect(pkg2shorthand(input, prefix)).toBe(expected);
  });

  test.each([
    ['scope', 'preset', 'acot-preset-scope'],
    ['acot-preset-scope', 'preset', 'acot-preset-scope'],
    ['@scope', 'preset', '@scope/acot-preset'],
    ['@scope/test', 'preset', '@scope/acot-preset-test'],
    ['@scope/acot-preset', 'preset', '@scope/acot-preset'],
    ['@scope/acot-preset-test', 'preset', '@scope/acot-preset-test'],
    ['scope', 'reporter', 'acot-reporter-scope'],
    ['@scope', 'reporter', '@scope/acot-reporter'],
    ['@scope/test', 'reporter', '@scope/acot-reporter-test'],
  ])('shorthand2pkg("%s", "%s") = "%s"', (input, prefix, expected) => {
    expect(shorthand2pkg(input, prefix)).toBe(expected);
  });
});
