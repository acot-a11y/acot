import { MockLogger } from '../';

describe('MockLogger', () => {
  test('mock stream', () => {
    const logger = new MockLogger({ level: 'info' });

    logger.log('log').info('info').warn('warn').error('error').print('output');

    expect(logger.stdout.length).toBe(3);
    expect(logger.stderr.length).toBe(2);
  });
});
