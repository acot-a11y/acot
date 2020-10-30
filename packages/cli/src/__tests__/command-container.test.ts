import { CommandContainer } from '../command-container';
import type { CommandModule } from '../command';
import { createCommand } from '../command';

describe('CommandContainer', () => {
  const factory = (name: string, commands: CommandModule<any, any>[] = []) =>
    createCommand({
      name,
      commands,
      summary: '...',
      options: {},
      args: {},
    })('runner mock' as any);

  test('top level command', () => {
    const cmd1 = factory('cmd1');
    const cmd2 = factory('cmd2');
    const container = new CommandContainer([cmd1, cmd2]);

    expect(container.all()).toEqual([cmd1, cmd2]);
    expect(container.main()).toEqual([cmd1, cmd2]);

    expect(container.get('cmd1')).toBe(cmd1);
    expect(container.get('cmd2')).toBe(cmd2);
    expect(container.get('notfound')).toBeUndefined();

    expect(container.mustGet('cmd1')).toBe(cmd1);
    expect(container.mustGet('cmd2')).toBe(cmd2);
    expect(() => container.mustGet('notfound')).toThrow(ReferenceError);
  });

  test('sub commands', () => {
    const sub11 = factory('sub11');
    const sub12 = factory('sub12');
    const cmd1 = factory('cmd1', [sub11, sub12]);
    const sub21 = factory('sub21');
    const sub22 = factory('sub22');
    const cmd2 = factory('cmd2', [sub21, sub22]);
    const container = new CommandContainer([cmd1, cmd2]);

    expect(container.all()).toEqual([cmd1, sub11, sub12, cmd2, sub21, sub22]);
    expect(container.main()).toEqual([cmd1, cmd2]);

    expect(container.get('cmd1')).toBe(cmd1);
    expect(container.get('cmd1.sub11')).toBe(sub11);
    expect(container.get('cmd1.sub12')).toBe(sub12);
    expect(container.get('cmd2')).toBe(cmd2);
    expect(container.get('cmd2.sub21')).toBe(sub21);
    expect(container.get('cmd2.sub22')).toBe(sub22);
    expect(container.get('notfound')).toBeUndefined();

    expect(container.mustGet('cmd1')).toBe(cmd1);
    expect(container.mustGet('cmd1.sub11')).toBe(sub11);
    expect(container.mustGet('cmd1.sub12')).toBe(sub12);
    expect(container.mustGet('cmd2')).toBe(cmd2);
    expect(container.mustGet('cmd2.sub21')).toBe(sub21);
    expect(container.mustGet('cmd2.sub22')).toBe(sub22);
    expect(() => container.mustGet('notfound')).toThrow(ReferenceError);
  });
});
