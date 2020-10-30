import type { ReporterFactory, ReporterOptions } from '@acot/types';

export const createReporterFactory = <T extends ReporterOptions = {}>(
  descriptor: ReporterFactory<T>,
): ReporterFactory<T> => descriptor;
