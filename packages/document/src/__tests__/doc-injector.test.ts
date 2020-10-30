import { DocInjector } from '../doc-injector';

const INJECT_CONTENT = '--- injected!! ---';

describe('DocInjector', () => {
  test.each([
    [
      'empty',
      `
# Title

> Summary


<!-- acot-rules:start -->   
   <!-- acot-rules:end -->

- Foo
  - Bar
    - Baz

<div>
  <p>HTML Paragraph.</p>
</div>
      `,
    ],
    [
      'replace',
      `
# Title

<!-- acot-rules:start -->
ORIGINAL CONTENT
<!-- acot-rules:end -->

- Foo
  - Bar
    - Baz
      `,
    ],
    [
      'comment format',
      `
<!--acot-rules:start-->
ORIGINAL CONTENT
<!--    \t acot-rules:end \t\t          -->
      `,
    ],
  ])('inject - %s', (_, input) => {
    const injector = new DocInjector();

    expect(injector.inject(input.trim(), INJECT_CONTENT)).toMatchSnapshot();
  });

  test('inject - no opening marker', () => {
    const injector = new DocInjector();
    const markdown = '<!-- acot-rules:end -->';

    expect(() => {
      injector.inject(markdown, INJECT_CONTENT);
    }).toThrow();
  });

  test('inject - no closing marker', () => {
    const injector = new DocInjector();
    const markdown = '<!-- acot-rules:start -->';

    expect(() => {
      injector.inject(markdown, INJECT_CONTENT);
    }).toThrow();
  });

  test('inject - no markers', () => {
    const injector = new DocInjector();

    expect(() => {
      injector.inject('', INJECT_CONTENT);
    }).toThrow();
  });
});
