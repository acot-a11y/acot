import type { PartialDeep } from 'type-fest';
import type { DocCode } from '../doc-code';
import { merge } from './merge';

export const createDocCode = (values: PartialDeep<DocCode> = {}): DocCode =>
  merge<DocCode>(
    {
      path: '',
      rule: '',
      summary: {
        markdown: '',
        text: '',
      },
      type: 'correct',
      id: '',
      meta: {},
      html: '',
    },
    values,
  );
