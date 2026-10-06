import { parseCompleteRevisionProgress, type CompleteRevisionProgress } from './complete-revision-progress';
import { isCalendarDate, type ChecklistItem, type ChecklistSection, type InterviewChecklist, type InterviewRecord, type InterviewStore, type SkillChecklist } from './interviews';
import { isJobApplicationStore, JOB_APPLICATION_PLATFORMS, type JobApplicationDay, type JobApplicationStore } from './job-applications';
import { createProgressBackup, mergeProgressRecords, parseProgressBackup, replaceProgressRecords, type ImportedProgressBackup, type ProgressBackupState } from './progress-transfer';

export interface AppBackupState {
  coding: ProgressBackupState;
  completeRevisionProgress: CompleteRevisionProgress;
  interviews: InterviewStore;
  jobApplications: JobApplicationStore;
}

export interface AppBackup extends AppBackupState {
  version: 2;
  exportedAt: string;
}

export type AppBackupSection = 'coding' | 'completeRevision' | 'interviews' | 'jobApplications';

export interface ParsedAppBackup {
  version: 1 | 2;
  exportedAt?: string;
  sections: AppBackupSection[];
  coding?: ImportedProgressBackup;
  completeRevisionProgress?: CompleteRevisionProgress;
  interviews?: InterviewStore;
  jobApplications?: JobApplicationStore;
}

export function createAppBackup(state: AppBackupState, exportedAt = new Date().toISOString()): AppBackup {
  const codingBackup = createProgressBackup(state.coding, exportedAt);
  const { version: _version, exportedAt: _codingExportedAt, ...coding } = codingBackup;

  return {
    version: 2,
    exportedAt,
    coding,
    completeRevisionProgress: state.completeRevisionProgress,
    interviews: state.interviews,
    jobApplications: state.jobApplications,
  };
}

export function parseAppBackup(serialized: string, problemIds: readonly number[]): ParsedAppBackup | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    return undefined;
  }

  if (!isRecord(parsed) || parsed.version !== 1 && parsed.version !== 2) return undefined;
  if (parsed.exportedAt !== undefined && !isValidDate(parsed.exportedAt)) return undefined;

  if (parsed.version === 2) {
    if (!isValidDate(parsed.exportedAt)) return undefined;

    const coding = parseFullCodingBackup(parsed.coding, parsed.exportedAt, problemIds);
    const completeRevisionProgress = parseCompleteRevisionProgress(parsed.completeRevisionProgress);
    const interviews = isValidInterviewStore(parsed.interviews) ? parsed.interviews : undefined;
    const jobApplications = isJobApplicationStore(parsed.jobApplications) ? parsed.jobApplications : undefined;
    if (!coding || !completeRevisionProgress || !interviews || !jobApplications) return undefined;

    return {
      version: 2,
      exportedAt: parsed.exportedAt,
      sections: ['coding', 'completeRevision', 'interviews', 'jobApplications'],
      coding,
      completeRevisionProgress,
      interviews,
      jobApplications,
    };
  }

  if (isRecord(parsed.progress)) {
    const coding = parseProgressBackup(serialized, problemIds);
    if (!coding) return undefined;
    return { version: 1, exportedAt: coding.exportedAt, sections: ['coding'], coding };
  }

  const interviews = { version: 1, catalog: parsed.catalog, interviews: parsed.interviews };
  if (!isValidInterviewStore(interviews)) return undefined;

  if (parsed.jobApplications !== undefined && !isJobApplicationStore(parsed.jobApplications)) return undefined;

  const sections: AppBackupSection[] = ['interviews'];
  if (parsed.jobApplications !== undefined) sections.push('jobApplications');

  return {
    version: 1,
    exportedAt: parsed.exportedAt as string | undefined,
    sections,
    interviews,
    jobApplications: parsed.jobApplications as JobApplicationStore | undefined,
  };
}

export function mergeInterviewStores(current: InterviewStore, incoming: InterviewStore): InterviewStore {
  return {
    version: 1,
    catalog: mergeById(current.catalog, incoming.catalog),
    interviews: mergeById(current.interviews, incoming.interviews),
  };
}

