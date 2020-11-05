export class PresetLoadError extends ReferenceError {
  public name = 'PresetLoadError';
  public presets: string[];

  public constructor(presets: string[]) {
    super('Preset failed to load');
    this.presets = presets;
    Error.captureStackTrace(this, this.constructor);
  }
}
