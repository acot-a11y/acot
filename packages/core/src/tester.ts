import type {
  RuleId,
  Rule,
  NormalizedRuleConfig,
  Status,
  TestcaseResult,
  TestResult,
  CoreEventMap,
  Stat,
} from '@acot/types';
import { validate } from '@acot/schema-validator';
import { createStat, createTestcaseResult } from '@acot/factory';
import _ from 'lodash';
import type { Page, Viewport } from 'puppeteer-core';
import series from 'p-series';
import type { BrowserPool } from './browser-pool';
import type { RuleStore } from './rule-store';
import { createRuleContext } from './rule-context';
import type { Browser } from './browser';
import { debug } from './logging';
import { mark } from './timing';

type TesterRuleOptions = NormalizedRuleConfig[RuleId];
type TesterRuleGroup = [RuleId, Rule, TesterRuleOptions];

export type TesterContext = {
  pool: BrowserPool;
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
  onTestcaseStart: (...args: CoreEventMap['testcase:start']) => Promise<void>;
  onTestcaseComplete: (
    ...args: CoreEventMap['testcase:complete']
  ) => Promise<void>;
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

  public async test({ pool }: TesterContext): Promise<TestResult> {
    const { priority, url, onTestStart, onTestComplete } = this._config;
    const { immutable, mutable } = this._prepare();
    const ids = [...immutable, ...mutable].map(([id]) => id);

    await onTestStart(url, ids);

    const measure = mark();

    this._debug(`start ${ids.length} rules`);

    await Promise.allSettled([
      immutable.length > 0
        ? pool.execute(priority, async (browser) => {
            const page = await this._createPage(browser);

            try {
              await series(
                immutable.map((args) => async () => {
                  await this._execute(browser, page, args);
                  await this._cleanupPage(page);
                }),
              );
            } catch (e) {
              this._debug(e);
            } finally {
              await page.close();
            }
          })
        : Promise.resolve(),
      ...mutable.map(async (loop) => {
        await pool.execute(
          priority,
          async (browser, args) => {
            const page = await this._createPage(browser);

            try {
              await this._execute(browser, page, args);
            } catch (e) {
              this._debug(e);
            } finally {
              await page.close();
            }
          },
          loop,
        );
      }),
    ]);

    const rulesAndStat = this._results.reduce<
      Pick<TestResult, keyof Stat | 'rules'>
    >(
      (acc, cur) => {
        const rules = acc.rules;

        if (rules[cur.rule] == null) {
          rules[cur.rule] = createStat();
        }

        switch (cur.status) {
          case 'pass':
            rules[cur.rule].passCount++;
            break;
          case 'error':
            rules[cur.rule].errorCount++;
            break;
          case 'warn':
            rules[cur.rule].warningCount++;
            break;
        }

        rules[cur.rule].duration = cur.duration;

        acc.duration += cur.duration;
        acc.passCount += cur.status === 'pass' ? 1 : 0;
        acc.errorCount += cur.status === 'error' ? 1 : 0;
        acc.warningCount += cur.status === 'warn' ? 1 : 0;

        return acc;
      },
      {
        ...createStat(),
        rules: {},
      },
    );

    const results = _.orderBy(
      this._results,
      [(res) => res.status, (res) => res.rule],
      ['asc', 'asc'],
    );

    this._results = [];

    const result = {
      ...rulesAndStat,
      duration: measure(),
      url,
      results,
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

  private async _cleanupPage(page: Page): Promise<void> {
    await page.focus('body');
  }

  private async _execute(
    browser: Browser,
    page: Page,
    [id, rule, options]: TesterRuleGroup,
  ): Promise<void> {
    const {
      url,
      workingDir,
      onTestcaseStart,
      onTestcaseComplete,
    } = this._config;

    await onTestcaseStart(url, id);

    const results: TestcaseResult[] = [];
    const measure = mark();

    const context = createRuleContext({
      process: browser.id(),
      status: options[0] as Exclude<Status, 'off'>,
      rule: id,
      url,
      tags: rule.meta?.tags ?? [],
      workingDir,
      results,
      page,
      options,
      measure,
    });

    const factory = (...args: Parameters<typeof createTestcaseResult>) =>
      createTestcaseResult({
        process: browser.id(),
        duration: measure(),
        rule: id,
        ...args[0],
      });

    try {
      await rule.test(context);
    } catch (e) {
      this._debug('Unexpected error occurred:', e);

      results.push(
        factory({
          status: 'error',
          message:
            e instanceof Error ? e.message : `Unexpected error occurred: ${e}`,
        }),
      );
    }

    // pass
    if (results.length === 0) {
      results.push(
        factory({
          status: 'pass',
        }),
      );
    }

    await onTestcaseComplete(url, id, results);

    this._results.push(...results);
  }

  private async _waitForReady(page: Page): Promise<void> {
    const { url, readyTimeout: timeout } = this._config;

    try {
      await Promise.all([
        page.goto(url, {
          waitUntil: 'networkidle2',
          timeout,
        }),
        page.waitForNavigation({
          waitUntil: 'domcontentloaded',
          timeout,
        }),
      ]);
    } catch (e) {
      this._debug(e);
      throw e;
    }
  }

  private _debug(...args: any[]) {
    const { url, priority } = this._config;

    debug(`[${priority}] ${url}:`, ...args);
  }
}
