import { performance } from 'perf_hooks';
import type { Timing } from '@acot/types';

export class TimingTracker {
  private _data: Timing = {};

  public flush(): Timing {
    const data = this._data;
    this._data = {};
    return data;
  }

  public async track<R, A extends any[] = any[]>(
    id: string,
    fn: (...args: A) => Promise<R>,
    ...args: A
  ): Promise<R> {
    const now = performance.now();
    const result = await fn(...args);
    const ms = performance.now() - now;
    this._data[id] = (this._data[id] ?? 0) + ms;
    return result;
  }
}
