import fs from 'fs';
import path from 'path';
import { DocGenerator, DocInjector, DocProjectLoader } from '@acot/document';
import { createCommand } from '../command';
const debug = require('debug')('acot:cli');

export default createCommand({
  name: 'docgen',
  summary: 'Document generation of the list of rules provided by the plugin.',
  args: {
    target: {
      type: 'string',
      default: 'README.md',
      description: '...',
    },
  },
  options: {
    project: {
      type: 'string',
      alias: 'p',
      default: '.',
      description: '...',
    },
    docs: {
      type: 'string',
      alias: 'd',
      default: path.join('docs', 'rules'),
      description: '...',
    },
    'dry-run': {
      type: 'boolean',
      default: false,
      description: '...',
    },
  },
})(async ({ cwd, logger, args }) => {
  const proj = path.resolve(cwd, args.project);
  const target = path.resolve(proj, args.target);
  const loader = new DocProjectLoader({ docs: args.docs });
  const generator = new DocGenerator();

  try {
    const project = await loader.load(proj);
    const rules = await generator.generate(project);
    const markdown = fs.readFileSync(target, 'utf8');
    const injector = new DocInjector();
    const output = injector.inject(markdown, rules);

    if (args['dry-run'] === true) {
      debug('write to stdout');
      logger.print(output);
    } else {
      debug('write to file (%s)', target);
      fs.writeFileSync(target, output, 'utf8');
    }
  } catch (e) {
    logger.error(e);
    return 1;
  }

  return 0;
});
