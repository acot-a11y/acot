jest.mock('env-ci');

import nock from 'nock';
import { MockRunner, MockLogger } from '@acot/mock';
import { createSummary } from '@acot/factory';
import env from 'env-ci';
import factory from '..';

const config = {
  origin: 'http://localhost:3000',
  rules: {},
};

describe('GitHub Reporter', () => {
  let stdout: NodeJS.WritableStream;
  let stderr: NodeJS.WritableStream;
  let stdoutSpy: jest.SpyInstance;
  let stderrSpy: jest.SpyInstance;
  let scope: nock.Scope;

  beforeEach(() => {
    const logger = new MockLogger();

    stdout = logger.getStdout();
    stderr = logger.getStderr();

    stdoutSpy = jest.spyOn(stdout, 'write').mockImplementation(() => true);
    stderrSpy = jest.spyOn(stderr, 'write').mockImplementation(() => true);

    if (!nock.isActive()) {
      nock.activate();
    }

    scope = nock('https://gh-app-api.acot.dev');
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();

    jest.resetModules();

    nock.cleanAll();
    nock.restore();
  });

  describe('validation', () => {
    test.each([
      {
        token: null,
      },
      {
        token: 123,
      },
      {
        endpoint: 'foo bar baz',
      },
      {
        unknown: true,
      },
    ])('invalid options (%p)', (options: any) => {
      expect(() => {
        factory({
          config,
          stdout,
          stderr,
          verbose: false,
          options,
        });
      }).toThrowError('GitHubReporter');
    });
  });

  describe('success', () => {
    const setup = () => {
      const summary = createSummary();

      const runner = new MockRunner(async (emitter) => {
        await emitter.emit('audit:complete', [summary]);
        return summary;
      });

      scope
        .post('/pr/comment', {
          number: 123,
          meta: {
            core: {
              version: runner.version.core,
            },
            runner: {
              name: runner.name,
              version: runner.version.self,
            },
            origin: config.origin,
            commit: 'hash',
          },
          summary,
        })
        .matchHeader('Authorization', 'Bearer token')
        .reply(200, {
          ok: true,
        });

      return {
        summary,
        runner,
      };
    };

    beforeEach(() => {
      (env as any).mockReturnValue({
        isCi: true,
        isPr: true,
        pr: 123,
        commit: 'hash',
      });
    });

    test('outside ci', async () => {
      (env as any).mockReturnValue({
        isCi: false,
      });

      const { runner } = setup();

      factory({
        config,
        stdout,
        stderr,
        verbose: false,
        options: {
          token: 'token',
        },
      })(runner);

      await runner.run();

      expect(stderr.write).not.toBeCalled();

      expect(scope.isDone()).toBe(false);
    });

    test('use options.token', async () => {
      const { runner } = setup();

      factory({
        config,
        stdout,
        stderr,
        verbose: false,
        options: {
          token: 'token',
        },
      })(runner);

      await runner.run();

      expect(stderr.write).not.toBeCalled();

      expect(scope.isDone()).toBe(true);
    });

    test('use environment variables', async () => {
      const { runner } = setup();

      process.env.ACOT_GITHUB_APP_TOKEN = 'token';

      factory({
        config,
        stdout,
        stderr,
        verbose: false,
        options: {},
      })(runner);

      delete process.env.ACOT_GITHUB_APP_TOKEN;

      await runner.run();

      expect(stderr.write).not.toBeCalled();

      expect(scope.isDone()).toBe(true);
    });

    test('custom endpoint', async () => {
      const { runner } = setup();

      const local = nock('https://acot.example/path/to')
        .post('/pr/comment')
        .matchHeader('Authorization', 'Bearer token')
        .reply(200, { ok: true });

      factory({
        config,
        stdout,
        stderr,
        verbose: false,
        options: {
          token: 'token',
          endpoint: 'https://acot.example/path/to',
        },
      })(runner);

      await runner.run();

      expect(stderr.write).not.toBeCalled();

      expect(local.isDone()).toBe(true);
    });
  });

  describe('failure', () => {
    test('invalid PR number', () => {
      (env as any).mockReturnValue({
        isCi: true,
        isPr: true,
        pr: 'invalid pr number',
      });

      const runner = new MockRunner(async () => createSummary());

      factory({
        config,
        stdout,
        stderr,
        verbose: false,
        options: {},
      })(runner);

      expect(stderr.write).toBeCalledWith(
        expect.stringContaining('Invalid PR number'),
      );
    });

    test('without token', () => {
      (env as any).mockReturnValue({
        isCi: true,
        isPr: true,
        pr: 123,
      });

      const runner = new MockRunner(async () => createSummary());

      factory({
        config,
        stdout,
        stderr,
        verbose: false,
        options: {},
      })(runner);

      expect(stderr.write).toBeCalledWith(
        expect.stringContaining('Not found token'),
      );
    });

    test('invalid token error', async () => {
      (env as any).mockReturnValue({
        isCi: true,
        isPr: true,
        pr: 123,
      });

      const runner = new MockRunner(async (emitter) => {
        const summary = createSummary();
        await emitter.emit('audit:complete', [summary]);
        return summary;
      });

      scope
        .post('/pr/comment')
        .matchHeader('Authorization', 'Bearer token')
        .reply(401, {
          ok: false,
        });

      factory({
        config,
        stdout,
        stderr,
        verbose: false,
        options: {
          token: 'token',
        },
      })(runner);

      await runner.run();

      expect(stderr.write).toBeCalledWith(expect.stringContaining('API Error'));
    });
  });
});
