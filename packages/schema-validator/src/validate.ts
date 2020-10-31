import { validate as validateSchema } from 'schema-utils';
import type { Schema } from './types';

export type ValidateConfig = {
  name: string;
  base: string;
};

export const validate = <T = unknown>(
  schema: Schema,
  input: unknown,
  config: ValidateConfig,
): input is T => {
  validateSchema(schema, input as any, {
    name: config.name,
    baseDataPath: config.base,
  });

  return true;
};
