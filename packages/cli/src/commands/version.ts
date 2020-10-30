import { createCommand } from '../command';

export default createCommand({
  name: 'version',
  summary: 'Show version.',
  args: {},
  options: {},
})(async ({ logger, pkg }) => {
  logger.print(`v${pkg.version}`);
  return 0;
});
