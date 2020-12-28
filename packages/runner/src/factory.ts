import type { RunnerOptions, RunnerFactory } from '@acot/types';

export const createRunnerFactory = <T extends RunnerOptions = {}>(
  descriptor: RunnerFactory<T>,
): RunnerFactory<T> => descriptor;
