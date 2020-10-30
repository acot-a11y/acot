import type {
  RunnerFactory,
  RunnerFactoryConfig,
  RunnerOptions,
} from '@acot/types';
import { BaseRunner } from './base';
import type { Pipeline } from './pipeline';

export type RunnerFactoryDescriptor<T extends RunnerOptions = {}> = (
  config: RunnerFactoryConfig<T>,
) => Partial<Pipeline>;

export const createRunnerFactory = <T extends RunnerOptions = {}>(
  name: string,
  descriptor: RunnerFactoryDescriptor<T>,
): RunnerFactory<T> => (config) => {
  return new BaseRunner({
    name,
    core: config.core,
    config: config.config,
    pipeline: descriptor(config),
  });
};
