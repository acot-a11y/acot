import { createRule } from '@acot/core';
import type { Rule } from '@acot/types';
import { DocGenerator } from '../doc-generator';
import { createDocProject } from '../__mocks__/doc-project';
import { createDocCode } from '../__mocks__/doc-code';

describe('DocGenerator', () => {
  let generator: DocGenerator;

  const factory = (description: string, recommended: boolean): Rule =>
    createRule({
      type: 'global',
      meta: {
        description,
        recommended,
      },
      test: async () => {},
    });

  beforeEach(() => {
    generator = new DocGenerator();
  });

  test('basic', async () => {
    const output = await generator.generate(
      createDocProject({
        root: '/root',
        name: 'acot-plugin-test',
        plugin: {
          id: 'test',
          rules: new Map([
            ['test/rule1', factory('rule1 desc', false)],
            ['test/rule2', factory('rule2 desc', true)],
            [
              'test/rule3-long-rule-identity',
              factory('test/rule3-long-rule-identity desc', true),
            ],
          ]),
          configs: new Map(),
        },
        codes: [
          createDocCode({
            path: '/root/docs/rules/rule1.md',
            rule: 'rule1',
          }),
          createDocCode({
            path: '/root/docs/rules/rule2.md',
            rule: 'rule2',
          }),
          createDocCode({
            path: '/root/docs/rules/rule3-long-rule-identity.md',
            rule: 'rule3-long-rule-identity',
          }),
        ],
      }),
    );

    expect(output).toMatchSnapshot();
  });

  test('scoped package', async () => {
    const output = await generator.generate(
      createDocProject({
        root: '/root',
        name: '@scope/acot-plugin',
        plugin: {
          id: '@scope',
          rules: new Map([
            ['@scope/rule1', factory('rule1 desc', false)],
            ['@scope/rule2', factory('rule2 desc', true)],
          ]),
          configs: new Map(),
        },
        codes: [
          createDocCode({
            path: '/root/docs/rules/rule1.md',
            rule: 'rule1',
          }),
          createDocCode({
            path: '/root/docs/rules/rule2.md',
            rule: 'rule2',
          }),
        ],
      }),
    );

    expect(output).toMatchSnapshot();
  });

  test('empty', async () => {
    const output = await generator.generate(
      createDocProject({
        root: '/root',
        name: 'acot-plugin-test',
        plugin: {
          id: 'test',
          rules: new Map(),
          configs: new Map(),
        },
        codes: [],
      }),
    );

    expect(output).toBe('');
  });
});
