import { createReporterFactory } from '@acot/reporter';
import { validate } from '@acot/schema-validator';
import env from 'env-ci';
import chalk from 'chalk';
import got from 'got';
import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
const debug = require('debug')('acot:reporter:github');

const findToken = (options: GitHubReporterOptions) => {
  if (options.token != null) {
    return options.token;
  }

  const token = process.env.ACOT_GITHUB_APP_TOKEN;
  if (token != null) {
    return token;
  }

  return null;
};

const schema = Type.Strict(
  Type.Object(
    {
      token: Type.Optional(Type.String()),
      endpoint: Type.Optional(
        Type.String({
          format: 'uri',
        }),
      ),
    },
    {
      additionalProperties: false,
    },
  ),
);

export type GitHubReporterOptions = Static<typeof schema>;

export default createReporterFactory<GitHubReporterOptions>(
  ({ config, verbose, stderr, options }) => {
    if (verbose) {
      debug.enable();
    }

    validate(schema, options, {
      name: 'GitHubReporter',
      base: 'options',
    });

    return (runner) => {
      const error = (message: string) =>
        stderr.write(
          chalk`{gray [@acot/acot-reporter-github]} {red ${message}}\n`,
        );

      const ci = env() as any;
      if (!ci.isCi || !ci.isPr) {
        debug(
          "Stop reporting because it's running outside the CI environment.",
        );
        return;
      }

      const number = parseInt(ci.pr, 10);
      if (Number.isNaN(number)) {
        error(`Invalid PR number: "${ci.pr}"`);
        return;
      }

      const token = findToken(options);
      if (token == null) {
        error('Not found token.');
        return;
      }

      const api = got.extend({
        prefixUrl: options.endpoint ?? 'https://gh-app-api.acot.dev',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      runner.on('audit:complete', async ([summary]) => {
        try {
          debug(`Start PR Comment to ${number}.`);

          const response = await api
            .post('pr/comment', {
              json: {
                number,
                meta: {
                  core: {
                    version: runner.version.core,
                  },
                  runner: {
                    name: runner.name,
                    version: runner.version.self,
                  },
                  origin: config.origin,
                  commit: ci.commit,
                },
                summary,
              },
            })
            .json();

          debug('API Response: %O', response);
          debug('Finish PR comment!');
        } catch (e) {
          debug(e);
          error('API Error: ' + (e instanceof Error ? e.message : `${e}`));
        }
      });
    };
  },
);
