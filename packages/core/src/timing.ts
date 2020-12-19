import { performance } from 'perf_hooks';

export type TimingMeasure = () => number;

export const mark = (): TimingMeasure => {
  const now = performance.now();

  return () => performance.now() - now;
};
