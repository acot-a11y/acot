import path from 'path';
import { PresetLoader, PresetLoadError } from '@acot/core';
import { RunnerLoader } from '@acot/runner';
import { ReporterLoader } from '@acot/reporter';
import { ModuleLoader } from '@acot/module-loader';
import type {
  ConfigEntry,
  NormalizedRuleConfig,
  Preset,
  ReporterUses,
  ResolvedConfig,
  ResolvedConfigEntry,
  ResolvedReporterUses,
  ResolvedRunnerUses,
  RuleConfig,
  RunnerUses,
} from '@acot/types';
import { parseViewport } from '@acot/utils';
import resolveFrom from 'resolve-from';
import { explorer } from './explorer';
import { debug } from './logging';
import { parseExtendPath } from './parse-extend-path';
import { validateConfig } from './validator';
import { mergeConfig } from './merger';

const loadConfigModule = async (
  name: string,
  cwd: string,
): Promise<unknown> => {
  const loader = new ModuleLoader<unknown>('config', { from: cwd });

  try {
    return loader.load(name);
  } catch (e) {
    debug('load config module failed: ', e);
  }

  try {
    const result = await explorer.load(path.resolve(cwd, name));
    return result!.config;
  } catch (e) {
    debug('load config module failed: ', e);
  }

  throw new ReferenceError(`"${name}" config does not found`);
};

const loadReporter = (
  config: ReporterUses,
  cwd: string,
): ResolvedReporterUses => {
  const loader = new ReporterLoader(cwd);
  const reporter = loader.load(config.uses);

  return {
    uses: reporter,
    with: config.with,
  };
};

const loadRunner = (config: RunnerUses, cwd: string): ResolvedRunnerUses => {
  const loader = new RunnerLoader(cwd);
  const runner = loader.load(config.uses);

  return {
    uses: runner,
    with: config.with,
  };
};

const normalizeRuleConfig = (rules: RuleConfig): NormalizedRuleConfig => {
  return Object.entries(rules).reduce<NormalizedRuleConfig>(
    (acc, [id, options]) => {
      acc[id] = typeof options === 'string' ? [options, null] : options;
      return acc;
    },
    {},
  );
};

export type ResolveConfigOptions = {
  cwd: string;
};

export const resolveConfig = async (
  maybeConfig: unknown,
  options: Partial<ResolveConfigOptions> = {},
): Promise<ResolvedConfig> => {
  const opts: ResolveConfigOptions = {
    cwd: options.cwd ?? process.cwd(),
  };

  const failurePresets: string[] = [];

  const loadPresets = (list: string[], cwd: string): Preset[] => {
    const loader = new PresetLoader(cwd);
    const presets: Preset[] = [];

    for (const name of list) {
      try {
        const preset = loader.load(name);
        presets.push(preset);
      } catch (e) {
        failurePresets.push(name);
        debug('preset load error: ', e);
      }
    }

    return presets;
  };

  const loadConfigEntries = async (
    sources: ConfigEntry[],
    cwd: string,
  ): Promise<ResolvedConfigEntry[]> => {
    return await Promise.all(
      sources.map(async ({ presets, ...entry }) => {
        let next: ResolvedConfigEntry = {
          ...entry,
          rules: normalizeRuleConfig(entry.rules ?? {}),
        };

        if (presets != null) {
          next.presets = loadPresets(presets, cwd);
        }

        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        const configs = await loadExternalConfig(next.extends ?? [], cwd);

        next = mergeConfig<ResolvedConfigEntry>(...configs, next);

        delete next.extends;

        return next;
      }),
    );
  };

  const loadExternalConfig = async (
    list: string[],
    cwd: string,
  ): Promise<ResolvedConfig[]> => {
    return await Promise.all(
      list.map(async (name) => {
        const extend = parseExtendPath(name);

        debug('parsed the configuration name "%s": %O', name, extend);

        const cleanup = (config: ResolvedConfig) => {
          const cfg = config as any;
          delete cfg.origin;
          delete cfg.runner;
          delete cfg.overrides;
          return config;
        };

        /* eslint-disable @typescript-eslint/no-use-before-define */
        switch (extend.resource) {
          case 'file': {
            const module = await loadConfigModule(extend.id, cwd);
            const result = await load(module, cwd);
            return cleanup(result);
          }
          case 'config': {
            const base = path.dirname(resolveFrom(cwd, extend.id));
            const module = await loadConfigModule(extend.id, base);
            const result = await load(module, base);
            return cleanup(result);
          }
          case 'preset': {
            const base = path.dirname(resolveFrom(cwd, extend.id));
            const preset = new PresetLoader(base).load(extend.id);
            const result = await load(preset.configs.get(extend.name!), base);
            return cleanup(result);
          }
        }
        /* eslint-enable @typescript-eslint/no-use-before-define */
      }),
    );
  };

  const load = async (
    maybeConfig: unknown,
    cwd: string,
  ): Promise<ResolvedConfig> => {
    const config = validateConfig(maybeConfig);

    debug('valid config: %O', config);

    const { runner, reporter, presets, overrides, viewport, ...rest } = config;
    let resolved: ResolvedConfig = {
      ...rest,
      rules: normalizeRuleConfig(config.rules ?? {}),
    };

    if (runner != null) {
      resolved.runner = loadRunner(
        typeof runner === 'string' ? { uses: runner, with: {} } : runner,
        cwd,
      );
    }

    if (reporter != null) {
      resolved.reporter = loadReporter(
        typeof reporter === 'string' ? { uses: reporter, with: {} } : reporter,
        cwd,
      );
    }

    if (presets != null) {
      resolved.presets = loadPresets(presets, cwd);
    }

    if (overrides != null) {
      resolved.overrides = await loadConfigEntries(overrides, cwd);
    }

    if (viewport != null) {
      resolved.viewport = parseViewport(viewport);
    }

    if (resolved.extends != null) {
      const results = await loadExternalConfig(resolved.extends, cwd);
      resolved = mergeConfig<ResolvedConfig>(...results, resolved);
      delete resolved.extends;
    }

    return resolved;
  };

  const config = load(maybeConfig, opts.cwd);

  if (failurePresets.length > 0) {
    throw new PresetLoadError(failurePresets);
  }

  debug('loaded config: %O', config);

  return config;
};
