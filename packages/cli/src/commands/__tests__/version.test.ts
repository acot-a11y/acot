import type { MockLogger } from '@acot/mock-logger';
import type { CommandRunner } from '../../command';
import { createMockLogger } from '../../__mocks__/logger';

describe('command/version', () => {
  let run: CommandRunner<any>;
  let logger: MockLogger;

  beforeEach(async () => {
    run = (await import('../version')).default.run;
    logger = createMockLogger();
  });

  afterEach(() => {
    // logger.destroy();
  });

  test('output package version', async () => {
    const code = await run({ logger, pkg: { version: '1.0.0' } } as any);

    expect(code).toBe(0);
    expect(logger.stdout).toEqual(['v1.0.0']);
  });
});
