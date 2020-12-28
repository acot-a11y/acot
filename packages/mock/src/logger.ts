import { PassThrough } from 'stream';
import type { LoggerConfig } from '@acot/logger';
import { Logger } from '@acot/logger';

const createMockStream = (data: string[]) => {
  const stream = new PassThrough();

  stream.on('data', (buf) => {
    data.push(buf.toString().replace(/\n$/, ''));
  });

  return stream;
};

export class MockLogger extends Logger {
  public stdout: string[] = [];
  public stderr: string[] = [];

  public constructor(config?: Partial<LoggerConfig>) {
    super(config);

    const stdout = createMockStream(this.stdout);
    const stderr = createMockStream(this.stderr);

    this.update({
      ...(config ?? {}),
      color: false,
      stdout,
      stderr,
    });
  }
}
