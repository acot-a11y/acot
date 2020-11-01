import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import type {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  FastifyError,
} from 'fastify';
import fastify from 'fastify';
import mustache from 'mustache';
import type { DocCode } from './doc-code';
import { generateDocUrl } from './doc-code';
import { DocTemplateLoader } from './doc-template-loader';
import type { DocProject } from './doc-project';
import { debug } from './logging';

const TEMPLATES_DIR = path.resolve(__dirname, '..', 'templates');

const readFile = promisify(fs.readFile);

const readTemplate = (name: string) =>
  readFile(path.resolve(TEMPLATES_DIR, name), 'utf8');

type Template = {
  default: string;
  index: string;
};

type DocRule = {
  url: string;
} & DocCode;

type DocRuleGroup = {
  rule: string;
  summary: string;
  rules: DocRule[];
};

export type DocServerConfig = {
  port: number;
  dev: boolean;
};

export class DocServer {
  private _config: DocServerConfig;
  private _server: FastifyInstance;
  private _loader: DocTemplateLoader;
  private _template: Template;
  private _project: DocProject | null = null;

  public constructor(config: DocServerConfig) {
    this._config = config;
    this._server = fastify();
    this._loader = new DocTemplateLoader();
    this._template = {
      default: '',
      index: '',
    };
  }

  public get port(): number {
    return this._config.port;
  }

  public async bootstrap(project: DocProject): Promise<void> {
    const { port } = this._config;

    this.update(project);

    this._server
      .get('/', this._handleIndex)
      .get('/:rule/:id', this._handleRule);

    this._server.setNotFoundHandler(this._handleNotFound);
    this._server.setErrorHandler(this._handleError);

    await this._server.listen(port, '0.0.0.0');
  }

  public update(project: DocProject): void {
    this._project = project;
    this._loader.clear();
  }

  public async terminate(): Promise<void> {
    await this._server.close();
  }

  private async _updateTemplateIfNeeded(name: keyof Template): Promise<void> {
    if (!this._config.dev && this._template[name] !== '') {
      return;
    }

    this._template[name] = await readTemplate(`${name}.html`);
  }

  private _mustGetProject(): DocProject {
    const project = this._project;
    if (project == null) {
      throw new Error('The "project" has not been initialized.');
    }

    return project;
  }

  private _handleIndex = async (
    _request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const project = this._mustGetProject();

    await this._updateTemplateIfNeeded('index');

    const { port } = this._config;

    const rules: DocRule[] = [];
    const pluginId = path.parse(path.normalize(project.main)).name;

    const groups = project.codes.reduce<DocRuleGroup[]>((acc, cur) => {
      const rule = {
        ...cur,
        url: generateDocUrl(port, cur),
      };

      rules.push(rule);

      const group = acc.find(({ rule }) => rule === cur.rule);

      if (group != null) {
        group.rules.push(rule);
      } else {
        const meta = project.plugin.rules.get(`${pluginId}/${cur.rule}`)?.meta;

        acc.push({
          rule: cur.rule,
          summary: meta?.description ?? '(empty)',
          rules: [rule],
        });
      }

      return acc;
    }, []);

    const html = mustache.render(this._template.index, {
      name: project.name,
      groups,
      rules,
    });

    reply
      .headers({
        'Content-Type': 'text/html',
      })
      .send(html);
  };

  private _handleRule = async (
    request: FastifyRequest<{
      Params: {
        rule: string;
        id: string;
      };
    }>,
    reply: FastifyReply,
  ) => {
    const project = this._mustGetProject();

    await this._updateTemplateIfNeeded('default');

    debug('request url: %s', request.raw.url);

    const { rule, id } = request.params;
    const code = project.codes.find(
      (code) => code.rule === rule && code.id === id,
    );

    if (code == null) {
      debug('not found rule: %s/%s', rule, id);
      return this._handleNotFound(request, reply);
    }

    let template = this._template.default;
    if (code.meta['acot-template'] != null) {
      try {
        template = this._loader.load(
          path.resolve(path.dirname(code.path), code.meta['acot-template']),
        );
      } catch (e) {
        // TODO logging
        debug('not found template: %O', e);
      }
    }

    const vars: Record<string, any> = {
      title: `${code.rule} - ${project.name}`,
    };

    if (code.meta['acot-head'] === true) {
      vars.head = code.html;
      vars.html = '';
    } else {
      vars.head = '';
      vars.html = code.html;
    }

    const html = mustache.render(template, vars);

    reply
      .headers({
        'Content-Type': 'text/html',
      })
      .send(html);
  };

  private _handleError = (
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    debug('handleError: %s - %O, ', request.raw.url, error);
    reply.status(500).send('unexpected error');
  };

  private _handleNotFound = (request: FastifyRequest, reply: FastifyReply) => {
    debug('handleNotFound: %s', request.raw.url);
    reply.status(404).send('404 Not found');
  };
}
