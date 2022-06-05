---
name: 'rule'
root: '.'
output: '.'
questions:
  name: 'Please enter the rule name.'
---

# Variables

- name: `{{ inputs.name | kebab }}`

# `docs/rules/{{ name }}.md`

````markdown
# {{ name }}

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

# `src/rules/{{ name }}.ts`

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
