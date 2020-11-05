import { createRule } from '@acot/core';
import type { Rule } from '@acot/types';
import { DocGenerator } from '../doc-generator';
import { createDocProject } from '../__mocks__/doc-project';
import { createDocCode } from '../__mocks__/doc-code';

describe('DocGenerator', () => {
  let generator: DocGenerator;

  const factory = (recommended: boolean): Rule =>
    createRule({
      type: 'global',
      meta: {
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
        name: 'acot-preset-test',
        preset: {
          id: 'test',
          rules: new Map([
            ['test/rule1', factory(false)],
            ['test/rule2', factory(true)],
            ['test/rule3-long-rule-identity', factory(true)],
          ]),
          configs: new Map(),
        },
        codes: [
          createDocCode({
            path: '/root/docs/rules/rule1.md',
            rule: 'rule1',
            summary: {
              markdown: 'rule1 desc',
            },
          }),
          createDocCode({
            path: '/root/docs/rules/rule2.md',
            rule: 'rule2',
            summary: {
              markdown: 'rule2 desc',
            },
          }),
          createDocCode({
            path: '/root/docs/rules/rule3-long-rule-identity.md',
            rule: 'rule3-long-rule-identity',
            summary: {
              markdown: 'test/rule3-long-rule-identity desc',
            },
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
        name: '@scope/acot-preset',
        preset: {
          id: '@scope',
          rules: new Map([
            ['@scope/rule1', factory(false)],
            ['@scope/rule2', factory(true)],
          ]),
          configs: new Map(),
        },
        codes: [
          createDocCode({
            path: '/root/docs/rules/rule1.md',
            rule: 'rule1',
            summary: {
              markdown: 'rule1 desc',
            },
          }),
          createDocCode({
            path: '/root/docs/rules/rule2.md',
            rule: 'rule2',
            summary: {
              markdown: 'rule2 desc',
            },
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
        name: 'acot-preset-test',
        preset: {
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
