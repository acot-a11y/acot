import { validate } from '../validate';

describe('validate', () => {
  test('call schema-utils validate', () => {
    expect(() => {
      validate(
        {
          properties: {
            foo: {
              type: 'array',
              items: {
                type: 'number',
              },
            },
            bar: {
              type: 'string',
            },
          },
          additionalProperties: false,
        },
        {
          foo: ['string', 'test'],
          bar: null,
          baz: false,
        },
        {
          name: 'Mock',
          base: 'options',
        },
      );
    }).toThrowErrorMatchingSnapshot();
  });
});
