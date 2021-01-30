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
import type { TimingMeasure } from './timing';
const rootDebug = require('debug')('acot');

const writeFile = promisify(fs.writeFile);

const buildFilename = (...args: string[]) => {
  return args
    .map((arg) => {
      return filenamify(arg, { replacement: '-' }).toLowerCase();
    })
    .join('-');
};

const element2selectorIfNeeded = async (node: ElementHandle | undefined) => {
  if (node == null) {
    return null;
  }

  try {
    return await element2selector(node);
  } catch (e) {
    debug('Element to Selector Error:', e);
    return null;
  }
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
    debug('Screenshot Error:', e);
    return false;
  }
};

export type CreateRuleContextParams = {
  process: number;
  status: Status;
  rule: RuleId;
  url: string;
  help: string;
  workingDir: string;
  page: Page;
  options: [ReportType, RuleOptions | null];
  results: TestcaseResult[];
  measure: TimingMeasure;
};

export const createRuleContext = ({
  process,
  status,
  rule,
  url,
  help: ruleHelp,
  workingDir,
  page,
  options,
  results,
  measure,
}: CreateRuleContextParams): RuleContext => {
  const log = rootDebug.extend(rule);

  return {
    page,

    report: async ({ message, help: reportHelp, node }) => {
      try {
        const basename = buildFilename(url, rule, `${process}`);
        const htmlpath = path.resolve(workingDir, `${basename}.html`);
        const imagepath = path.resolve(workingDir, `${basename}.png`);

        const [selector, image] = await Promise.all([
          element2selectorIfNeeded(node),
          screenshotIfNeeded(node, imagepath),
          writeFile(htmlpath, await page.content(), 'utf8'),
        ]);

        results.push(
          createTestcaseResult({
            process,
            status,
            rule,
            duration: measure(),
            message,
            help: reportHelp || ruleHelp,
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
            duration: measure(),
            message: e.message,
          }),
        );
      }
    },

    debug: (format, ...args) => {
      const prefix = `${url} -`;

      if (typeof format === 'string') {
        log(`${prefix} ${format}`, ...args);
      } else {
        log(prefix, format, ...args);
      }
    },

    options: options[1] ?? {},
  };
};
