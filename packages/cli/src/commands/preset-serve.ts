import path from 'path';
import { DocProjectLoader, DocServer } from '@acot/document';
import boxen from 'boxen';
import chokidar from 'chokidar';
import { getPortPromise } from 'portfinder';
import chalk from 'chalk';
import opener from 'opener';
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
    watch: {
      type: 'boolean',
      alias: 'w',
      description: 'Watch document files.',
    },
    'no-open': {
      type: 'boolean',
      default: false,
      description: 'Does not open the browser automatically.',
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
            const project = await load();
            if (project == null) {
              return resolve(1);
            }

            await server.bootstrap(project);

            const url = `http://localhost:${port}`;

            logger.print('');
            logger.print(
              boxen(
                [
                  chalk`Serving {green.bold ${project.name}}`,
                  watcher == null
                    ? chalk`Watch mode is {gray.bold disabled}`
                    : chalk`Watch mode is {green.bold enabled}`,
                  '',
                  chalk`Listening on: {blue.underline ${url}}`,
                ].join('\n'),
                { borderColor: 'gray', padding: 1 },
              ),
            );
            logger.print('');

            if (args['no-open'] !== true) {
              opener(url);
            }
          };

          const handleChange = async () => {
            logger.print(chalk.gray('Reloading server...'));

            const project = await load();
            if (project == null) {
              return resolve(1);
            }

            server.update(project);

            logger.print(chalk.bold.green('Restarted!'));
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
