import unified from 'unified';
import markdown from 'remark-parse';
import visit from 'unist-util-visit-parents';

const IDENTIFIER = 'acot-rules';
const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;
const INITIAL_LINE = -1;

export type DocInjectorConfig = {
  markdown: string;
};

export class DocInjector {
  public inject(content: string, rules: string): string {
    const tree = unified().use(markdown).parse(content);
    const rows = {
      start: INITIAL_LINE,
      end: INITIAL_LINE,
    };

    visit(tree, (node) => {
      if (node.type === 'html' && typeof node.value === 'string') {
        const value = this._parseHtmlComment(node.value);
        switch (value) {
          case `${IDENTIFIER}:start`:
            rows.start = node.position!.start.line;
            break;
          case `${IDENTIFIER}:end`:
            rows.end = node.position!.end.line;
            break;
        }
      }
    });

    if (rows.start === INITIAL_LINE && rows.end === INITIAL_LINE) {
      throw new Error('"acot-rules:{start,end}" marker does not exist.');
    }

    if (rows.start === INITIAL_LINE) {
      throw new Error('"acot-rules:end" marker does not exist.');
    }

    if (rows.end === INITIAL_LINE) {
      throw new Error('"acot-rules:start" marker does not exist.');
    }

    const lines = content.split(NEWLINE);

    lines.splice(rows.start, rows.end - rows.start - 1, rules);

    return lines.join('\n');
  }

  private _parseHtmlComment(code: string): string {
    const match = code.match(/<!--(.*)-->/);
    return match ? match[1].trim() : '';
  }
}
