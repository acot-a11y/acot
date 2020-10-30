import { createRunnerFactory } from '../factory';
import { MockCore } from '../__mocks__/core';

describe('factory', () => {
  test('createRunnerFactory', () => {
    const factory = createRunnerFactory('test', () => ({
      setup: async () => {},
    }));

    const runner = factory({
      core: new MockCore(),
      config: {} as any,
      options: {},
    });

    expect(runner.name).toBe('test');
  });
});
