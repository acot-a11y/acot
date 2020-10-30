import { createCommand } from '../command';
import serve from './plugin-serve';
import test from './plugin-test';
import docgen from './plugin-docgen';

export default createCommand({
  name: 'plugin',
  summary: 'Plugin development support tools.',
  args: {},
  options: {},
  commands: [serve, test, docgen],
})(async (context) => {
  return await context.container.mustGet('help').run({
    ...context,
    args: {
      command: ['plugin'],
    },
  });
});
