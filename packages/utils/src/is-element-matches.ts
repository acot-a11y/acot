import type { ElementHandle } from 'puppeteer-core';

export const isElementMatches = async (
  element: ElementHandle,
  selectors: string | string[],
): Promise<boolean> => {
  const targets = Array.isArray(selectors) ? selectors : [selectors];
  if (targets.length === 0) {
    return false;
  }

  return await element.evaluate(
    (el, list: string[]) => list.some((selector) => el.matches(selector)),
    targets,
  );
};
