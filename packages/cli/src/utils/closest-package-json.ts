import fs from 'fs';
import pkgup from 'pkg-up';
import type { PackageJson } from 'type-fest';

export const closestPackageJson = (cwd: string): PackageJson | null => {
  const filepath = pkgup.sync({ cwd });
  if (filepath == null) {
    return null;
  }

  const json = fs.readFileSync(filepath, 'utf8');

  return JSON.parse(json);
};
