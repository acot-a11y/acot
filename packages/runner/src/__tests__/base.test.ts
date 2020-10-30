import { createSummary } from '@acot/factory';
import { BaseRunner } from '../base';
import { MockCore } from '../__mocks__/core';

const createListeners = () => ({
  'setup:start': jest.fn(),
  'setup:complete': jest.fn(),
  'connect:start': jest.fn(),
  'connect:complete': jest.fn(),
  'collect:start': jest.fn(),
  'collect:complete': jest.fn(),
  'launch:start': jest.fn(),
  'launch:complete': jest.fn(),
  'audit:start': jest.fn(),
  'audit:complete': jest.fn(),
  'test:start': jest.fn(),
  'test:complete': jest.fn(),
  'terminate:start': jest.fn(),
  'terminate:complete': jest.fn(),
  'cleanup:start': jest.fn(),
  'cleanup:complete': jest.fn(),
});

const bindListeners = (
  runner: BaseRunner,
  listeners: ReturnType<typeof createListeners>,
) => {
  runner.on('setup:start', listeners['setup:start']);
  runner.on('setup:complete', listeners['setup:complete']);
  runner.on('connect:start', listeners['connect:start']);
  runner.on('connect:complete', listeners['connect:complete']);
  runner.on('collect:start', listeners['collect:start']);
  runner.on('collect:complete', listeners['collect:complete']);
  runner.on('launch:start', listeners['launch:start']);
  runner.on('launch:complete', listeners['launch:complete']);
  runner.on('audit:start', listeners['audit:start']);
  runner.on('audit:complete', listeners['audit:complete']);
  runner.on('test:start', listeners['test:start']);
  runner.on('test:complete', listeners['test:complete']);
  runner.on('terminate:start', listeners['terminate:start']);
  runner.on('terminate:complete', listeners['terminate:complete']);
  runner.on('cleanup:start', listeners['cleanup:start']);
  runner.on('cleanup:complete', listeners['cleanup:complete']);
};

describe('BaseRunner', () => {
  const config = {
    name: 'test',
    core: new MockCore(),
    config: {} as any,
    pipeline: {},
  };

  test('name & version', () => {
    const runner = new BaseRunner(config);

    expect(runner.name).toBe('test');
    expect(runner.version).toEqual({
      self: require('../../package.json').version,
      core: 'mock',
    });
  });

  test('default pipeline', async () => {
    const runner = new BaseRunner(config);
    const listeners = createListeners();
    bindListeners(runner, listeners);

    const summary = await runner.run();

    expect(summary).toEqual(createSummary());

    for (const listener of Object.values(listeners)) {
      expect(listener).toBeCalled();
    }
  });

  test('custom pipeline', async () => {
    const setup = jest.fn().mockReturnValue(Promise.resolve());
    const collect = jest.fn().mockResolvedValue([]);
    const audit = jest.fn().mockResolvedValue(createSummary());
    const cleanup = jest.fn().mockReturnValue(Promise.resolve());

    const runner = new BaseRunner({
      ...config,
      pipeline: {
        setup,
        collect,
        audit,
        cleanup,
      },
    });

    const listeners = createListeners();
    bindListeners(runner, listeners);

    const summary = await runner.run();

    expect(summary).toEqual(createSummary());

    expect(listeners['setup:start']).toBeCalled();
    expect(listeners['setup:complete']).toBeCalled();
    expect(listeners['connect:start']).toBeCalled();
    expect(listeners['connect:complete']).toBeCalled();
    expect(listeners['collect:start']).toBeCalled();
    expect(listeners['collect:complete']).toBeCalled();
    expect(listeners['launch:start']).not.toBeCalled();
    expect(listeners['launch:complete']).not.toBeCalled();
    expect(listeners['audit:start']).not.toBeCalled();
    expect(listeners['audit:complete']).not.toBeCalled();
    expect(listeners['test:start']).not.toBeCalled();
    expect(listeners['test:complete']).not.toBeCalled();
    expect(listeners['terminate:start']).not.toBeCalled();
    expect(listeners['terminate:complete']).not.toBeCalled();
    expect(listeners['cleanup:start']).toBeCalled();
    expect(listeners['cleanup:complete']).toBeCalled();

    expect(setup).toBeCalled();
    expect(collect).toBeCalled();
    expect(audit).toBeCalled();
    expect(cleanup).toBeCalled();
  });
});
