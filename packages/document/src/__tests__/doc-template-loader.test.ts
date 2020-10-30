import fs from 'mock-fs';
import type { DocTemplateLoader } from '../doc-template-loader';

describe('DocTemplateLoader', () => {
  const FILEPATH = 'path/template.html';
  const CONTENT = 'template';
  let loader: DocTemplateLoader;

  beforeEach(async () => {
    const { DocTemplateLoader } = await import('../doc-template-loader');

    loader = new DocTemplateLoader();

    fs({
      [FILEPATH]: CONTENT,
    });
  });

  afterEach(() => {
    fs.restore();
  });

  test('load - success', async () => {
    // load
    expect(loader.load(FILEPATH)).toBe(CONTENT);

    fs({
      [FILEPATH]: 'override',
    });

    // cache hit
    expect(loader.load(FILEPATH)).toBe(CONTENT);

    loader.clear();

    expect(loader.load(FILEPATH)).toBe('override');
  });

  test('load - failure', () => {
    expect(() => {
      loader.load('__notfound__');
    }).toThrow();
  });
});
