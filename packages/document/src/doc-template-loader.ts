import fs from 'fs';

export class DocTemplateLoader {
  private _cache: Map<string, string> = new Map();

  public load(filepath: string): string {
    if (this._cache.has(filepath)) {
      return this._cache.get(filepath)!;
    }

    const template = fs.readFileSync(filepath, 'utf8');

    this._cache.set(filepath, template);

    return template;
  }

  public clear(): void {
    this._cache = new Map();
  }
}
