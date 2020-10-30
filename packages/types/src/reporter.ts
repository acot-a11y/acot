import type { ReporterOptions, ResolvedConfig } from './config';
import type { Runner } from './runner';

export type Reporter = (runner: Runner) => void;

export type ReporterFactoryConfig<T> = {
  config: ResolvedConfig;
  stdout: NodeJS.WritableStream;
  stderr: NodeJS.WritableStream;
  verbose: boolean;
  options: T;
};

export type ReporterFactory<T extends ReporterOptions = {}> = (
  config: ReporterFactoryConfig<T>,
) => Reporter;
