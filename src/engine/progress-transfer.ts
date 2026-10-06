import { normalizeProblemImportanceEntry, type ProblemImportance } from './problem-importance';

export type BackupTheme = 'dark' | 'light' | 'system';
export type BackupLanguage = 'kotlin' | 'java';
export type BackupMode = 'learning' | 'practice';
export type TransferProgressRecord = Record<string, unknown> & {
  importance?: ProblemImportance | null;
  important?: boolean;
};

export interface ProgressBackupState {
  progress: Record<number, TransferProgressRecord>;
  drafts: Record<number, string>;
  theme: BackupTheme;
  language: BackupLanguage;
  selectedProblemId: number;
  mode: BackupMode;
}

export interface ProgressBackup extends ProgressBackupState {
  version: 1;
  exportedAt: string;
}

export type ImportedProgressBackup = Omit<ProgressBackup, 'exportedAt' | 'theme' | 'language' | 'selectedProblemId' | 'mode'> & {
  exportedAt?: string;
  theme?: BackupTheme;
  language?: BackupLanguage;
  selectedProblemId?: number;
  mode?: BackupMode;
};

const validStatuses = new Set(['not_started', 'learning', 'practicing', 'strong', 'mastered']);
const nonNegativeIntegerFields = ['attempts', 'successfulAttempts', 'failedAttempts', 'hintsUsed'];
const nonNegativeNumberFields = ['totalTimeSeconds'];
const validDateFields = ['lastAttemptedAt', 'nextReviewAt'];

export function createProgressBackup(state: ProgressBackupState, exportedAt = new Date().toISOString()): ProgressBackup {
  const progress = Object.fromEntries(Object.entries(state.progress).map(([id, entry]) => {
    const { important: _legacyImportant, ...currentEntry } = entry;
    return [id, { ...currentEntry, importance: entry.importance ?? null }];
  }));

  return {
    version: 1,
    exportedAt,
    ...state,
    progress,
  };
}

export function parseProgressBackup(serialized: string, problemIds: readonly number[]): ImportedProgressBackup | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    return undefined;
  }

  if (!isRecord(parsed) || parsed.version !== 1 || !isRecord(parsed.progress)) return undefined;

  const validProblemIds = new Set(problemIds);
  if (!Object.entries(parsed.progress).every(([id, entry]) => (
    isKnownProblemId(id, validProblemIds) && isValidProgressRecord(entry)
  ))) return undefined;

  const drafts = parsed.drafts === undefined ? {} : parsed.drafts;
  if (!isRecord(drafts) || !Object.entries(drafts).every(([id, draft]) => (
    isKnownProblemId(id, validProblemIds) && typeof draft === 'string'
  ))) return undefined;

  if (parsed.exportedAt !== undefined && !isValidDate(parsed.exportedAt)) return undefined;
  if (parsed.theme !== undefined && !['dark', 'light', 'system'].includes(parsed.theme as string)) return undefined;
  if (parsed.language !== undefined && parsed.language !== 'kotlin' && parsed.language !== 'java') return undefined;
  if (parsed.mode !== undefined && parsed.mode !== 'learning' && parsed.mode !== 'practice') return undefined;
  if (parsed.selectedProblemId !== undefined && (
    !Number.isInteger(parsed.selectedProblemId) || !validProblemIds.has(parsed.selectedProblemId as number)
  )) return undefined;

  return {
    version: 1,
    exportedAt: parsed.exportedAt as string | undefined,
    progress: parsed.progress as Record<number, TransferProgressRecord>,
    drafts: drafts as Record<number, string>,
    theme: parsed.theme as BackupTheme | undefined,
    language: parsed.language as BackupLanguage | undefined,
    selectedProblemId: parsed.selectedProblemId as number | undefined,
    mode: parsed.mode as BackupMode | undefined,
  };
}

export function mergeProgressRecords<T extends object>(
  current: Record<number, T>,
  incoming: Record<number, TransferProgressRecord>,
): Record<number, T> {
  const merged = { ...current };

  Object.entries(incoming).forEach(([id, entry]) => {
    const normalized = normalizeProblemImportanceEntry(entry);
    const nextEntry = { ...merged[Number(id)], ...normalized } as T & TransferProgressRecord;

    if (!Object.prototype.hasOwnProperty.call(entry, 'importance') && entry.important === undefined) {
      const currentImportance = (merged[Number(id)] as TransferProgressRecord | undefined)?.importance;
      if (currentImportance === undefined) delete nextEntry.importance;
      else nextEntry.importance = currentImportance;
    }

    merged[Number(id)] = nextEntry as T;
  });

  return merged;
}

export function replaceProgressRecords<T extends object>(
  defaults: Record<number, T>,
  incoming: Record<number, TransferProgressRecord>,
): Record<number, T> {
  const replaced = { ...defaults };

  Object.entries(incoming).forEach(([id, entry]) => {
    replaced[Number(id)] = {
      ...replaced[Number(id)],
      ...normalizeProblemImportanceEntry(entry),
    } as T;
  });

  return replaced;
}

function isKnownProblemId(id: string, validProblemIds: Set<number>): boolean {
  const numericId = Number(id);
  return /^\d+$/.test(id) && Number.isInteger(numericId) && validProblemIds.has(numericId);
}

function isValidProgressRecord(value: unknown): value is TransferProgressRecord {
  if (!isRecord(value)) return false;
  if (value.status !== undefined && (typeof value.status !== 'string' || !validStatuses.has(value.status))) return false;
  if (nonNegativeIntegerFields.some((field) => value[field] !== undefined && (
    typeof value[field] !== 'number' || !Number.isSafeInteger(value[field]) || value[field] < 0
  ))) return false;
  if (nonNegativeNumberFields.some((field) => value[field] !== undefined && (
    typeof value[field] !== 'number' || !Number.isFinite(value[field]) || value[field] < 0
  ))) return false;
  if (value.confidence !== undefined && (
    typeof value.confidence !== 'number' || !Number.isFinite(value.confidence) || value.confidence < 1 || value.confidence > 5
  )) return false;
  if (value.reviewIntervalDays !== undefined && (
    typeof value.reviewIntervalDays !== 'number' || !Number.isFinite(value.reviewIntervalDays) || value.reviewIntervalDays < 1
  )) return false;
  if (value.importance !== undefined && value.importance !== null && (
    typeof value.importance !== 'number' || !Number.isInteger(value.importance) || value.importance < 1 || value.importance > 5
  )) return false;
  if (value.important !== undefined && typeof value.important !== 'boolean') return false;
  if (['solutionViewed', 'bookmarked'].some((field) => value[field] !== undefined && typeof value[field] !== 'boolean')) return false;
  if (value.notes !== undefined && typeof value.notes !== 'string') return false;
  return validDateFields.every((field) => value[field] === undefined || value[field] === null || isValidDate(value[field]));
}

function isValidDate(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && Number.isFinite(Date.parse(value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}