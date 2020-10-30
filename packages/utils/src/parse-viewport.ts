import type { Viewport } from 'puppeteer-core';
import { devices } from 'puppeteer-core';

const SIZE_REGEX = /(\d+)x(\d+)/;

export const parseViewport = (viewport: string | Viewport): Viewport => {
  if (typeof viewport !== 'string') {
    return viewport;
  }

  if (devices[viewport] != null) {
    return devices[viewport].viewport;
  }

  const match = viewport.match(SIZE_REGEX);
  if (match != null) {
    return {
      width: parseInt(match[1], 10),
      height: parseInt(match[2], 10),
    };
  }

  const json = JSON.parse(viewport);
  if (typeof json.width === 'number' && typeof json.height === 'number') {
    return json;
  }

  throw new Error('viewport parsing failed.');
};
