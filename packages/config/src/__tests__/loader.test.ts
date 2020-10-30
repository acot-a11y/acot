import path from 'path';
import { loadConfig } from '../loader';

const FIXTURES_DIR = path.resolve(__dirname, 'fixtures');

describe('loadConfig', () => {
  const opts = {
    cwd: FIXTURES_DIR,
  };

  test('success (search: acot.config.js)', async () => {
    const config = await loadConfig('.', opts);

    expect(config).toMatchSnapshot();
  });

  test('success (load: file.js)', async () => {
    const config = await loadConfig('./file.js', opts);

    expect(config).toMatchSnapshot();
  });

  test('not found config', async () => {
    await expect(
      loadConfig('./__notfound__/', { cwd: __dirname }),
    ).rejects.toThrow(ReferenceError);
  });
});
