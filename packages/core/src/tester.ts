import type {
  RuleId,
  Rule,
  NormalizedRuleConfig,
  Status,
  TestcaseResult,
  TestResult,
  CoreEventMap,
} from '@acot/types';
import { validate } from '@acot/schema-validator';
import { createTestcaseResult } from '@acot/factory';
import _ from 'lodash';
import type { Page, Viewport } from 'puppeteer-core';
import series from 'p-series';
import type { BrowserPool } from './browser-pool';
import type { TimingTracker } from './timing-tracker';
import type { RuleStore } from './rule-store';
import { createRuleContext } from './rule-context';
import type { Browser } from './browser';
import { debug } from './logging';

type TesterRuleOptions = NormalizedRuleConfig[RuleId];
type TesterRuleGroup = [RuleId, Rule, TesterRuleOptions];

export type TesterContext = {
  pool: BrowserPool;
  tracker: TimingTracker;
};

export type TesterConfig = {
  priority: number;
  url: string;
  store: RuleStore;
  workingDir: string;
  headers?: Record<string, string>;
  viewport: Viewport | null;
  rules: NormalizedRuleConfig;
  readyTimeout: number;
  onTestStart: (...args: CoreEventMap['test:start']) => Promise<void>;
  onTestComplete: (...args: CoreEventMap['test:complete']) => Promise<void>;
};

export class Tester {
  private _config: TesterConfig;
  private _results: TestcaseResult[] = [];

  public constructor(config: TesterConfig) {
    this._config = config;
  }

  public url(): string {
    return this._config.url;
  }

  public rules(): NormalizedRuleConfig {
    return this._config.rules;
  }

  public async test({ pool, tracker }: TesterContext): Promise<TestResult> {
    const { priority, url, onTestStart, onTestComplete } = this._config;
    const { immutable, mutable } = this._prepare();
    const ids = [...immutable, ...mutable].map(([id]) => id);

    await onTestStart(url, ids);

    this._debug(`start ${ids.length} rules`);

    await Promise.all([
      immutable.length > 0
        ? pool.execute(priority, async (browser) => {
            const page = await this._createPage(browser);

            await series(
              immutable.map((args) => async () => {
                await tracker.track(args[0], async () => {
                  await this._execute(browser, page, args);
                });
              }),
            );
          })
        : Promise.resolve(),
      ...mutable.map(async (loop) => {
        await pool.execute(
          priority,
          async (browser, args) => {
            await tracker.track(args[0], async () => {
              await this._execute(
                browser,
                await this._createPage(browser),
                args,
              );
            });
          },
          loop,
        );
      }),
    ]);

    const stat = this._results.reduce(
      (acc, cur) => {
        acc.passCount += cur.status === 'pass' ? 1 : 0;
        acc.errorCount += cur.status === 'error' ? 1 : 0;
        acc.warningCount += cur.status === 'warn' ? 1 : 0;
        return acc;
      },
      {
        passCount: 0,
        errorCount: 0,
        warningCount: 0,
      },
    );

    const results = _.orderBy(
      this._results,
      [(res) => res.status, (res) => res.rule],
      ['asc', 'asc'],
    );

    this._results = [];

    const result = {
      ...stat,
      results,
      url,
    };

    this._debug(`complete!`);

    await onTestComplete(url, ids, result);

    return result;
  }

  private _prepare(): {
    immutable: TesterRuleGroup[];
    mutable: TesterRuleGroup[];
  } {
    return Object.entries(this._config.rules).reduce(
      (acc, [id, options]) => {
        const rule = this._config.store.get(id);
        if (rule == null) {
          this._results.push(
            createTestcaseResult({
              status: 'error',
              rule: id,
              message: `The rule "${id}" is not found.`,
            }),
          );
          return acc;
        }

        const opts = [...options] as TesterRuleOptions;

        if (opts[0] === 'off') {
          return acc;
        }

        if (rule.schema != null) {
          try {
            validate(rule.schema, opts[1], {
              name: 'Rule options',
              base: 'options',
            });
          } catch (e) {
            debug('validation error:', e);

            this._results.push(
              createTestcaseResult({
                status: 'error',
                rule: id,
                message: `${id} validation error: ${e.message}`,
              }),
            );

            return acc;
          }
        }

        const group: TesterRuleGroup = [id, rule, opts];

        if (rule.immutable) {
          acc.immutable.push(group);
        } else {
          acc.mutable.push(group);
        }

        return acc;
      },
      {
        immutable: [] as TesterRuleGroup[],
        mutable: [] as TesterRuleGroup[],
      },
    );
  }

  private async _createPage(browser: Browser): Promise<Page> {
    this._debug('creating page...');
    const page = await browser.page();
    this._debug('created page!');

    this._debug('set headers & viewport');
    await Promise.all([
      this._config.headers && page.setExtraHTTPHeaders(this._config.headers),
      this._config.viewport && page.setViewport(this._config.viewport),
    ]);

    this._debug('wait for ready...');
    await this._waitForReady(page);
    this._debug('ready!');

    return page;
  }

  private async _execute(
    browser: Browser,
    page: Page,
    [id, rule, options]: TesterRuleGroup,
  ): Promise<void> {
    const results: TestcaseResult[] = [];

    const context = createRuleContext({
      process: browser.id(),
      status: options[0] as Exclude<Status, 'off'>,
      rule: id,
      url: this._config.url,
      tags: rule.meta?.tags ?? [],
      workingDir: this._config.workingDir,
      results,
      page,
      options,
    });

    const addErrorResult = (e: unknown) => {
      debug('Unexpected error occurred:', e);

      results.push(
        createTestcaseResult({
          process: browser.id(),
          status: 'error',
          rule: id,
          message:
            e instanceof Error ? e.message : `Unexpected error occurred: ${e}`,
        }),
      );
    };

    switch (rule.type) {
      case 'global': {
        await rule.test(context).catch((e) => addErrorResult(e));
        break;
      }

      case 'contextual': {
        try {
          const nodes = await page.$$(rule.selector);

          await Promise.all(
            nodes.map((node) =>
              rule.test(context, node).catch((e) => addErrorResult(e)),
            ),
          );
        } catch (e) {
          debug(
            'Not found elements (rule="%s", url="%s")',
            id,
            this._config.url,
            e,
          );
        }
        break;
      }

      default:
        results.push(
          createTestcaseResult({
            process: browser.id(),
            status: 'error',
            message: `The rule type "${(rule as any).type}" is invalid.`,
          }),
        );
        break;
    }

    // pass
    if (results.length === 0) {
      results.push(
        createTestcaseResult({
          process: browser.id(),
          status: 'pass',
          rule: id,
        }),
      );
    }

    this._results.push(...results);
  }

  private async _waitForReady(page: Page): Promise<void> {
    const { readyTimeout } = this._config;

    await Promise.all([
      page.goto(this._config.url, {
        timeout: readyTimeout,
      }),
      page.waitForFunction(
        (url: string) => {
          const { readyState } = window.document;
          const ready = ['interactive', 'complete'].includes(readyState);
          return window.location.href === url && ready;
        },
        {
          polling: 'raf',
          timeout: readyTimeout,
        },
        this._config.url,
      ),
    ]);
  }

  private _debug(...args: any[]) {
    const { url, priority } = this._config;

    debug(`[${priority}] ${url}:`, ...args);
  }
}
