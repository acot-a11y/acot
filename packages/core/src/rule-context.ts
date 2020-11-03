import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import type {
  ReportType,
  RuleContext,
  RuleId,
  RuleOptions,
  Status,
  TestcaseResult,
} from '@acot/types';
import type { Page, ElementHandle } from 'puppeteer-core';
import { element2selector } from 'puppeteer-element2selector';
import filenamify from 'filenamify';
import { createTestcaseResult } from '@acot/factory';
import { debug } from './logging';

const writeFile = promisify(fs.writeFile);

const buildFilename = (...args: string[]) => {
  return args
    .map((arg) => {
      return filenamify(arg, { replacement: '-' }).toLowerCase();
    })
    .join('-');
};

const screenshotIfNeeded = async (
  node: ElementHandle | undefined,
  to: string,
) => {
  if (node == null) {
    return false;
  }

  try {
    await node.screenshot({ path: to });
    return true;
  } catch (e) {
    debug('Screenshot error:', e);
    return false;
  }
};

export type CreateRuleContextParams = {
  process: number;
  status: Status;
  rule: RuleId;
  url: string;
  tags: string[];
  workingDir: string;
  page: Page;
  options: [ReportType, RuleOptions | null];
  results: TestcaseResult[];
};

export const createRuleContext = ({
  process,
  status,
  rule,
  url,
  tags: ruleTags,
  workingDir,
  page,
  options,
  results,
}: CreateRuleContextParams): RuleContext => ({
  page,

  report: async ({ message, tags: reportTags, node }) => {
    try {
      const basename = buildFilename(url, rule, `${process}`);
      const htmlpath = path.resolve(workingDir, `${basename}.html`);
      const imagepath = path.resolve(workingDir, `${basename}.png`);

      const [selector, image] = await Promise.all([
        node ? element2selector(node) : null,
        screenshotIfNeeded(node, imagepath),
        writeFile(htmlpath, await page.content(), 'utf8'),
      ]);

      results.push(
        createTestcaseResult({
          process,
          status,
          rule,
          message,
          tags: [...ruleTags, ...(reportTags ?? [])],
          selector,
          htmlpath: path.relative(workingDir, htmlpath),
          imagepath: image ? path.relative(workingDir, imagepath) : null,
        }),
      );
    } catch (e) {
      debug(e);
      results.push(
        createTestcaseResult({
          process,
          status: 'error',
          rule,
          message: e.message,
        }),
      );
    }
  },

  debug: (format, ...args) => {
    const prefix = `[${rule}] ${url} -`;

    if (typeof format === 'string') {
      debug(`${prefix} ${format}`, ...args);
    } else {
      debug(prefix, format, ...args);
    }
  },

  options: options[1] ?? {},
});
