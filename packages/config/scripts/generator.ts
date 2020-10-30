import fs from 'fs';
import path from 'path';
import prettier from 'prettier';
import { paramCase } from 'param-case';
import { parse, printSingleTypeValidator } from 'typescript-json-validator';

const prettierConfig = prettier.resolveConfig.sync(__dirname);

const types = path.resolve(__dirname, '../../types');
const tsconfig = fs.readFileSync(path.resolve(types, 'tsconfig.json'), 'utf8');
const pathname = path.resolve(types, 'src/config.ts');

const result = parse([pathname], tsconfig, {
  ignoreErrors: true,
});

const name = 'Config';

const schema = result.getType(name);
const validator = printSingleTypeValidator(
  name,
  true,
  schema,
  '@acot/types',
  tsconfig,
  {
    allErrors: true,
    coerceTypes: 'array',
    format: 'fast',
    nullable: false,
    unicode: true,
    uniqueItems: true,
    useDefaults: false,
  },
);

const filepath = path.resolve(
  __dirname,
  `../src/validator/${paramCase(name)}.validator.ts`,
);

fs.writeFileSync(
  filepath,
  prettier.format(validator, {
    ...prettierConfig,
    parser: 'typescript',
  }),
  'utf8',
);
