import type { MockLogger } from '@acot/mock-logger';
import type { CommandRunner } from '../../command';
import { createCommand } from '../../command';
import { createMockLogger } from '../../__mocks__/logger';
import { CommandContainer } from '../../command-container';

describe('command/preset', () => {
  let run: CommandRunner<any>;
  let logger: MockLogger;

  beforeEach(async () => {
    run = (await import('../preset')).default.run;
    logger = createMockLogger();
  });

  afterEach(() => {
    // logger.destroy();
  });

  test('output package version', async () => {
    const mock = jest.fn().mockResolvedValueOnce(0);
    const help = createCommand<any, any>({
      name: 'help',
      summary: '',
      args: {},
      options: {},
    })(mock);

    const container = new CommandContainer([help]);

    const context = { logger, container };
    const code = await run(context as any);

    expect(code).toBe(0);

    expect(mock).toBeCalledWith({
      ...context,
      args: {
        command: ['preset'],
      },
    });
  });
});
