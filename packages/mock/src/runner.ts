import type {
  EventListener,
  Runner,
  RunnerEventMap,
  Summary,
} from '@acot/types';
import Emittery from 'emittery';

export class MockRunner implements Runner {
  public version = {
    self: '0.0.0',
    core: '0.0.0',
  };

  public name = 'mock';
  public emitter: Emittery = new Emittery();

  public constructor(public impl: (emitter: Emittery) => Promise<Summary>) {}

  public async run(): Promise<Summary> {
    return await this.impl(this.emitter);
  }

  public on<T extends keyof RunnerEventMap>(
    eventName: T,
    listener: EventListener<RunnerEventMap, T>,
  ): void {
    this.emitter.on(eventName as any, listener as any);
  }

  public off<T extends keyof RunnerEventMap>(
    eventName: T,
    listener?: EventListener<RunnerEventMap, T>,
  ): void {
    this.emitter.off(eventName as any, listener as any);
  }
}
