import path from 'path';
import type { Node } from 'unist';
import visit from 'unist-util-visit-parents';
import { select } from 'unist-util-select';
import toString from 'mdast-util-to-string';
import unified from 'unified';
import markdown from 'remark-parse';
import stringify from 'remark-stringify';
import type {
  DocCode,
  DocCodeType,
  DocCodeMeta,
  DocCodeSummary,
} from './doc-code';
import type { DocFile } from './doc-file';

const CORRECT_REG = /Correct/;
const INCORRECT_REG = /Incorrect/;

export class DocParser {
  private _processor: unified.Processor;

  public constructor() {
    this._processor = unified().use(markdown).use(stringify);
  }

  public parse(file: DocFile): DocCode[] {
    const rule = path.parse(file.path).name;
    const ast = this._processor.parse(file.content);
    const summary = this._parseSummary(ast);
    const codes: DocCode[] = [];

    // TODO Error handling
    //   - invalid meta format
    //   - etc...

    let status: DocCodeType | null = null;

    visit(ast, (node) => {
      switch (node.type) {
        case 'heading': {
          if (node.depth === 2) {
            const title = toString(node);

            if (CORRECT_REG.test(title)) {
              status = 'correct';
            } else if (INCORRECT_REG.test(title)) {
              status = 'incorrect';
            } else {
              status = null;
            }
          }
          break;
        }

        case 'code': {
          if (
            status != null &&
            node.lang === 'html' &&
            typeof node.value === 'string'
          ) {
            codes.push({
              path: file.path,
              rule,
              summary,
              type: status,
              id: `${codes.length + 1}`,
              meta: this._parseMeta(node.meta),
              html: node.value,
            });
          }
          break;
        }
      }
    });

    return codes;
  }

  private _parseSummary(ast: Node): DocCodeSummary {
    const node = select('heading[depth=1] ~ paragraph:first-of-type', ast);

    return {
      markdown: node != null ? this._processor.stringify(node).trim() : '',
      text: node != null ? toString(node).trim() : '',
    };
  }

  private _parseMeta(meta: unknown): DocCodeMeta {
    if (typeof meta !== 'string') {
      return {};
    }

    const tokens = meta.split(',').map((s) => s.trim());

    return tokens.reduce<DocCodeMeta>((acc, cur) => {
      const match = cur.match(/^([^:]+):(.*)?$/u);
      const key = match != null ? match[1] : cur;
      const value = match != null ? match[2] : 'true';

      acc[key] = this._parseScalarValue(value);

      return acc;
    }, {});
  }

  private _parseScalarValue(
    value: string,
  ): string | number | boolean | null | undefined {
    switch (value) {
      case 'null':
        return null;
      case 'undefined':
        return undefined;
      case 'true':
        return true;
      case 'false':
        return false;
    }

    const n = parseFloat(value);
    if (Number.isFinite(n)) {
      return n;
    }

    return value.replace(/^['"](.*)['"]$/, '$1');
  }
}
