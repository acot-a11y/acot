import type { Plugin } from '@acot/types';
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

  test('import from plugin', () => {
    const mock = async () => {};

    const plugin1: Plugin = {
      id: 'plugin1',
      rules: new Map([
        ['plugin1-1', createRule({ type: 'global', test: mock })],
        ['plugin1-2', createRule({ type: 'global', test: mock })],
      ]),
      configs: new Map(),
    };

    const plugin2: Plugin = {
      id: 'plugin2',
      rules: new Map([
        ['plugin2-1', createRule({ type: 'global', test: mock })],
        ['plugin2-2', createRule({ type: 'global', test: mock })],
      ]),
      configs: new Map(),
    };

    store.import([plugin1, plugin2]);

    expect(store.get('plugin1-1')).toBe(plugin1.rules.get('plugin1-1'));
    expect(store.get('plugin1-2')).toBe(plugin1.rules.get('plugin1-2'));
    expect(store.get('plugin2-1')).toBe(plugin2.rules.get('plugin2-1'));
    expect(store.get('plugin2-2')).toBe(plugin2.rules.get('plugin2-2'));
  });

  test('extends store', () => {
    const rule = createRule({ type: 'global', test: async () => {} });

    store.define('rule', rule);

    const child = store.extends();

    expect(store).not.toBe(child);
    expect(store.get('rule')).toBe(child.get('rule'));
  });
});