export function mergeJobApplicationStores(current: JobApplicationStore, incoming: JobApplicationStore): JobApplicationStore {
  const completionByDate = { ...current.completionByDate };

  Object.entries(incoming.completionByDate).forEach(([date, incomingDay]) => {
    const currentDay = completionByDate[date] ?? { android: [], springBoot: [] };
    completionByDate[date] = mergeJobApplicationDay(currentDay, incomingDay);
  });

  return { ...current, completionByDate };
}

export { mergeProgressRecords, replaceProgressRecords };

function parseFullCodingBackup(value: unknown, exportedAt: string, problemIds: readonly number[]): ImportedProgressBackup | undefined {
  if (!isRecord(value)) return undefined;
  const serialized = JSON.stringify({ version: 1, exportedAt, ...value });
  const backup = parseProgressBackup(serialized, problemIds);

  if (!backup || backup.theme === undefined || backup.language === undefined || backup.mode === undefined || backup.selectedProblemId === undefined) return undefined;
  return backup;
}

function mergeJobApplicationDay(current: JobApplicationDay, incoming: JobApplicationDay): JobApplicationDay {
  const mergePlatforms = (first: string[], second: string[]) => (
    JOB_APPLICATION_PLATFORMS.filter((platform) => first.includes(platform) || second.includes(platform))
  );

  return {
    android: mergePlatforms(current.android, incoming.android),
    springBoot: mergePlatforms(current.springBoot, incoming.springBoot),
  };
}

function mergeById<T extends { id: string }>(current: T[], incoming: T[]): T[] {
  const merged = new Map(current.map((item) => [item.id, item]));
  incoming.forEach((item) => merged.set(item.id, item));
  return [...merged.values()];
}

function isValidInterviewStore(value: unknown): value is InterviewStore {
  if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.catalog) || !Array.isArray(value.interviews)) return false;

  const catalog = value.catalog as unknown[];
  const interviews = value.interviews as unknown[];
  return hasUniqueIds(catalog, isSkillChecklist)
    && hasUniqueIds(interviews, isInterviewRecord);
}

function hasUniqueIds<T extends { id: string }>(items: unknown[], isValid: (item: unknown) => item is T): boolean {
  if (!items.every(isValid)) return false;
  const ids = items.map((item) => (item as T).id);
  return new Set(ids).size === ids.length;
}

function isSkillChecklist(value: unknown): value is SkillChecklist {
  return isRecord(value)
    && isNonEmptyString(value.id)
    && typeof value.title === 'string'
    && Array.isArray(value.sections)
    && value.sections.every(isChecklistSection);
}

function isChecklistSection(value: unknown): value is ChecklistSection {
  return isRecord(value)
    && isNonEmptyString(value.id)
    && typeof value.title === 'string'
    && Array.isArray(value.items)
    && value.items.every(isChecklistItem);
}

function isChecklistItem(value: unknown): value is ChecklistItem {
  return isRecord(value)
    && isNonEmptyString(value.id)
    && typeof value.text === 'string'
    && (value.codeTerms === undefined || (Array.isArray(value.codeTerms) && value.codeTerms.every((term) => typeof term === 'string')))
    && (value.priority === undefined || value.priority === 'high' || value.priority === 'low');
}

function isInterviewChecklist(value: unknown): value is InterviewChecklist {
  return isRecord(value)
    && isNonEmptyString(value.checklistId)
    && typeof value.checklistTitle === 'string'
    && Array.isArray(value.sections)
    && value.sections.every(isChecklistSection)
    && Array.isArray(value.completedItemIds)
    && value.completedItemIds.every((id) => typeof id === 'string');
}

function isInterviewRecord(value: unknown): value is InterviewRecord {
  return isRecord(value)
    && isNonEmptyString(value.id)
    && isCalendarDate(value.date as string)
    && typeof value.title === 'string'
    && typeof value.company === 'string'
    && typeof value.notes === 'string'
    && ['scheduled', 'attended', 'not_attended'].includes(value.attendance as string)
    && Array.isArray(value.checklists)
    && value.checklists.every(isInterviewChecklist)
    && isValidDate(value.createdAt);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isValidDate(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && Number.isFinite(Date.parse(value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}