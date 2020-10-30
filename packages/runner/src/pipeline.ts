import type { Summary, TestDescriptor } from '@acot/types';

export type RunSetupResult = void;
export type RunCollectResult = [path: string, descriptor: TestDescriptor][];
export type RunAuditResult = Summary;
export type RunCleanupResult = void;

export type Pipeline = {
  setup: () => Promise<RunSetupResult>;
  collect: () => Promise<RunCollectResult>;
  audit: () => Promise<RunAuditResult>;
  cleanup: () => Promise<RunCleanupResult>;
};
