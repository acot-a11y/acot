import { ConfigRouter } from '@acot/config';
import type { RunCollectResult } from '@acot/runner';
import { createRunnerFactory } from '@acot/runner';

export const createDefaultRunner = createRunnerFactory<{}>(
  'default',
  ({ config }) => ({
    collect: async () => {
      const router = new ConfigRouter(config);
      const results: RunCollectResult = [];

      config.paths?.forEach((p) => {
        const entry = router.resolve(p);
        const descriptor = {
          rules: entry.rules,
          plugins: entry.plugins,
          headers: entry.headers,
        };

        results.push([p, descriptor]);
      });

      return results;
    },
  }),
);
