import { createRule as createAcotRule } from '@acot/core';
import type { Rule } from '@acot/types';
import type { Static } from '@sinclair/typebox';
import { Type } from '@sinclair/typebox';
import type { NodeResult, Result, RunOptions, Spec } from 'axe-core';
import type { ElementHandle, Page } from 'puppeteer-core';

const injectAxe = async (page: Page) => {
  // FIXME There is a mistake in the type definition of `addScriptTag` in the puppeteer.
  const script: ElementHandle = (await page.addScriptTag({
    path: require.resolve('axe-core'),
  })) as any;

  return async () => {
    await page.evaluate((el: HTMLScriptElement) => {
      el.parentNode?.removeChild(el);
    }, script);
  };
};

type FlattenResult = {
  result: Result;
  node: NodeResult;
  selector: string;
};

const flattenResults = (results: Result[]) => {
  return results.reduce<FlattenResult[]>((acc, cur) => {
    cur.nodes.forEach((node) => {
      node.target.forEach((selector) => {
        acc.push({
          result: cur,
          node,
          selector,
        });
      });
    });

    return acc;
  }, []);
};

const nodeChecks = (node: NodeResult) => [
  ...node.any,
  ...node.all,
  ...node.none,
];

const schema = Type.Strict(
  Type.Object(
    {
      context: Type.Optional(Type.String()),
      iframes: Type.Optional(Type.Boolean()),
      frameWaitTime: Type.Optional(Type.Number({ minimum: 0 })),
      rules: Type.Optional(
        Type.Record(
          Type.String(),
          Type.Object(
            {
              enabled: Type.Boolean(),
            },
            {
              additionalProperties: false,
            },
          ),
        ),
      ),
    },
    {
      additionalProperties: false,
    },
  ),
);

type Options = Static<typeof schema>;

type SerializableOptions = {
  [P in keyof Options]-?: Options[P] | null;
};

export type CreateRuleConfig = {
  tag: string;
};

export const createRule = (config: CreateRuleConfig): Rule<Options> => {
  return createAcotRule<Options>({
    meta: {
      recommended: true,
    },

    schema,

    test: async (context) => {
      const cleanup = await injectAxe(context.page);

      const axeResults = await context.page.evaluate(
        (tag: string, options: SerializableOptions) => {
          const assign = <
            T extends Record<string, any>,
            K extends keyof T,
            U extends { [P in K]: T[K] | null },
          >(
            to: T,
            from: U,
            key: K,
          ) => {
            if (from[key] != null) {
              to[key] = from[key]!;
            }
          };

          const spec: Spec = {
            branding: {
              application: 'acot',
            },
          };

          const opts: RunOptions = {
            resultTypes: ['violations', 'incomplete'],
            runOnly: {
              type: 'rule',
              values: window.axe.getRules([tag]).map(({ ruleId }) => ruleId),
            },
          };

          assign(opts, options, 'iframes');
          assign(opts, options, 'frameWaitTime');
          assign(opts, options, 'rules');

          window.axe.configure(spec);

          return options.context != null
            ? window.axe.run(options.context, opts)
            : window.axe.run(opts);
        },
        config.tag,
        {
          context: context.options.context ?? null,
          iframes: context.options.iframes ?? null,
          frameWaitTime: context.options.iframes ?? null,
          rules: context.options.rules ?? null,
        } as SerializableOptions,
      );

      const results = [...axeResults.violations, ...axeResults.incomplete];

      context.debug('axe results: %O', results);

      // Remove Axe module in the HTML before dumping the HTML for the report
      await cleanup();

      if (results.length > 0) {
        await Promise.all(
          flattenResults(results).map(async ({ result, node, selector }) => {
            const el = await context.page.$(selector);
            if (el == null) {
              return;
            }

            await Promise.all(
              nodeChecks(node).map(async (check) => {
                await context.report({
                  message: `${result.help}. ${check.message}. (${result.id})`,
                  help: result.helpUrl,
                  node: el,
                });
              }),
            );
          }),
        );
      }
    },
  });
};
