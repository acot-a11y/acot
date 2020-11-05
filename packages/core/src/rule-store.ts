import type { RuleMap, RuleId, Rule, Preset } from '@acot/types';

export class RuleStore {
  private _rules: RuleMap = new Map();

  public define(id: RuleId, rule: Rule): void {
    this._rules.set(id, rule);
  }

  public import(presets: Preset[]): void {
    for (const preset of presets) {
      for (const [id, rule] of preset.rules) {
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
