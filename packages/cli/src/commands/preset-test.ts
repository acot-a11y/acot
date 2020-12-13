import path from 'path';
import type { DocProject } from '@acot/document';
import {
  DocResultReporter,
  DocProjectLoader,
  DocServer,
  DocTester,
} from '@acot/document';
import { getPortPromise } from 'portfinder';
import { createCommand } from '../command';
import { DEFAULT_PORT } from '../constants';
const debug = require('debug')('acot:cli');

export default createCommand({
  name: 'test',
  summary:
    'Test the rules provided by the preset according to the documentation.',
  args: {},
  options: {
    project: {
      type: 'string',
      alias: 'p',
      default: '.',
      description:
        'Directory path that contains the package.json that makes up the preset.',
    },
    docs: {
      type: 'string',
      alias: 'd',
      default: path.join('docs', 'rules'),
      description: 'Directory path that contains the rule documentation.',
    },
    port: {
      type: 'number',
      description: 'Port number for preview server.',
    },
  },
})(async ({ cwd, logger, args }) => {
  const proj = path.resolve(cwd, args.project);

  let project: DocProject;
  try {
    const loader = new DocProjectLoader({ docs: args.docs });
    project = await loader.load(proj);
  } catch (e) {
    logger.error('DocProjectLoader#load Error:', e);
    return 1;
  }

  if (project.codes.length === 0) {
    logger.print('Can\'t find the document files. (from: "%s")', args.docs);
    return 1;
  }

  const port = args.port || (await getPortPromise({ port: DEFAULT_PORT }));

  const server = new DocServer({
    dev: false,
    port,
  });

  const tester = new DocTester(server, {});
  const reporter = new DocResultReporter({
    origin: `http://localhost:${port}`,
  });

  try {
    const result = await tester.test(project);
    debug('result: %O', result);
    logger.print(reporter.format(result));
    return result.errors.length > 0 ? 1 : 0;
  } catch (e) {
    logger.error('DocTester#test Error:', e);
    return 1;
  }
});
