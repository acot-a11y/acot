import os from 'os';
import path from 'path';
import type { DocProject } from '@acot/document';
import {
  DocProjectLoader,
  DocReporter,
  DocRunner,
  DocServer,
} from '@acot/document';
import { getPortPromise } from 'portfinder';
import { createCommand } from '../command';
import { DEFAULT_PORT } from '../constants';
const debug = require('debug')('acot:cli');

export default createCommand({
  name: 'test',
  summary:
    'Test the rules provided by the preset according to the documentation.',
  args: {
    pattern: {
      type: 'string',
      description: 'Rule name pattern to include in the test target.',
    },
  },
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
    parallel: {
      type: 'number',
      default: os.cpus().length - 1,
      description:
        'Number of parallel audit browsers. (default: "os.cpus().length - 1")',
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

  const reporter = new DocReporter({
    origin: `http://localhost:${port}`,
    stdout: logger.getStdout(),
    stderr: logger.getStderr(),
  });

  const runner = new DocRunner(server, reporter, {
    project,
    parallel: args.parallel,
  });

  try {
    const result = await runner.run(args.pattern);
    debug('result: %O', result);
    return result.errors.length > 0 ? 1 : 0;
  } catch (e) {
    logger.error('DocTester#test Error:', e);
    return 1;
  }
});
