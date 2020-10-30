import { DocParser } from '../doc-parser';
import { createDocCode } from '../__mocks__/doc-code';

describe('DocParser', () => {
  let parser: DocParser;

  beforeEach(() => {
    parser = new DocParser();
  });

  test('correct and incorrect', () => {
    const rule = 'rule-name';
    const path = `path/${rule}.md`;

    const codes = parser.parse({
      path,
      content: `
# Rule title

> summary [link](#to) \`code\` text.

description.

\`\`\`html
<p class="other-1"></p>
\`\`\`

## Correct

\`\`\`bash
$ no-html "foo bar baz"
\`\`\`

\`\`\`html
<p class="correct-1"></p>
\`\`\`

### Heading3

\`\`\`html acot-ignore, opener:[data-dialog="opener"], dialog:.dialog
<p class="correct-2"></p>
\`\`\`

## Incorrect

\`\`\`html attr1:"string1", attr2:'string2', attr3:string3, attr4:1000, attr5:false, attr6:null
<p class="incorrect-1"></p>
\`\`\`

\`\`\`html acot-ignore
<p class="incorrect-2"></p>
\`\`\`

## Other

\`\`\`html
<p class="other-2"></p>
\`\`\`

> not a summary
`,
    });

    expect(codes).toEqual([
      createDocCode({
        path,
        rule,
        type: 'correct',
        id: '1',
        meta: {},
        html: '<p class="correct-1"></p>',
      }),
      createDocCode({
        path,
        rule,
        type: 'correct',
        id: '2',
        meta: {
          'acot-ignore': true,
          opener: '[data-dialog="opener"]',
          dialog: '.dialog',
        },
        html: '<p class="correct-2"></p>',
      }),
      createDocCode({
        path,
        rule,
        type: 'incorrect',
        id: '3',
        meta: {
          attr1: 'string1',
          attr2: 'string2',
          attr3: 'string3',
          attr4: 1000,
          attr5: false,
          attr6: null,
        },
        html: '<p class="incorrect-1"></p>',
      }),
      createDocCode({
        path,
        rule,
        type: 'incorrect',
        id: '4',
        meta: {
          'acot-ignore': true,
        },
        html: '<p class="incorrect-2"></p>',
      }),
    ]);
  });

  test('correct only', () => {
    const rule = 'rule-name';
    const path = `${rule}.md`;

    const codes = parser.parse({
      path,
      content: `
## Correct

\`\`\`html
<p class="correct-1"></p>
\`\`\`
  `,
    });

    expect(codes).toEqual([
      createDocCode({
        path,
        rule,
        type: 'correct',
        id: '1',
        meta: {},
        html: '<p class="correct-1"></p>',
      }),
    ]);
  });

  test('incorrect only', () => {
    const rule = 'rule-name';
    const path = `${rule}.md`;

    const codes = parser.parse({
      path,
      content: `
## Incorrect

\`\`\`html
<p class="incorrect-1"></p>
\`\`\`
  `,
    });

    expect(codes).toEqual([
      createDocCode({
        path,
        rule,
        type: 'incorrect',
        id: '1',
        meta: {},
        html: '<p class="incorrect-1"></p>',
      }),
    ]);
  });

  test('heading format', () => {
    const rule = 'rule-name';
    const path = `${rule}.md`;

    const codes = parser.parse({
      path,
      content: `
## :dog: Correct :new:

\`\`\`html
correct1
\`\`\`

## :cat: Incorrect :new:

\`\`\`html
incorrect1
\`\`\`
  `,
    });

    expect(codes).toEqual([
      createDocCode({
        path,
        rule,
        type: 'correct',
        id: '1',
        meta: {},
        html: 'correct1',
      }),
      createDocCode({
        path,
        rule,
        type: 'incorrect',
        id: '2',
        meta: {},
        html: 'incorrect1',
      }),
    ]);
  });

  test('empty code', () => {
    const rule = 'rule-name';
    const path = `${rule}.md`;

    const codes = parser.parse({
      path,
      content: `
## Heading

\`\`\`html
correct1
\`\`\`
  `,
    });

    expect(codes).toEqual([]);
  });
});
