import path from 'path';
import visit from 'unist-util-visit-parents';
import toString from 'mdast-util-to-string';
import unified from 'unified';
import markdown from 'remark-parse';
import type { DocCode, DocCodeType, DocCodeMeta } from './doc-code';
import type { DocFile } from './doc-file';
import { DocParseError } from './errors';

const CORRECT_REG = /Correct/;
const INCORRECT_REG = /Incorrect/;

export class DocParser {
  public parse(file: DocFile): DocCode[] {
    const rule = path.parse(file.path).name;
    const ast = unified().use(markdown).parse(file.content);
    const errors: string[] = [];
    const codes: DocCode[] = [];
    let status: DocCodeType | null = null;

    // TODO Error handling
    //   - invalid meta format
    //   - etc...

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

    if (errors.length > 0) {
      throw new DocParseError(errors);
    }

    return codes;
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
