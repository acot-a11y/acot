---
name: 'rule'
description: 'Generate a rule.'
message: 'Please enter the rule name.'
root: '.'
output: '.'
ignore: ['**/*']
---

# `docs/rules/{{ input }}.md`

````markdown
# {{ input }}

**TODO:** Short summary.

**TODO:** Description.

## :white_check_mark: Correct

```html
<!-- TODO -->
```

## :warning: Incorrect

```html
<!-- TODO -->
```
````

# `src/rules/{{ input }}.ts`

```typescript
import { createRule } from '@acot/core';

type Options = {};

export default createRule<Options>({
  meta: {
    recommended: false,
  },

  test: async (context) => {
    // unimplemented...
  },
});
```
