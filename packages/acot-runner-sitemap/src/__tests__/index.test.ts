import path from 'path';
import http from 'http';
import handler from 'serve-handler';
import { MockCore } from '@acot/mock';
import factory, { SitemapRunner } from '../';

const PORT = 1236;
const SOURCE = `http://localhost:${PORT}/sitemap.xml`;

describe('Sitemap Runner', () => {
  let server: http.Server;

  const config = {
    core: new MockCore(),
    config: {
      rules: {
        '@example/foo': ['error'],
        '@example/bar': ['error'],
      },
      overrides: [
        {
          include: ['/page1*'],
          rules: {
            '@example/bar': ['off'],
          },
        },
      ],
    } as any,
    options: {
      source: SOURCE,
    },
    name: '',
    version: '',
  };

  beforeAll(
    () =>
      new Promise<void>((resolve) => {
        server = http.createServer((request, response) =>
          handler(request, response, {
            public: path.resolve(__dirname, 'fixtures'),
          }),
        );

        server.listen(PORT, () => {
          resolve();
        });
      }),
  );

  afterAll(
    () =>
      new Promise<void>((resolve) => {
        server.close(() => {
          resolve();
        });
      }),
  );

  test.each([
    [
      {
        source: SOURCE,
      },
    ],
    [
      {
        source: SOURCE,
        include: ['pattern'],
      },
    ],
    [
      {
        source: SOURCE,
        exclude: ['pattern'],
      },
    ],
    [
      {
        source: SOURCE,
        limit: 100,
      },
    ],
    [
      {
        source: SOURCE,
        random: [
          {
            pattern: 'pattern',
            limit: 5,
          },
        ],
      },
    ],
    [
      {
        source: SOURCE,
        headers: {
          'x-acot': 'true',
        },
      },
    ],
  ])('options - valid (%p)', (options) => {
    expect(() => {
      factory({
        ...config,
        options,
      });
    }).not.toThrow();
  });

  test.each<[any]>([
    [{}],
    [{ source: '/path/to' }],
    [{ source: SOURCE, include: [0] }],
    [{ source: SOURCE, exclude: [0] }],
    [{ source: SOURCE, limit: 'str' }],
    [{ source: SOURCE, limit: -1 }],
    [
      {
        source: SOURCE,
        random: [
          {
            pattern: 'pattern',
          },
        ],
      },
    ],
    [
      {
        source: SOURCE,
        random: [
          {
            pattern: 'pattern',
            limit: -1,
          },
        ],
      },
    ],
    [{ source: SOURCE, headers: 'str' }],
  ])('options - invalid (%p)', (options) => {
    expect(() => {
      factory({
        ...config,
        options,
      });
    }).toThrow();
  });

  test('collect - sitemapindex', async () => {
    const sources = await new SitemapRunner(config)['collect']();

    expect(Array.from(sources.keys())).toEqual([
      '/',
      '/page1?search=query',
      '/page2?search=query#hash',
      '/page3',
      '/page4',
    ]);

    expect(sources.get('/')!.rules).toEqual({
      '@example/foo': ['error'],
      '@example/bar': ['error'],
    });

    expect(sources.get('/page1?search=query')!.rules).toEqual({
      '@example/foo': ['error'],
      '@example/bar': ['off'],
    });
  });

  test('collect - urlset', async () => {
    const sources = await new SitemapRunner({
      ...config,
      options: {
        ...config.options,
        source: `http://localhost:${PORT}/sitemap_0002.xml`,
      },
    })['collect']();

    expect(Array.from(sources.keys())).toEqual(['/page3', '/page4']);
  });

  test('collect - include and exclude', async () => {
    const sources = await new SitemapRunner({
      ...config,
      options: {
        ...config.options,
        include: ['/page*'],
        exclude: ['/page(3|4)'],
      },
    })['collect']();

    expect(Array.from(sources.keys())).toEqual([
      '/page1?search=query',
      '/page2?search=query#hash',
    ]);
  });

  test('collect - limit=3', async () => {
    const sources = await new SitemapRunner({
      ...config,
      options: {
        ...config.options,
        limit: 3,
      },
    })['collect']();

    expect(Array.from(sources.keys())).toEqual([
      '/',
      '/page1?search=query',
      '/page2?search=query#hash',
    ]);
  });

  test('collect - random', async () => {
    const sources = await new SitemapRunner({
      ...config,
      options: {
        ...config.options,
        source: `http://localhost:${PORT}/sitemap_random.xml`,
        limit: 10,
        random: [
          {
            pattern: '/guidelines/*',
            limit: 2,
          },
          {
            pattern: '/guidelines/*/ba*',
            limit: 2,
          },
          {
            pattern: '/docs/**/*',
            limit: 2,
          },
        ],
      },
    })['collect']();

    const keys = Array.from(sources.keys());

    expect(keys).toHaveLength(10);

    expect(keys).toContain('/');
    expect(keys).toContain('/guidelines/');
    expect(keys).toContain('/guidelines/nest1/foo');
    expect(keys).toContain('/guidelines/nest2/foo');
    expect(keys).toContain('/docs/');

    expect(keys).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/\/guidelines\/(foo|bar|baz)/),
        expect.stringMatching(/\/guidelines\/(nest1|nest2)\/(bar|baz)/),
      ]),
    );
  });

  test('collect - merge paths', async () => {
    const paths = ['/merge1.html', '/merge2.html'];

    const sources = await new SitemapRunner({
      ...config,
      config: {
        ...config.config,
        paths,
      },
    })['collect']();

    expect(Array.from(sources.keys())).toEqual([
      ...paths,
      '/',
      '/page1?search=query',
      '/page2?search=query#hash',
      '/page3',
      '/page4',
    ]);
  });

  test('collect - source not found', async () => {
    await expect(
      new SitemapRunner({
        ...config,
        options: {
          source: `http://localhost:${PORT}/__404__`,
        },
      })['collect'](),
    ).rejects.toThrowError();
  });

  test('collect - child sitemap not found', async () => {
    await expect(
      new SitemapRunner({
        ...config,
        options: {
          source: `http://localhost:${PORT}/sitemap_404.xml`,
        },
      })['collect'](),
    ).rejects.toThrowError();
  });

  test('collect - parser error', async () => {
    await expect(
      new SitemapRunner({
        ...config,
        options: {
          source: `http://localhost:${PORT}/sitemap_invalid.xml`,
        },
      })['collect'](),
    ).rejects.toThrowError();
  });
});
