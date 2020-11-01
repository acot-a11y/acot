import cp from 'child_process';
import waitOn from 'wait-on';
const debug = require('debug')('acot:connection');

const spawn = (command: string) => {
  const [cmd, ...args] = command.split(/\s+/);
  const proc = cp.spawn(cmd, args, {
    shell: true,
  });

  proc.stdout.setEncoding('utf8');
  proc.stderr.setEncoding('utf8');

  proc.stdout.on('data', (d) => {
    debug(d.toString().trim());
  });

  proc.stderr.on('data', (d) => {
    debug(d.toString().trim());
  });

  return proc;
};

const waitForServer = (url: string, timeout: number) =>
  new Promise((resolve, reject) => {
    if (!url.startsWith('http')) {
      reject(new TypeError('Invalid connection url'));
      return;
    }

    waitOn({
      resources: [url],
      timeout,
    })
      .then(() => {
        resolve();
      })
      .catch(reject);
  });

export type ConnectionConfig = {
  command?: string;
  timeout: number;
};

export type ConnectionStatus = 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED';

export class Connection {
  private _url: string;
  private _config: ConnectionConfig;
  private _status: ConnectionStatus = 'DISCONNECTED';
  private _proc: cp.ChildProcess | null = null;

  public get status(): ConnectionStatus {
    return this._status;
  }

  public constructor(url: string, config: Partial<ConnectionConfig> = {}) {
    this._url = url;

    this._config = {
      timeout: 1000 * 60,
      ...config,
    };
  }

  public async connect(): Promise<void> {
    const { command, timeout } = this._config;

    this._status = 'CONNECTING';

    if (command != null) {
      debug('server process creating... (execute: "%s")', command);
      this._proc = spawn(command);
      debug('server process created!');
    }

    debug('waiting for server connection...');

    await waitForServer(this._url, timeout);

    if (command != null) {
      debug('server started!');
    } else {
      debug('found server');
    }

    this._status = 'CONNECTED';
  }

  public async disconnect(): Promise<void> {
    if (this._proc == null) {
      return;
    }

    try {
      debug('disconnect server connection... (pid: "%f")', this._proc.pid);

      const result = this._proc.kill('SIGKILL');

      debug('kill=%s', result);
    } catch (e) {
      debug(e);
    }

    this._proc = null;
    this._status = 'DISCONNECTED';
  }
}
