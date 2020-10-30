import puppeteer from 'puppeteer-core';
import { validate } from '@acot/schema-validator';
import { ConfigRouter, resolveConfig } from '@acot/config';
import type { ResolvedConfig, ConfigEntry } from '@acot/types';
import type { RunCollectResult } from '@acot/runner';
import { createRunnerFactory } from '@acot/runner';
import deepmerge from 'deepmerge';
import { isPlainObject } from 'is-plain-object';
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
    };
  }
}

const isMergeableObject = (v: any) => Array.isArray(v) || isPlainObject(v);

const schema = {
  properties: {},
  required: [],
  additionalProperties: false,
};

export default createRunnerFactory('storybook', ({ config, options }) => {
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

        stories = await page.evaluate(() => {
          return window.__STORYBOOK_CLIENT_API__.raw().map((o) => ({
            id: o.id,
            kind: o.kind,
            name: o.name,
            params: o.parameters?.acot ?? {},
          }));
        });

        debug('Stories: %O', stories);
      } finally {
        await page.close();
        browser.disconnect();
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
                plugins: entry.plugins,
                headers: entry.headers,
              },
              {
                rules: cfg.rules,
                plugins: cfg.plugins,
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
});
