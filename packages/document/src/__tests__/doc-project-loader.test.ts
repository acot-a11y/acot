import path from 'path';
import { DocProjectLoader } from '../doc-project-loader';
import { createDocProject } from '../__mocks__/doc-project';
import { createDocCode } from '../__mocks__/doc-code';

describe('DocProjectLoader', () => {
  const FIXTURES_DIR = path.resolve(__dirname, 'fixtures');
  let loader: DocProjectLoader;

  beforeEach(() => {
    loader = new DocProjectLoader({
      docs: 'docs',
    });
  });

  test('valid project', async () => {
    const root = path.join(path.join(FIXTURES_DIR, 'valid'));
    const project = await loader.load(root);

    expect(project).toEqual(
      createDocProject({
        root,
        name: 'acot-plugin-test',
        main: 'index.js',
        plugin: {
          id: 'index',
          rules: new Map<string, any>([
            ['index/rule1', {}],
            ['index/rule2', {}],
          ]),
          configs: new Map(),
        },
        codes: [
          createDocCode({
            html: 'correct1',
            id: '1',
            meta: {},
            path: path.join(root, 'docs', 'rule1.md'),
            rule: 'rule1',
            type: 'correct',
          }),
          createDocCode({
            html: 'incorrect1',
            id: '2',
            meta: {},
            path: path.join(root, 'docs', 'rule1.md'),
            rule: 'rule1',
            type: 'incorrect',
          }),
          createDocCode({
            html: 'correct1',
            id: '1',
            meta: {},
            path: path.join(root, 'docs', 'rule2.md'),
            rule: 'rule2',
            type: 'correct',
          }),
          createDocCode({
            html: 'incorrect1',
            id: '2',
            meta: {},
            path: path.join(root, 'docs', 'rule2.md'),
            rule: 'rule2',
            type: 'incorrect',
          }),
        ],
      }),
    );
  });

  test('invalid - non-existent project', async () => {
    await expect(
      loader.load(path.join(FIXTURES_DIR, '__invalid__')),
    ).rejects.toThrow();
  });

  test('invalid - missing package.json', async () => {
    await expect(
      loader.load(path.join(FIXTURES_DIR, 'missing-pkg')),
    ).rejects.toThrow();
  });

  test('invalid - missing name field', async () => {
    await expect(
      loader.load(path.join(FIXTURES_DIR, 'missing-pkg-name')),
    ).rejects.toThrow('"name"');
  });

  test('invalid - missing main field', async () => {
    await expect(
      loader.load(path.join(FIXTURES_DIR, 'missing-pkg-main')),
    ).rejects.toThrow('"main"');
  });

  test('invalid - missing main file', async () => {
    await expect(
      loader.load(path.join(FIXTURES_DIR, 'missing-pkg-main-file')),
    ).rejects.toThrow('hoge.js');
  });

  test('empty docs', async () => {
    const root = path.join(FIXTURES_DIR, 'missing-docs');
    const project = await loader.load(root);

    expect(project).toEqual(
      createDocProject({
        root,
        name: 'acot-plugin-test',
        main: 'index.js',
        plugin: {
          id: 'index',
          rules: new Map(),
          configs: new Map(),
        },
      }),
    );
  });
});
