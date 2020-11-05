import path from 'path';
import { DocProjectLoader, DocServer } from '@acot/document';
import chokidar from 'chokidar';
import { getPortPromise } from 'portfinder';
import { createCommand } from '../command';
import { DEFAULT_PORT } from '../constants';

export default createCommand({
  name: 'serve',
  summary:
    'Launch a server that delivers the documentation created for the rules provided by the preset as HTML.',
  args: {},
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
    port: {
      type: 'number',
      description: '...',
    },
    watch: {
      type: 'boolean',
      alias: 'w',
      description: '...',
    },
  },
})(
  ({ cwd, logger, args }) =>
    new Promise((resolve, reject) => {
      (async () => {
        try {
          const port =
            args.port || (await getPortPromise({ port: DEFAULT_PORT }));

          const watcher = args.watch
            ? chokidar.watch(path.join(cwd, args.docs))
            : null;

          const loader = new DocProjectLoader({ docs: args.docs });
          const server = new DocServer({
            port,
            dev: !!args.watch,
          });

          const load = async () => {
            try {
              return await loader.load(cwd);
            } catch (e) {
              logger.error('DocLoader#load Error:', e);
              return null;
            }
          };

          const bootstrap = async () => {
            logger.print('startup documentation server...');
            const project = await load();
            if (project == null) {
              return resolve(1);
            }

            await server.bootstrap(project);
            logger.print(`http://localhost:${port}`);
          };

          const handleChange = async () => {
            logger.print('reloading documentation server...');
            const project = await load();
            if (project == null) {
              return resolve(1);
            }

            server.update(project);
            logger.print('restarted!');
          };

          process.on('SIGINT', async () => {
            try {
              await watcher?.close();
              await server.terminate();
            } catch (e) {
              logger.error('SIGINT Error: ', e);
            }
            resolve(0);
          });

          await bootstrap();

          if (watcher != null) {
            watcher.on('ready', () => {
              watcher
                .on('change', handleChange)
                .on('add', handleChange)
                .on('unlink', handleChange);
            });
          }
        } catch (e) {
          reject(e);
        }
      })();
    }),
);
