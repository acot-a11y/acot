import type { Viewport } from 'puppeteer-core';
import { parseViewport } from '../parse-viewport';

describe('parseViewport', () => {
  test.each<[string | Viewport, Viewport]>([
    [
      {
        width: 768,
        height: 600,
      },
      {
        width: 768,
        height: 600,
      },
    ],
    [
      'iPhone X',
      {
        width: 375,
        height: 812,
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        isLandscape: false,
      },
    ],
    [
      '1000x800',
      {
        width: 1000,
        height: 800,
      },
    ],
    [
      '{"width":1800, "height":900}',
      {
        width: 1800,
        height: 900,
      },
    ],
  ])('success parseViewport(%p) = %p', (viewport, expected) => {
    expect(parseViewport(viewport)).toEqual(expected);
  });

  test.each<[string | Viewport]>([
    [''],
    ['1000'],
    ['x800'],
    ['1000x'],
    ['FOOxBAR'],
    ['{}'],
    ['{"deviceScaleFactor":2}'],
    ['{"width": 1000}'],
    ['{"height": 1000}'],
    ['{"width":"1000","height":2000}'],
    ['{"width":1000,"height":"2000"}'],
    ['{width:1800, height:900}'],
  ])('failure parseViewport(%p)', (viewport) => {
    expect(() => parseViewport(viewport)).toThrow();
  });
});
