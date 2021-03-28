/**
 * Hard inspired by the following projects:
 *
 * @see https://github.com/reg-viz/storycap/blob/master/packages/storycrawler/src/find-chrome.ts
 * @see https://github.com/GoogleChromeLabs/carlo/blob/master/lib/find_chrome.js
 */
import fs from 'fs';
import path from 'path';
import { execSync, execFileSync } from 'child_process';

const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;

const uniq = <T>(arr: T[]): T[] => {
  return Array.from(new Set(arr));
};

const canAccess = (file: string) => {
  if (!file) {
    return false;
  }

  try {
    fs.accessSync(file);
    return true;
  } catch (e) {
    return false;
  }
};

const sort = (
  installations: string[],
  priorities: { regex: RegExp; weight: number }[],
) => {
  const defaultPriority = 10;

  return (
    installations
      // assign priorities
      .map((inst) => {
        for (const pair of priorities) {
          if (pair.regex.test(inst)) {
            return { path: inst, weight: pair.weight };
          }
        }
        return { path: inst, weight: defaultPriority };
      })
      // sort based on priorities
      .sort((a, b) => b.weight - a.weight)
      // remove priority flag
      .map((pair) => pair.path)
  );
};

const findChromeExecutables = (folder: string) => {
  const argumentsRegex = /(^[^ ]+).*/; // Take everything up to the first space
  const chromeExecRegex = '^Exec=/.*/(google-chrome|chrome|chromium)-.*';
  const installations: string[] = [];

  if (canAccess(folder)) {
    // Output of the grep & print looks like:
    //    /opt/google/chrome/google-chrome --profile-directory
    //    /home/user/Downloads/chrome-linux/chrome-wrapper %U
    let execPaths;

    // Some systems do not support grep -R so fallback to -r.
    // See https://github.com/GoogleChrome/chrome-launcher/issues/46 for more context.
    try {
      execPaths = execSync(
        `grep -ER "${chromeExecRegex}" ${folder} | awk -F '=' '{print $2}'`,
      );
    } catch (e) {
      execPaths = execSync(
        `grep -Er "${chromeExecRegex}" ${folder} | awk -F '=' '{print $2}'`,
      );
    }

    execPaths = execPaths
      .toString()
      .split(NEWLINE)
      .map((execPath) => execPath.replace(argumentsRegex, '$1'));

    execPaths.forEach(
      (execPath) => canAccess(execPath) && installations.push(execPath),
    );
  }

  return installations;
};

const localPuppeteer = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const puppeteer = require('puppeteer') as import('puppeteer').PuppeteerNode;
    return puppeteer.executablePath();
  } catch (e) {
    return;
  }
};

const darwin = (canary: boolean) => {
  const LSREGISTER =
    '/System/Library/Frameworks/CoreServices.framework' +
    '/Versions/A/Frameworks/LaunchServices.framework' +
    '/Versions/A/Support/lsregister';

  const grepexpr = canary ? 'google chrome canary' : 'google chrome';
  const result = execSync(
    `${LSREGISTER} -dump  | grep -i '${grepexpr}\\?.app$' | awk '{$1=""; print $0}'`,
  );

  const paths = result
    .toString()
    .split(NEWLINE)
    .filter((a) => a)
    .map((a) => a.trim());

  paths.unshift(
    canary
      ? '/Applications/Google Chrome Canary.app'
      : '/Applications/Google Chrome.app',
  );

  for (const p of paths) {
    if (p.startsWith('/Volumes')) {
      continue;
    }

    const inst = path.join(
      p,
      canary
        ? '/Contents/MacOS/Google Chrome Canary'
        : '/Contents/MacOS/Google Chrome',
    );

    if (canAccess(inst)) {
      return inst;
    }
  }

  return;
};

/**
 * Look for linux executables in 3 ways
 * 1. Look into CHROME_PATH env variable
 * 2. Look into the directories where .desktop are saved on gnome based distro's
 * 3. Look for google-chrome-stable & google-chrome executables by using the which command
 */
