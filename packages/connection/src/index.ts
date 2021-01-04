import execa from 'execa';
import waitOn from 'wait-on';
const debug = require('debug')('acot:connection');

const waitForServer = (url: string, timeout: number) =>
  new Promise<void>((resolve, reject) => {
    if (!url.startsWith('http')) {
      reject(new TypeError('Invalid connection url'));
      return;
    }

    const resource = url.replace(/^(https?)/, '$1-get');

    debug('connection resource: %s', resource);

    waitOn({
      resources: [resource],
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
  private _proc: execa.ExecaChildProcess | null = null;

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
      this._proc = execa.command(command);
      this._proc.stdout!.on('data', (d) => debug(d.toString()));
      this._proc.stderr!.on('data', (d) => debug(d.toString()));
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

  public disconnect(): void {
    if (this._status === 'DISCONNECTED') {
      return;
    }

    if (this._proc == null) {
      debug('disconnect server connection');
      return;
    }

    debug('disconnect server connection... (pid: "%f")', this._proc.pid);
    this._proc.kill();
    this._proc = null;
  }
}
