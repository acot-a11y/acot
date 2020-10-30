import path from 'path';

const regex = /^\.{1,2}[/\\]/u;

export const isFilepath = (nameOrPath: string): boolean => {
  return (
    regex.test(nameOrPath) ||
    path.parse(nameOrPath).ext !== '' ||
    path.isAbsolute(nameOrPath)
  );
};
