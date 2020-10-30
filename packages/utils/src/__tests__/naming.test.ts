import { pkg2shorthand, shorthand2pkg } from '../naming';

describe('utils/naming', () => {
  test.each([
    ['foo', 'plugin', 'foo'],
    ['acot-plugin-scope', 'plugin', 'scope'],
    ['@scope/acot-plugin', 'plugin', '@scope'],
    ['@scope/acot-plugin-test', 'plugin', '@scope/test'],
    ['bar', 'reporter', 'bar'],
    ['acot-reporter-scope', 'reporter', 'scope'],
    ['@scope/acot-reporter', 'reporter', '@scope'],
    ['@scope/acot-reporter-test', 'reporter', '@scope/test'],
  ])('pkg2shorthand("%s", "%s") = "%s"', (input, prefix, expected) => {
    expect(pkg2shorthand(input, prefix)).toBe(expected);
  });

  test.each([
    ['scope', 'plugin', 'acot-plugin-scope'],
    ['acot-plugin-scope', 'plugin', 'acot-plugin-scope'],
    ['@scope', 'plugin', '@scope/acot-plugin'],
    ['@scope/test', 'plugin', '@scope/acot-plugin-test'],
    ['@scope/acot-plugin', 'plugin', '@scope/acot-plugin'],
    ['@scope/acot-plugin-test', 'plugin', '@scope/acot-plugin-test'],
    ['scope', 'reporter', 'acot-reporter-scope'],
    ['@scope', 'reporter', '@scope/acot-reporter'],
    ['@scope/test', 'reporter', '@scope/acot-reporter-test'],
  ])('shorthand2pkg("%s", "%s") = "%s"', (input, prefix, expected) => {
    expect(shorthand2pkg(input, prefix)).toBe(expected);
  });
});
