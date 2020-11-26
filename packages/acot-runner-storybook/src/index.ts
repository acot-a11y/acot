import puppeteer from 'puppeteer-core';
import type { Schema } from '@acot/schema-validator';
import { validate } from '@acot/schema-validator';
import { ConfigRouter, resolveConfig } from '@acot/config';
import type { ResolvedConfig, ConfigEntry } from '@acot/types';
import type { RunCollectResult } from '@acot/runner';
import { createRunnerFactory } from '@acot/runner';
import deepmerge from 'deepmerge';
import { isPlainObject } from 'is-plain-object';
import micromatch from 'micromatch';
const debug = require('debug')('acot:runner:storybook');

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
      store: () => {
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

type Options = {
  include: string[];
  exclude: string[];
};

const schema: Schema = {
  properties: {
    include: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    exclude: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
  required: [],
  additionalProperties: false,
};

export default createRunnerFactory<Options>(
  'storybook',
  ({ config, options }) => {
    validate(schema, options, {
      name: 'Storybook runner',
      base: 'options',
    });

    debug('received valid options: ', options);

    return {
      collect: async () => {
        // get stories
        const browser = await puppeteer.launch(config.launchOptions);
        const page = await browser.newPage();

        let stories: AcotStory[] = [];

        try {
          await page.goto(`${config.origin}/iframe.html?id=__ACOTSTORYBOOK__`);
          await page.waitForFunction(() => window.__STORYBOOK_CLIENT_API__);

          // SB(v6 or later) api's `raw()` can return empty array til SB store gets configured.
          // See https://github.com/storybookjs/storybook/pull/9914 .
          await page.waitForFunction(
            () => window.__STORYBOOK_CLIENT_API__.store()._configuring !== true,
          );

          const raw = await page.evaluate(() => {
            return window.__STORYBOOK_CLIENT_API__.raw().map((o) => ({
              id: o.id,
              kind: o.kind,
              name: o.name,
              params: o.parameters?.acot ?? {},
            }));
          });

          debug('raw stories: %O', raw);

          stories = filterStories(
            raw,
            options.include ?? [],
            options.exclude ?? [],
          );

          debug('filtered stories: %O', stories);
        } finally {
          await page.close();
          await browser.close();
        }

        // collect results
        const results: RunCollectResult = [];
        const router = new ConfigRouter(config);

        await Promise.all(
          stories.map(async (story) => {
            const path = `/iframe.html?id=${story.id}`;
            const entry = router.resolve(path);
            const cfg: ResolvedConfig = await resolveConfig(story.params);

            debug('path: %s, %O', path, entry, cfg);

            results.push([
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
            ]);
          }),
        );

        return results;
      },
    };
  },
);
