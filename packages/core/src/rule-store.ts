import type { RuleMap, RuleId, Rule, Plugin } from '@acot/types';

export class RuleStore {
  private _rules: RuleMap = new Map();

  public define(id: RuleId, rule: Rule): void {
    this._rules.set(id, rule);
  }

  public import(plugins: Plugin[]): void {
    for (const plugin of plugins) {
      for (const [id, rule] of plugin.rules) {
        this.define(id, rule);
      }
    }
  }

  public get(id: RuleId): Rule | null {
    return this._rules.get(id) ?? null;
  }

  public extends(): RuleStore {
    const store = new RuleStore();
    store._rules = new Map(this._rules);
    return store;
  }
}
