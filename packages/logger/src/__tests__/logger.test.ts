import stripAnsi from 'strip-ansi';
import type { LoggerConfig } from '../logger';
import { Logger } from '../logger';

describe('logger', () => {
  let mock: {
    stdout: { write: jest.Mock };
    stderr: { write: jest.Mock };
  };

  let config: Partial<LoggerConfig>;

  beforeEach(() => {
    mock = {
      stdout: { write: jest.fn() },
      stderr: { write: jest.fn() },
    };

    config = {
      stdout: mock.stdout as any,
      stderr: mock.stderr as any,
    };
  });

  test('default - all levels', () => {
    const logger = new Logger({ ...config });
    let output = '';

    logger.error('error-message');
    output = mock.stderr.write.mock.calls[0][0];

    expect(output).not.toBe(stripAnsi(output) + '\n');
    expect(stripAnsi(output)).toBe(` ERROR  error-message\n`);

    logger.warn('warning-message');
    output = mock.stderr.write.mock.calls[1][0];

    expect(output).not.toBe(stripAnsi(output) + '\n');
    expect(stripAnsi(output)).toBe(` WARN  warning-message\n`);

    logger.info('info-message');
    expect(mock.stdout.write).not.toBeCalled();

    logger.log('log-message');
    expect(mock.stdout.write).not.toBeCalled();
  });

  test('disable / enable', () => {
    const logger = new Logger({ ...config });

    logger.disable();
    logger.error('error-message');
    expect(mock.stderr.write).not.toBeCalled();

    logger.enable();
    logger.error('error-message');
    expect(mock.stderr.write).toBeCalled();
  });

  test('extends', () => {
    const parent = new Logger({ ...config, level: 'info' });
    const child = parent.extends({ ...config, level: 'error' });

    expect(parent).not.toBe(child);
    expect((parent as any)._config.level).toBe('info');
    expect((child as any)._config.level).toBe('error');
  });

  test('update', () => {
    const logger = new Logger({ ...config, level: 'error' });

    expect((logger as any)._config.level).toBe('error');

    logger.update({ level: 'info' });

    expect((logger as any)._config.level).toBe('info');
  });

  test('print', () => {
    const logger = new Logger({ ...config });

    logger.print('message1');
    expect(mock.stdout.write).toBeCalledWith('message1\n');

    logger.disable().print('message2');
    expect(mock.stdout.write).not.toBeCalledWith('message2\n');
  });

  test('verbose', () => {
    const logger = new Logger({
      ...config,
      level: 'verbose',
    });

    logger.log('msg');
    expect(mock.stdout.write).toBeCalledTimes(1);
    expect(mock.stderr.write).toBeCalledTimes(0);

    logger.info('msg');
    expect(mock.stdout.write).toBeCalledTimes(2);
    expect(mock.stderr.write).toBeCalledTimes(0);

    logger.warn('msg');
    expect(mock.stdout.write).toBeCalledTimes(2);
    expect(mock.stderr.write).toBeCalledTimes(1);

    logger.error('msg');
    expect(mock.stdout.write).toBeCalledTimes(2);
    expect(mock.stderr.write).toBeCalledTimes(2);
  });

  test('error object', () => {
    const logger = new Logger({ ...config });

    logger.error(new Error('message'));
    expect(mock.stderr.write).toBeCalledTimes(1);
    expect(stripAnsi(mock.stderr.write.mock.calls[0][0])).toContain(
      ` ERROR  Error: message\n            at Object.`,
    );
  });
});
