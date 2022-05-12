import { PassThrough } from 'stream';
import { createTestcaseResult } from '@acot/factory';
import stripAnsi from 'strip-ansi';
import { DocReporter } from '../doc-reporter';
import { createDocCode } from '../__mocks__/doc-code';
import { createDocError } from '../__mocks__/doc-error';
import { createDocResult } from '../__mocks__/doc-result';

const createMockStream = (data: string[]) => {
  const stream = new PassThrough();

  stream.on('data', (buf) => {
    data.push(buf.toString().replace(/\n$/, ''));
  });

  return stream;
};

describe('DocReporter', () => {
  const html = `
<div class="wrapper">
  <section>
    <div id="element">
      <p>Content</p>
      <p>Content</p>
      <p>Content</p>
    </div>

    <img src="path/to.png" alt="Alternative content">
  </section>
</div>
    `.trim();

  let reporter: DocReporter;
  let output: {
    stdout: string[];
    stderr: string[];
  };

  beforeEach(() => {
    output = {
      stdout: [],
      stderr: [],
    };

    reporter = new DocReporter({
      stdout: createMockStream(output.stdout),
      stderr: createMockStream(output.stderr),
    });
  });

  test('empty', async () => {
    await reporter.onComplete(createDocResult());

    const stdout = output.stdout.join('');

    expect(stdout).not.toBe(stripAnsi(stdout));
    expect(stripAnsi(stdout)).toMatchSnapshot();
  });

  test('color disable', async () => {
    const instance = new DocReporter({
      color: false,
      stdout: createMockStream(output.stdout),
      stderr: createMockStream(output.stderr),
    });

    await instance.onComplete(createDocResult());

    const stdout = output.stdout.join('');

    expect(stdout).toBe(stripAnsi(stdout));
  });

  test('passed and errors', async () => {
    await reporter.onComplete(
      createDocResult({
        skips: [createDocCode({ rule: 'skip-name1', id: '1' })],
        passes: [
          createDocCode({ rule: 'pass-name1', id: '1' }),
          createDocCode({ rule: 'pass-name1', id: '2' }),
        ],
        errors: [
          createDocError({
            code: createDocCode({
              rule: 'error-name1',
              id: '1',
              html,
            }),
            message: 'Error message',
            results: [
              createTestcaseResult({
                status: 'error',
                selector: '#element',
                message: 'Element error message.',
              }),
              createTestcaseResult({
                status: 'error',
                message: 'Global error message.',
              }),
            ],
          }),
          createDocError({
            code: createDocCode({
              rule: 'error-name2',
              id: '2',
              html,
            }),
            message: 'Error message',
            results: [
              createTestcaseResult({
                status: 'error',
                message: 'Element error message.',
                selector: 'img',
              }),
            ],
          }),
          createDocError({
            code: createDocCode({
              rule: 'error-name3',
              id: '3',
              html,
            }),
            message: 'Error message',
            results: [],
          }),
          createDocError({
            code: createDocCode({
              rule: 'error-name4',
              id: '4',
              html,
            }),
            message: 'Error message',
            results: [
              createTestcaseResult({
                status: 'error',
                selector: '#element',
                message: 'Error!!',
              }),
            ],
          }),
        ],
      }),
    );

    const stdout = output.stdout.join('');

    expect(stdout).not.toBe(stripAnsi(stdout));
    expect(stripAnsi(stdout)).toMatchSnapshot();
  });

  test('only passed', async () => {
    await reporter.onComplete(
      createDocResult({
        passes: [
          createDocCode({ rule: 'pass-name1', id: '1' }),
          createDocCode({ rule: 'pass-name2', id: '2' }),
        ],
      }),
    );

    const stdout = output.stdout.join('');

    expect(stdout).not.toBe(stripAnsi(stdout));
    expect(stripAnsi(stdout)).toMatchSnapshot();
  });

  test('only errors', async () => {
    await reporter.onComplete(
      createDocResult({
        errors: [
          createDocError({
            code: createDocCode({
              rule: 'error-name1',
              id: '1',
              html,
            }),
            message: 'Error message',
            results: [
              createTestcaseResult({
                status: 'error',
                selector: '#element',
                message: 'Element error message.',
              }),
            ],
          }),
        ],
      }),
    );

    const stdout = output.stdout.join('');

    expect(stdout).not.toBe(stripAnsi(stdout));
    expect(stripAnsi(stdout)).toMatchSnapshot();
  });
});
