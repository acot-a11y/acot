export type DocCodeType = 'correct' | 'incorrect';

export type DocCodeMeta = {
  'acot-ignore'?: boolean;
  'acot-head'?: boolean;
  'acot-template'?: string;
  [key: string]: string | number | boolean | null | undefined;
};

export type DocCodeSummary = {
  markdown: string;
  text: string;
};

export type DocCode = {
  path: string;
  rule: string;
  summary: DocCodeSummary;
  type: DocCodeType;
  id: string;
  meta: DocCodeMeta;
  html: string;
};

const reservedMetaKeys = ['acot-ignore', 'acot-head', 'acot-template'] as const;

export const extractCodeMeta = (
  code: DocCode,
): Omit<DocCodeMeta, typeof reservedMetaKeys[number]> => {
  return Object.entries(code.meta).reduce<DocCodeMeta>((acc, [key, value]) => {
    if (!reservedMetaKeys.includes(key as any)) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

export const generateDocPath = ({ rule, id }: DocCode): string =>
  `/${rule}/${id}`;

export const generateDocUrl = (port: number, code: DocCode): string =>
  `http://localhost:${port}${generateDocPath(code)}`;