const linux = () => {
  let installations: string[] = [];

  // Look into the directories where .desktop are saved on gnome based distro's
  const desktopInstallationFolders = [
    path.join(require('os').homedir(), '.local/share/applications/'),
    '/usr/share/applications/',
  ];

  desktopInstallationFolders.forEach((folder) => {
    installations = installations.concat(findChromeExecutables(folder));
  });

  // Look for google-chrome(-stable) & chromium(-browser) executables by using the which command
  const executables = [
    'google-chrome-stable',
    'google-chrome',
    'chromium-browser',
    'chromium',
  ];

  executables.forEach((executable) => {
    try {
      const chromePath = execFileSync('which', [executable], { stdio: 'pipe' })
        .toString()
        .split(NEWLINE)[0];

      if (canAccess(chromePath)) {
        installations.push(chromePath);
      }
    } catch (e) {
      // Not installed.
    }
  });

  if (!installations.length) {
    throw new Error(
      'The environment variable CHROME_PATH must be set to executable of a build of Chromium version 54.0 or later.',
    );
  }

  const priorities = [
    { regex: /chrome-wrapper$/, weight: 51 },
    { regex: /google-chrome-stable$/, weight: 50 },
    { regex: /google-chrome$/, weight: 49 },
    { regex: /chromium-browser$/, weight: 48 },
    { regex: /chromium$/, weight: 47 },
  ];

  if (process.env.CHROME_PATH) {
    priorities.unshift({
      regex: new RegExp(`${process.env.CHROME_PATH}`),
      weight: 101,
    });
  }

  return sort(uniq(installations.filter(Boolean)), priorities)[0];
};

const win32 = (canary: boolean) => {
  const suffix = canary
    ? `${path.sep}Google${path.sep}Chrome SxS${path.sep}Application${path.sep}chrome.exe`
    : `${path.sep}Google${path.sep}Chrome${path.sep}Application${path.sep}chrome.exe`;

  const prefixes = [
    process.env.LOCALAPPDATA,
    process.env.PROGRAMFILES,
    process.env['PROGRAMFILES(X86)'],
  ].filter(Boolean);

  let result;

  prefixes.forEach((prefix) => {
    const chromePath = path.join(prefix!, suffix);
    if (canAccess(chromePath)) {
      result = chromePath;
    }
  });

  return result;
};

export type ChromeChannel = 'puppeteer' | 'canary' | 'stable' | '*';
export type ChromeType = 'puppeteer' | 'canary' | 'stable' | 'user';

export type FindChromeOptions = {
  executablePath?: string;
  channel?: ChromeChannel;
};

export type FindChromeResult = {
  executablePath: string;
  type: ChromeType;
};

export const findChrome = async (
  options: FindChromeOptions = {},
): Promise<FindChromeResult | null> => {
  if (options.executablePath) {
    return {
      executablePath: options.executablePath,
      type: 'user',
    };
  }

  const config = new Set<ChromeChannel>(
    options.channel ? [options.channel] : ['*'],
  );

  let executablePath: string | undefined;

  if (config.has('puppeteer') || config.has('*')) {
    executablePath = localPuppeteer();
    if (executablePath) {
      return {
        type: 'puppeteer',
        executablePath,
      };
    }
  }

  if (config.has('canary') || config.has('*')) {
    switch (process.platform) {
      case 'linux':
        executablePath = linux();
        break;
      case 'win32':
        executablePath = win32(true);
        break;
      case 'darwin':
        executablePath = darwin(true);
        break;
      default:
        break;
    }

    if (executablePath) {
      return {
        type: 'canary',
        executablePath,
      };
    }
  }

  if (config.has('stable') || config.has('*')) {
    switch (process.platform) {
      case 'linux':
        executablePath = linux();
        break;
      case 'win32':
        executablePath = win32(false);
        break;
      case 'darwin':
        executablePath = darwin(false);
        break;
      default:
        break;
    }

    if (executablePath) {
      return {
        type: 'stable',
        executablePath,
      };
    }
  }

  return null;
};
