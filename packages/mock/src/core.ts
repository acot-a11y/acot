import { createSummary, createTestResult } from '@acot/factory';
import type {
  Core,
  CoreEventMap,
  EventListener,
  Summary,
  TestDescriptor,
} from '@acot/types';
import Emittery from 'emittery';

export class MockCore implements Core {
  public version = '0.0.0';
  public cases: [path: string, descriptor: TestDescriptor][] = [];
  public summary = createSummary();
  public emitter: Emittery<CoreEventMap> = new Emittery();

  public add(path: string, descriptor: TestDescriptor): void {
    this.cases.push([path, descriptor]);
  }

  public async audit(): Promise<Summary> {
    this.emitter.emit('launch:start', [[]]);
    this.emitter.emit('launch:complete', [[]]);
    this.emitter.emit('audit:start', []);
    this.emitter.emit('audit:complete', [createSummary()]);
    this.emitter.emit('test:start', ['', []]);
    this.emitter.emit('test:complete', ['', [], createTestResult()]);
    await this.close();
    return this.summary;
  }

  public async close(): Promise<void> {
    this.emitter.emit('close:start', []);
    this.emitter.emit('close:complete', []);
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
