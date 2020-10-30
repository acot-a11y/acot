import type {
  Core,
  CoreEventMap,
  TestDescriptor,
  EventListener,
  Summary,
} from '@acot/types';
import { createSummary } from '@acot/factory';
import Emittery from 'emittery';

export class MockCore implements Core {
  public readonly version = 'mock';
  public cases: [path: string, descriptor: TestDescriptor][] = [];
  public emitter = new Emittery();

  public add(path: string, descriptor: TestDescriptor): void {
    this.cases.push([path, descriptor]);
  }

  public async audit(): Promise<Summary> {
    this.emitter.emit('launch:start', []);
    this.emitter.emit('launch:complete', []);
    this.emitter.emit('audit:start', []);
    this.emitter.emit('audit:complete', []);
    this.emitter.emit('test:start', []);
    this.emitter.emit('test:complete', []);
    this.emitter.emit('terminate:start', []);
    this.emitter.emit('terminate:complete', []);
    return createSummary({});
  }

  public on<T extends keyof CoreEventMap>(
    eventName: T,
    listener: EventListener<CoreEventMap, T>,
  ): void {
    this.emitter.on(eventName as any, listener as any);
  }

  public off<T extends keyof CoreEventMap>(
    eventName: T,
    listener?: EventListener<CoreEventMap, T>,
  ): void {
    this.emitter.off(eventName as any, listener as any);
  }
}
