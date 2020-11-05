import { createCommand } from '../command';
import serve from './preset-serve';
import test from './preset-test';
import docgen from './preset-docgen';

export default createCommand({
  name: 'preset',
  summary: 'Preset development support tools.',
  args: {},
  options: {},
  commands: [serve, test, docgen],
})(async (context) => {
  return await context.container.mustGet('help').run({
    ...context,
    args: {
      command: ['preset'],
    },
  });
});
