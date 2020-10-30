# @acot/schema-validator

> A simple wrapper module for [schema-utils](https://github.com/webpack/schema-utils).

## Installation

Install via npm:

```bash
$ npm install --save @acot/schema-validator
```

## Usage

_T.B.A_

```typescript
import { validate } from '@acot/schema-validator';

type User = {
  id: string;
  name: string;
  age: string;
};

const user = {
  id: 'akfgayq12ugb',
  name: 'Iron Man',
  age: 55,
};

validate<User>(
  {
    properties: {
      id: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      age: {
        type: 'integer',
      },
    },
    additionalProperties: false,
  },
  user,
  {
    name: 'User',
    base: 'options',
  },
);
```
