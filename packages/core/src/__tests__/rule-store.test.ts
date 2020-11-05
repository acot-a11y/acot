import type { Preset } from '@acot/types';
import { RuleStore } from '../rule-store';
import { createRule } from '../rule';

describe('RuleStore', () => {
  let store: RuleStore;

  beforeEach(() => {
    store = new RuleStore();
  });

  test('define rule', () => {
    const mock = async () => {};

    const foo = createRule({ type: 'global', test: mock });
    const bar = createRule({ type: 'global', test: mock });

    store.define('foo', foo);
    store.define('bar', bar);

    expect(store.get('foo')).toBe(foo);
    expect(store.get('bar')).toBe(bar);
  });

  test('import from preset', () => {
    const mock = async () => {};

    const preset1: Preset = {
      id: 'preset1',
      rules: new Map([
        ['preset1-1', createRule({ type: 'global', test: mock })],
        ['preset1-2', createRule({ type: 'global', test: mock })],
      ]),
      configs: new Map(),
    };

    const preset2: Preset = {
      id: 'preset2',
      rules: new Map([
        ['preset2-1', createRule({ type: 'global', test: mock })],
        ['preset2-2', createRule({ type: 'global', test: mock })],
      ]),
      configs: new Map(),
    };

    store.import([preset1, preset2]);

    expect(store.get('preset1-1')).toBe(preset1.rules.get('preset1-1'));
    expect(store.get('preset1-2')).toBe(preset1.rules.get('preset1-2'));
    expect(store.get('preset2-1')).toBe(preset2.rules.get('preset2-1'));
    expect(store.get('preset2-2')).toBe(preset2.rules.get('preset2-2'));
  });

  test('extends store', () => {
    const rule = createRule({ type: 'global', test: async () => {} });

    store.define('rule', rule);

    const child = store.extends();

    expect(store).not.toBe(child);
    expect(store.get('rule')).toBe(child.get('rule'));
  });
});
