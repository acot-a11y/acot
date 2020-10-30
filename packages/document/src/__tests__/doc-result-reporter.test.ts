import stripAnsi from 'strip-ansi';
import { createTestcaseResult } from '@acot/factory';
import { DocResultReporter } from '../doc-result-reporter';
import { createDocError } from '../__mocks__/doc-error';
import { createDocResult } from '../__mocks__/doc-result';
import { createDocCode } from '../__mocks__/doc-code';

describe('DocResultReporter', () => {
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

  let reporter: DocResultReporter;

  beforeEach(() => {
    reporter = new DocResultReporter();
  });

  test('empty', () => {
    const output = new DocResultReporter().format(createDocResult());

    expect(output).not.toBe(stripAnsi(output));
    expect(stripAnsi(output)).toMatchSnapshot();
  });

  test('color disable', () => {
    const output = new DocResultReporter({ color: false }).format(
      createDocResult(),
    );

    expect(output).toBe(stripAnsi(output));
  });

  test('passed and errors', () => {
    const output = reporter.format(
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

    expect(output).not.toBe(stripAnsi(output));
    expect(stripAnsi(output)).toMatchSnapshot();
  });

  test('only passed', () => {
    const output = reporter.format(
      createDocResult({
        passes: [
          createDocCode({ rule: 'pass-name1', id: '1' }),
          createDocCode({ rule: 'pass-name2', id: '2' }),
        ],
      }),
    );

    expect(output).not.toBe(stripAnsi(output));
    expect(stripAnsi(output)).toMatchSnapshot();
  });

  test('only errors', () => {
    const output = reporter.format(
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

    expect(output).not.toBe(stripAnsi(output));
    expect(stripAnsi(output)).toMatchSnapshot();
  });
});
