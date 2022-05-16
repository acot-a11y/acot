import { URL } from 'url';
import type { AcotRunnerCollectResult } from '@acot/acot-runner';
import { AcotRunner } from '@acot/acot-runner';
import { ConfigRouter } from '@acot/config';
import { createRunnerFactory } from '@acot/runner';
import { validate } from '@acot/schema-validator';
import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import { transform } from 'camaro';
import got from 'got';
import _ from 'lodash';
import micromatch from 'micromatch';
const debug = require('debug')('acot:runner:sitemap');

const DEFAULT_TIMEOUT = 30 * 1000;
const DEFAULT_RETRY = 3;

const schema = Type.Strict(
  Type.Object(
    {
      source: Type.String({ format: 'uri' }),
      include: Type.Optional(Type.Array(Type.String())),
      exclude: Type.Optional(Type.Array(Type.String())),
      limit: Type.Optional(Type.Number({ minimum: 0 })),
      random: Type.Optional(
        Type.Array(
          Type.Object(
            {
              pattern: Type.String(),
              limit: Type.Number({ minimum: 0 }),
            },
            {
              additionalProperties: false,
            },
          ),
        ),
      ),
      headers: Type.Optional(Type.Record(Type.String(), Type.String())),
      timeout: Type.Optional(Type.Number({ minimum: 1 })),
      retry: Type.Optional(Type.Number({ minimum: 0 })),
    },
    {
      additionalProperties: false,
    },
  ),
);

type Options = Static<typeof schema>;

const url2path = (url: string) => {
  const o = new URL(url);
  return o.pathname + o.search + o.hash;
};

const match = (path: string, pattern: string) =>
  micromatch.isMatch(path, pattern);

const filterUrls = (urls: string[], options: Options) => {
  const include = options.include ?? [];
  const exclude = options.exclude ?? [];
  const random = options.random ?? [];

  let results = urls;
  results = include.length > 0 ? micromatch(results, include) : results;
  results = exclude.length > 0 ? micromatch.not(results, exclude) : results;

  random.forEach(({ pattern, limit }) => {
    const filtered = results.filter((path) => match(path, pattern));
    if (filtered.length <= limit) {
      return;
    }

    const targets = _.shuffle(filtered).slice(0, limit);

    results = results.filter((path) => {
      if (filtered.includes(path)) {
        return targets.includes(path);
      }

      return true;
    });
  });

  return results;
};

const fetchSitemap = async (url: string, options: Options) => {
  debug('fetch sitemap: %s', url);

  const xml = await got(url, {
    headers: options.headers,
    timeout: options.timeout!,
    retry: {
      limit: options.retry!,
    },
  }).text();

  const transformed: { urls: string[]; maps: string[] } = await transform(xml, {
    urls: ['/urlset/url', 'loc'],
    maps: ['/sitemapindex/sitemap', 'loc'],
  });

  let urls = transformed.urls.map(url2path);

  if (transformed.maps.length > 0) {
    const children = await Promise.all(
      transformed.maps.map((child) => fetchSitemap(child, options)),
    );

    urls = urls.concat(...children);
  }

  return filterUrls(urls, options);
};

export class SitemapRunner extends AcotRunner<Options> {
  protected async collect(): AcotRunnerCollectResult {
    const sources = await super.collect();

    const router = new ConfigRouter(this.config);

    let entries = await fetchSitemap(this.options.source, {
      timeout: DEFAULT_TIMEOUT,
      retry: DEFAULT_RETRY,
      ...this.options,
    });

    entries =
      this.options.limit != null
        ? entries.slice(0, this.options.limit)
        : entries;

    debug('collected paths: %O', entries);

    entries.forEach((path) => {
      const entry = router.resolve(path);

      debug('path: %s, %o', path, entry);

      sources.set(path, {
        rules: entry.rules,
        presets: entry.presets,
        headers: entry.headers,
      });
    });

    return sources;
  }
}

export default createRunnerFactory<Options>((config) => {
  validate(schema, config.options, {
    name: 'SitemapRunner',
    base: 'options',
  });

  debug('received valid options:', config.options);

  return new SitemapRunner({
    ...config,
    name: 'sitemap',
    version: require('../package.json').version,
  });
});
