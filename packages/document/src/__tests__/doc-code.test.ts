import { extractCodeMeta, generateDocPath, generateDocUrl } from '../doc-code';
import { createDocCode } from '../__mocks__/doc-code';

describe('doc-code', () => {
  test.each([
    [createDocCode(), {}],
    [
      createDocCode({
        meta: {
          foo: 'foo',
          bar: 'bar',
        },
      }),
      {
        foo: 'foo',
        bar: 'bar',
      },
    ],
    [
      createDocCode({
        meta: {
          'acot-ignore': true,
          'acot-template': 'template',
          'acot-foo': 'foo',
          bar: 'bar',
        },
      }),
      {
        'acot-foo': 'foo',
        bar: 'bar',
      },
    ],
  ])('extractCodeMeta(%p) = %p', (input, expected) => {
    expect(extractCodeMeta(input)).toEqual(expected);
  });

  test.each([
    [createDocCode(), '//'],
    [
      createDocCode({
        rule: 'foo',
        id: 'bar',
      }),
      '/foo/bar',
    ],
  ])('generateDocPath(%p) = %s', (input, expected) => {
    expect(generateDocPath(input)).toBe(expected);
  });

  test.each([
    [1234, createDocCode(), 'http://localhost:1234//'],
    [
      8000,
      createDocCode({
        rule: 'foo',
        id: 'bar',
      }),
      'http://localhost:8000/foo/bar',
    ],
  ])('generateDocUrl(%f, %p) = %s', (port, input, expected) => {
    expect(generateDocUrl(port, input)).toBe(expected);
  });
});
