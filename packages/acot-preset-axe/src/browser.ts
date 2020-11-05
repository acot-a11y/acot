import type Axe from 'axe-core';

declare global {
  // eslint-disable-next-line
  interface Window {
    axe: typeof Axe;
  }
}
