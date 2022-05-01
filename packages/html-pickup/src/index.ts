import chalk from 'chalk';
import truncate from 'cli-truncate';
import cssSelect from 'css-select';
import { parse5Adapter as adapter } from 'css-select-parse5-adapter';
import type {
  DefaultTreeElement,
  DefaultTreeTextNode,
  DefaultTreeNode,
  DefaultTreeDocumentType,
  DefaultTreeDocument,
  DefaultTreeDocumentFragment,
  DefaultTreeCommentNode,
} from 'parse5';
import { parse } from 'parse5';

const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;

type Node =
  | DefaultTreeDocumentType
  | DefaultTreeDocument
  | DefaultTreeDocumentFragment
  | DefaultTreeElement
  | DefaultTreeCommentNode
  | DefaultTreeTextNode
  | DefaultTreeNode;

const minify = (str: string) =>
  str
    .trim()
    .split(NEWLINE)
    .map((line) => line.trim())
    .join('');

const stringify = (node: Node, chk: chalk.Chalk) => {
  let html = '';

  const color = {
    tag: chk.gray,
    attr: chk.green,
  };

  switch (node.nodeName) {
    case '#comment':
      break;
    case '#text': {
      if ('value' in node) {
        html += minify(node.value);
      }
      break;
    }
    default: {
      if ('tagName' in node) {
        const list = node.attrs.map((attr) => {
          const value = color.attr`"${minify(attr.value)}"`;
          let name = '';

          if (!attr.namespace) {
            name = attr.name;
          } else {
            switch (attr.namespace) {
              case 'http://www.w3.org/XML/1998/namespace':
                name = `xml:${attr.name}`;
                break;
              case 'http://www.w3.org/2000/xmlns/':
                if (attr.name !== 'xmlns') {
                  name = 'xmlns:';
                }

                name += attr.name;
                break;
              case 'http://www.w3.org/1999/xlink':
                name = `xlink:${attr.name}`;
                break;
              default:
                name = `${attr.prefix}:${attr.name}`;
                break;
            }
          }

          return `${name}=${value}`;
        });

        const attrs = list.length > 0 ? ` ${list.join(' ')}` : '';

        html += `${color.tag`<`}${node.tagName}${attrs}`;

        if (node.childNodes.length > 0) {
          html += color.tag`>`;
          html += node.childNodes
            .map((child) => stringify(child, chk))
            .join('');
          html += `${color.tag`<`}/${node.tagName}`;
        } else {
          html += ' /';
        }

        html += color.tag`>`;
      }
      break;
    }
  }

  return html;
};

export type PickupOptions = {
  truncate: number;
  color: boolean;
};

export const pickup = (
  html: string,
  selector: string,
  options: Partial<PickupOptions> = {},
): string | null => {
  const opts = {
    truncate: 120,
    color: true,
    ...options,
  };

  const chk = new chalk.Instance({
    level: opts.color ? 1 : 0,
  });

  const [node] = cssSelect(selector, parse(html), {
    adapter,
  }) as Node[];

  if (node == null) {
    return null;
  }

  const output = stringify(node, chk);

  return truncate(output, opts.truncate);
};
