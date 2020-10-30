export class PluginLoadError extends ReferenceError {
  public name = 'PluginLoadError';
  public plugins: string[];

  public constructor(plugins: string[]) {
    super('Plugin failed to load');
    this.plugins = plugins;
    Error.captureStackTrace(this, this.constructor);
  }
}
