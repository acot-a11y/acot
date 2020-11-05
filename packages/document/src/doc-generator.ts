import path from 'path';
import { pkg2shorthand } from '@acot/utils';
import type { DocCode } from './doc-code';
import type { DocProject } from './doc-project';

export class DocGenerator {
  public async generate(project: DocProject): Promise<string> {
    const map = new Map<string, DocCode>();
    project.codes.forEach((code) => {
      map.set(code.path, code);
    });

    if (map.size === 0) {
      return '';
    }

    const codes = Array.from(map.values());
    const table = [['Name', 'Summary', ':heavy_check_mark:']];
    const prefix = pkg2shorthand(project.name, 'preset');

    for (const code of codes) {
      const ruleId = `${project.preset.id}/${code.rule}`;
      const rule = project.preset.rules.get(ruleId);
      const relative = path.relative(project.root, code.path);

      table.push([
        `[\`${prefix}/${code.rule}\`](./${relative})`,
        code.summary.markdown,
        rule?.meta?.recommended ? ':heavy_check_mark:' : '',
      ]);
    }

    const max = table.reduce((acc, cur) => {
      return acc.map((v, i) => Math.max(v, cur[i].length));
    }, Array(table[0].length).fill(0));

    return table
      .reduce((acc, cur, i) => {
        acc.push(this._row(cur.map((col, j) => col.padEnd(max[j]))));

        if (i === 0) {
          acc.push(this._row(max.map((m) => `:${'-'.repeat(m - 1)}`)));
        }

        return acc;
      }, [])
      .join('\n');
  }

  private _row(col: string[]): string {
    return `| ${col.join(' | ')} |`;
  }
}
