export type CompleteRevisionQuestionProgress = {
  status?: 'learning' | 'mastered';
  bookmarked?: boolean;
};

export type CompleteRevisionProgress = Record<string, CompleteRevisionQuestionProgress>;

export const COMPLETE_REVISION_PROGRESS_KEY = 'kotlin-interview-trainer-question-bank-progress-v1';

export function parseCompleteRevisionProgress(value: unknown): CompleteRevisionProgress | undefined {
  if (!isRecord(value)) return undefined;

  const entries = Object.entries(value);
  if (!entries.every(([questionId, progress]) => (
    questionId.length > 0
    && isRecord(progress)
    && (progress.status === undefined || progress.status === 'learning' || progress.status === 'mastered')
    && (progress.bookmarked === undefined || typeof progress.bookmarked === 'boolean')
  ))) return undefined;

  return value as CompleteRevisionProgress;
}

export function loadCompleteRevisionProgress(storage: Pick<Storage, 'getItem'>): CompleteRevisionProgress {
  const stored = storage.getItem(COMPLETE_REVISION_PROGRESS_KEY);
  if (!stored) return {};

  try {
    return parseCompleteRevisionProgress(JSON.parse(stored)) ?? {};
  } catch {
    return {};
  }
}

export function saveCompleteRevisionProgress(
  storage: Pick<Storage, 'setItem'>,
  progress: CompleteRevisionProgress,
): void {
  storage.setItem(COMPLETE_REVISION_PROGRESS_KEY, JSON.stringify(progress));
}

export function mergeCompleteRevisionProgress(
  current: CompleteRevisionProgress,
  incoming: CompleteRevisionProgress,
): CompleteRevisionProgress {
  return Object.fromEntries(Object.entries({ ...current, ...incoming }).map(([questionId, progress]) => [
    questionId,
    { ...current[questionId], ...progress },
  ]));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}