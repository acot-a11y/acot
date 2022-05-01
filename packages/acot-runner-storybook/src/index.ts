import type { AcotRunnerCollectResult } from '@acot/acot-runner';
import { AcotRunner } from '@acot/acot-runner';
import { ConfigRouter, resolveConfig } from '@acot/config';
import { createRunnerFactory } from '@acot/runner';
import { validate } from '@acot/schema-validator';
import type { ConfigEntry, ResolvedConfig } from '@acot/types';
import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import deepmerge from 'deepmerge';
import { isPlainObject } from 'is-plain-object';
import micromatch from 'micromatch';
import puppeteer from 'puppeteer-core';
const debug = require('debug')('acot:runner:storybook');

const DEFAULT_TIMEOUT = 60 * 1000;

type StoryParams = Omit<ConfigEntry, 'include' | 'exclude'>;

type Story = {
  id: string;
  kind: string;
  name: string;
  parameters?: {
    acot?: StoryParams;
  };
};

type AcotStory = {
  id: string;
  kind: string;
  name: string;
  params: StoryParams;
};

declare global {
  // eslint-disable-next-line
  interface Window {
    __STORYBOOK_CLIENT_API__: {
      raw: () => Story[];
      store?: () => {
        _configuring?: boolean; // This parameter is enabled with SB v6 or later
      };
    };
  }
}

const isMergeableObject = (v: any) => Array.isArray(v) || isPlainObject(v);

const filterStories = (
  stories: AcotStory[],
  include: string[],
  exclude: string[],
) => {
  const match = (story: AcotStory, pattern: string) =>
    micromatch.isMatch(`${story.kind}/${story.name}`, pattern);

  let results = stories;

  results =
    include.length > 0
      ? results.filter((story) =>
          include.some((pattern) => match(story, pattern)),
        )
      : results;

  results =
    exclude.length > 0
      ? results.filter((story) =>
          exclude.every((pattern) => !match(story, pattern)),
        )
      : results;

  return results;
};

const schema = Type.Strict(
  Type.Object(
    {
      include: Type.Optional(Type.Array(Type.String())),
      exclude: Type.Optional(Type.Array(Type.String())),
      timeout: Type.Optional(Type.Number()),
    },
    {
      additionalProperties: false,
    },
  ),
);

type Options = Static<typeof schema>;

export class StorybookRunner extends AcotRunner<Options> {
  protected async collect(): AcotRunnerCollectResult {
    // get stories
    const browser = await puppeteer.launch(this.config.launchOptions);
    const page = await browser.newPage();

    page.setDefaultTimeout(this.options.timeout ?? DEFAULT_TIMEOUT);

    let stories: AcotStory[] = [];

    try {
      await page.goto(`${this.config.origin}/iframe.html?id=__ACOTSTORYBOOK__`);
      await page.waitForFunction(() => window.__STORYBOOK_CLIENT_API__);

      /**
       * Heavy inspired by:
       * @see https://github.com/reg-viz/storycap/blob/077ee4ba894baefe43fc74b26d73964dbf042815/packages/storycrawler/src/browser/stories-browser.ts#L63-L95
       */

      // SB (v6 or later) api's `raw()` can return empty array til SB store gets configured.
      // See https://github.com/storybookjs/storybook/pull/9914 .
      await page.waitForFunction(() => window.__STORYBOOK_CLIENT_API__, {
        timeout: 60_000,
      });

      const raw = await page.evaluate(
        () =>
          new Promise<{
            stories: AcotStory[];
            timeout: boolean;
          }>((resolve) => {
            const MAX_CONFIGURE_WAIT_COUNT = 4_000;

            (function getStories(count = 0) {
              const api = window.__STORYBOOK_CLIENT_API__;

              // for Storybook v6
              const configuring = api.store?.()?._configuring;
              if (configuring) {
                if (count < MAX_CONFIGURE_WAIT_COUNT) {
                  setTimeout(() => getStories(++count), 16);
                } else {
                  resolve({ stories: [], timeout: true });
                }
                return;
              }

              // for Storybook v5
              resolve({
                stories: api.raw().map((o) => ({
                  id: o.id,
                  kind: o.kind,
                  name: o.name,
                  params: o.parameters?.acot ?? {},
                })),
                timeout: false,
              });
            })();
          }),
      );

      debug('get stories: %O', raw);

      stories = filterStories(
        raw.stories,
        this.options.include ?? [],
        this.options.exclude ?? [],
      );

      debug('filtered stories: %O', stories);
    } finally {
      await page.close();
      await browser.close();
    }

    // collect results
    const sources = new Map();
    const router = new ConfigRouter(this.config);

    await Promise.all(
      stories.map(async (story) => {
        const path = `/iframe.html?id=${story.id}`;
        const entry = router.resolve(path);
        const cfg: ResolvedConfig = await resolveConfig(story.params);

        debug('path: %s, %O', path, entry, cfg);

        sources.set(
          path,
          deepmerge(
            {
              rules: entry.rules,
              presets: entry.presets,
              headers: entry.headers,
            },
            {
              rules: cfg.rules,
              presets: cfg.presets,
              headers: cfg.headers,
            },
            {
              isMergeableObject,
            },
          ),
        );
      }),
    );

    return sources;
  }
}

export default createRunnerFactory<Options>((config) => {
  validate(schema, config.options, {
    name: 'StorybookRunner',
    base: 'options',
  });

  debug('received valid options: ', config.options);

  return new StorybookRunner({
    ...config,
    name: 'storybook',
    version: require('../package.json').version,
  });
});
