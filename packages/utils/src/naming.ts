export const pkg2shorthand = (pkg: string, prefix: string): string => {
  const acot = `acot-${prefix}`;

  if (pkg.startsWith('@')) {
    const regex = new RegExp(`^@([^/]+)/${acot}(?:-(.+))?$`, 'u');
    const match = pkg.match(regex);
    if (match) {
      return match[2] != null ? `@${match[1]}/${match[2]}` : `@${match[1]}`;
    }
  } else if (pkg.startsWith(`${acot}-`)) {
    return pkg.replace(`${acot}-`, '');
  }

  return pkg;
};

export const shorthand2pkg = (shorthand: string, prefix: string): string => {
  const acot = `acot-${prefix}`;

  if (shorthand.startsWith('@')) {
    const match = shorthand.match(/^@([^/]+)(?:\/(.+))?$/u);

    if (match) {
      const replacer = new RegExp(`^${acot}-?`);
      const scope = match[1];
      const id = match[2] != null ? match[2].replace(replacer, '') : '';
      return `@${scope}/${acot}${id ? `-${id}` : ''}`;
    }
  }

  return `${acot}-${shorthand.replace(new RegExp(`^${acot}-`), '')}`;
};
