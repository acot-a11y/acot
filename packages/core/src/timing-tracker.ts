import { performance } from 'perf_hooks';
import type { Timing } from '@acot/types';

export class TimingTracker {
  private _data: Timing = {};

  public flush(): Timing {
    const data = this._data;
    this._data = {};
    return data;
  }

  public track<R, A extends any[] = any[]>(
    id: string,
    fn: (...args: A) => R,
    ...args: A
  ): R {
    const now = performance.now();
    const result = fn(...args);
    const ms = performance.now() - now;
    this._data[id] = (this._data[id] ?? 0) + ms;
    return result;
  }
}
