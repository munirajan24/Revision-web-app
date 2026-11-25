import type { MobileInterviewQuestionStats } from './mobile-interview';

export const LEARN_PROGRESS_STORAGE_KEY = 'kotlin-interview-trainer-mobile-learn-progress-v1';
export const LEARN_PASS_PERCENT = 100;
export const LEARN_STAGE_SIZES = [3, 5, 10] as const;

export interface LearnQuestionProgress {
  learned: boolean;
  needReview: boolean;
  learnedAt?: number;
  skippedLearn?: boolean;
  important?: boolean;
}

export interface LearnQuizSummary {
  sessionId: string;
  correct: number;
  total: number;
  finishedAt: number;
}

export interface LearnTrackProgress {
  id: string;
  setIds: string[];
  sectionIds: string[];
  stageSize: number;
  lastOpenedStageId?: string;
  lastOpenedAt: number;
  questions: Record<string, LearnQuestionProgress>;
  stageQuizzes: Record<string, LearnQuizSummary>;
}

export interface LearnProgress {
  version: 1;
  tracks: LearnTrackProgress[];
}

export interface LearnStage {
  id: string;
  ordinal: number;
  questions: string[];
  mistakes: boolean;
}

export type LearnStageStatus = 'not-started' | 'learning' | 'ready' | 'quizzed' | 'mastered';
export type LearnQuestionOutcome = 'correct' | 'incorrect' | 'skipped';

export function emptyLearnProgress(): LearnProgress {
  return { version: 1, tracks: [] };
}

export function createLearnTrackId(setIds: readonly string[], sectionIds: readonly string[]): string {
  return `learn:${hash(`${[...setIds].sort().join('|')}:${[...sectionIds].sort().join('|')}`)}`;
}

export function createLearnTrack(
  setIds: readonly string[],
  sectionIds: readonly string[],
  stageSize: number,
  now = Date.now(),
): LearnTrackProgress {
  if (!isLearnStageSize(stageSize)) throw new Error('Stage size must be 3, 5, or 10.');
  return {
    id: createLearnTrackId(setIds, sectionIds),
    setIds: [...setIds],
    sectionIds: [...sectionIds],
    stageSize,
    lastOpenedAt: now,
    questions: {},
    stageQuizzes: {},
  };
}

export function getLearnStages(track: LearnTrackProgress, orderedQuestionIds: readonly string[]): LearnStage[] {
  const stages: LearnStage[] = [];
  for (let offset = 0; offset < orderedQuestionIds.length; offset += track.stageSize) {
    const ordinal = stages.length + 1;
    stages.push({
      id: getLearnStageId(track.id, track.stageSize, ordinal),
      ordinal,
      questions: orderedQuestionIds.slice(offset, offset + track.stageSize),
      mistakes: false,
    });
  }
  return stages;
}

export function getMistakeStages(
  track: LearnTrackProgress,
  orderedQuestionIds: readonly string[],
  stats: Record<string, MobileInterviewQuestionStats>,
  latestResults?: Record<string, LearnQuestionOutcome>,
): LearnStage[] {
  const mistakeIds = orderedQuestionIds.filter((id) => (
    Boolean(track.questions[id]?.needReview)
    || (latestResults?.[id]
      ? latestResults[id] === 'incorrect' || latestResults[id] === 'skipped'
      : (stats[id]?.wrong ?? 0) > 0 || (stats[id]?.skipped ?? 0) > 0)
  ));
  return chunkMistakes(track, mistakeIds);
}

export function getLearnStageId(trackId: string, stageSize: number, ordinal: number): string {
  return `${trackId}:size-${stageSize}:stage-${ordinal}`;
}

export function getLearnStageStatus(
  stage: LearnStage,
  track: LearnTrackProgress,
  stats: Record<string, MobileInterviewQuestionStats>,
  latestResults?: Record<string, LearnQuestionOutcome>,
): LearnStageStatus {
  if (stage.questions.length === 0) return 'not-started';
  const questions = stage.questions.map((id) => track.questions[id]);
  const correctCount = stage.questions.filter((id) => latestResults?.[id]
    ? latestResults[id] === 'correct'
    : (stats[id]?.correct ?? 0) > 0).length;
  if (correctCount === stage.questions.length
    && correctCount / stage.questions.length * 100 >= LEARN_PASS_PERCENT) return 'mastered';

  const quiz = track.stageQuizzes[stage.id];
  if (quiz) return 'quizzed';
  const learnedCount = questions.filter((question) => question?.learned || question?.skippedLearn).length;
  if (learnedCount === stage.questions.length) return 'ready';
  if (learnedCount > 0) return 'learning';
  const attendedCount = stage.questions.filter((id) => (stats[id]?.attended ?? 0) > 0).length;
  return attendedCount > 0 ? 'learning' : 'not-started';
}

export function getContinueStage(
  stages: readonly LearnStage[],
  track: LearnTrackProgress,
  stats: Record<string, MobileInterviewQuestionStats>,
  latestResults?: Record<string, LearnQuestionOutcome>,
): LearnStage | undefined {
  if (stages.length === 0) return undefined;
  const lastIndex = stages.findIndex((stage) => stage.id === track.lastOpenedStageId);
  const ordered = lastIndex < 0
    ? [...stages]
    : [...stages.slice(lastIndex), ...stages.slice(0, lastIndex)];
  return ordered.find((stage) => getLearnStageStatus(stage, track, stats, latestResults) !== 'mastered');
}

export function getQuizQuestionIds(
  stage: LearnStage,
  stats: Record<string, MobileInterviewQuestionStats>,
  includeAlreadyCorrect = false,
  latestResults?: Record<string, LearnQuestionOutcome>,
): string[] {
  return stage.questions.filter((id) => includeAlreadyCorrect
    || (latestResults?.[id] ? latestResults[id] !== 'correct' : (stats[id]?.correct ?? 0) === 0));
}

export function markLearnQuestion(
  track: LearnTrackProgress,
  questionId: string,
  action: 'learned' | 'need-review' | 'skip',
  now = Date.now(),
): LearnTrackProgress {
  const current = track.questions[questionId] ?? { learned: false, needReview: false };
  const next = action === 'learned'
    ? { ...current, learned: true, needReview: false, skippedLearn: false, learnedAt: current.learnedAt ?? now }
    : action === 'need-review'
      ? { learned: false, needReview: true, skippedLearn: false, important: current.important }
      : current;
  if (action === 'skip') return track;
  return { ...track, questions: { ...track.questions, [questionId]: next } };
}

export function markLearnStageKnown(track: LearnTrackProgress, stage: LearnStage, now = Date.now()): LearnTrackProgress {
  const questions = { ...track.questions };
  stage.questions.forEach((id) => {
    const current = questions[id];
    questions[id] = {
      learned: true,
      needReview: false,
      skippedLearn: false,
      important: current?.important,
      learnedAt: current?.learnedAt ?? now,
    };
  });
  return { ...track, questions };
}

export function skipLearnStage(track: LearnTrackProgress, stage: LearnStage): LearnTrackProgress {
  const questions = { ...track.questions };
  stage.questions.forEach((id) => {
    const current = questions[id] ?? { learned: false, needReview: false };
    questions[id] = { ...current, skippedLearn: true };
  });
  return { ...track, questions };
}

export function resetLearnStage(track: LearnTrackProgress, stage: LearnStage): LearnTrackProgress {
  const questions = { ...track.questions };
  stage.questions.forEach((id) => { delete questions[id]; });
  const stageQuizzes = { ...track.stageQuizzes };
  delete stageQuizzes[stage.id];
  return { ...track, questions, stageQuizzes };
}

export function recordLearnQuizSummary(
  progress: LearnProgress,
  trackId: string,
  stageId: string,
  summary: LearnQuizSummary,
): LearnProgress {
  let changed = false;
  const tracks = progress.tracks.map((track) => {
    if (track.id !== trackId || Object.values(track.stageQuizzes).some((entry) => entry.sessionId === summary.sessionId)) return track;
    const previous = track.stageQuizzes[stageId];
    if (previous && (previous.sessionId === summary.sessionId || previous.finishedAt >= summary.finishedAt)) return track;
    changed = true;
    return { ...track, stageQuizzes: { ...track.stageQuizzes, [stageId]: summary } };
  });
  return changed ? { ...progress, tracks } : progress;
}

export function mergeLearnProgress(current: LearnProgress, incoming: LearnProgress): LearnProgress {
  const byId = new Map(current.tracks.map((track) => [track.id, track]));
  incoming.tracks.forEach((incomingTrack) => {
    const existing = byId.get(incomingTrack.id);
    if (!existing) {
      byId.set(incomingTrack.id, incomingTrack);
      return;
    }
    const questions = { ...existing.questions };
    Object.entries(incomingTrack.questions).forEach(([id, incomingQuestion]) => {
      const previous = questions[id];
      questions[id] = {
        learned: Boolean(previous?.learned || incomingQuestion.learned),
        needReview: !(previous?.learned || incomingQuestion.learned)
          && Boolean(previous?.needReview || incomingQuestion.needReview),
        skippedLearn: !(previous?.learned || incomingQuestion.learned)
          && Boolean(previous?.skippedLearn || incomingQuestion.skippedLearn),
        important: Boolean(previous?.important || incomingQuestion.important),
        ...((previous?.learnedAt !== undefined || incomingQuestion.learnedAt !== undefined)
          ? { learnedAt: minimumDefined(previous?.learnedAt, incomingQuestion.learnedAt) }
          : {}),
      };
    });
    const stageQuizzes = { ...existing.stageQuizzes };
    Object.entries(incomingTrack.stageQuizzes).forEach(([stageId, summary]) => {
      if (!stageQuizzes[stageId] || stageQuizzes[stageId].finishedAt < summary.finishedAt) {
        stageQuizzes[stageId] = summary;
      }
    });
    const incomingIsNewer = incomingTrack.lastOpenedAt > existing.lastOpenedAt;
    byId.set(incomingTrack.id, {
      ...existing,
      stageSize: incomingIsNewer ? incomingTrack.stageSize : existing.stageSize,
      questions,
      stageQuizzes,
      lastOpenedStageId: incomingIsNewer ? incomingTrack.lastOpenedStageId : existing.lastOpenedStageId,
      lastOpenedAt: Math.max(existing.lastOpenedAt, incomingTrack.lastOpenedAt),
    });
  });
  const tracks = [...byId.values()];
  const sharedQuestions: Record<string, LearnQuestionProgress> = {};
  tracks.forEach((track) => Object.entries(track.questions).forEach(([id, question]) => {
    const previous = sharedQuestions[id];
    const learned = Boolean(previous?.learned || question.learned);
    sharedQuestions[id] = {
      learned,
      needReview: !learned && Boolean(previous?.needReview || question.needReview),
      skippedLearn: !learned && Boolean(previous?.skippedLearn || question.skippedLearn),
      important: Boolean(previous?.important || question.important),
      ...((previous?.learnedAt !== undefined || question.learnedAt !== undefined)
        ? { learnedAt: minimumDefined(previous?.learnedAt, question.learnedAt) }
        : {}),
    };
  }));
  return {
    version: 1,
    tracks: tracks.map((track) => ({
      ...track,
      questions: Object.fromEntries(Object.keys(track.questions).map((id) => [id, sharedQuestions[id]])),
    })),
  };
}

export function parseLearnProgress(value: unknown): LearnProgress | undefined {
  if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.tracks)) return undefined;
  const tracks: LearnTrackProgress[] = [];
  for (const candidate of value.tracks) {
    if (!isRecord(candidate)
      || !isNonEmptyString(candidate.id)
      || !Array.isArray(candidate.setIds) || !candidate.setIds.every(isNonEmptyString)
      || !Array.isArray(candidate.sectionIds) || !candidate.sectionIds.every(isNonEmptyString)
      || !isLearnStageSize(candidate.stageSize)
      || !isNonNegativeInteger(candidate.lastOpenedAt)
      || (candidate.lastOpenedStageId !== undefined && !isNonEmptyString(candidate.lastOpenedStageId))
      || !isRecord(candidate.questions)
      || !isRecord(candidate.stageQuizzes)) return undefined;
    const questions: Record<string, LearnQuestionProgress> = {};
    for (const [id, question] of Object.entries(candidate.questions)) {
      if (!isNonEmptyString(id) || !isRecord(question)
        || typeof question.learned !== 'boolean'
        || typeof question.needReview !== 'boolean'
        || (question.learnedAt !== undefined && !isNonNegativeInteger(question.learnedAt))
        || (question.skippedLearn !== undefined && typeof question.skippedLearn !== 'boolean')
        || (question.important !== undefined && typeof question.important !== 'boolean')) return undefined;
      questions[id] = {
        learned: question.learned,
        needReview: question.needReview,
        ...(question.learnedAt !== undefined ? { learnedAt: question.learnedAt } : {}),
        ...(question.skippedLearn !== undefined ? { skippedLearn: question.skippedLearn } : {}),
        ...(question.important !== undefined ? { important: question.important } : {}),
      };
    }
    const stageQuizzes: Record<string, LearnQuizSummary> = {};
    for (const [id, quiz] of Object.entries(candidate.stageQuizzes)) {
      if (!isNonEmptyString(id) || !isRecord(quiz) || !isNonEmptyString(quiz.sessionId)
        || !isNonNegativeInteger(quiz.correct) || !isNonNegativeInteger(quiz.total)
        || quiz.correct > quiz.total || !isNonNegativeInteger(quiz.finishedAt)) return undefined;
      stageQuizzes[id] = {
        sessionId: quiz.sessionId,
        correct: quiz.correct,
        total: quiz.total,
        finishedAt: quiz.finishedAt,
      };
    }
    tracks.push({
      id: candidate.id,
      setIds: [...candidate.setIds],
      sectionIds: [...candidate.sectionIds],
      stageSize: candidate.stageSize,
      ...(candidate.lastOpenedStageId ? { lastOpenedStageId: candidate.lastOpenedStageId } : {}),
      lastOpenedAt: candidate.lastOpenedAt,
      questions,
      stageQuizzes,
    });
  }
  if (new Set(tracks.map((track) => track.id)).size !== tracks.length) return undefined;
  return { version: 1, tracks };
}

export function loadLearnProgress(storage: Pick<Storage, 'getItem'>): LearnProgress {
  try {
    const stored = storage.getItem(LEARN_PROGRESS_STORAGE_KEY);
    if (!stored) return emptyLearnProgress();
    return parseLearnProgress(JSON.parse(stored)) ?? emptyLearnProgress();
  } catch {
    return emptyLearnProgress();
  }
}

export function saveLearnProgress(storage: Pick<Storage, 'setItem'>, progress: LearnProgress): void {
  storage.setItem(LEARN_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

export function chunkBySize<T>(items: readonly T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let offset = 0; offset < items.length; offset += size) chunks.push(items.slice(offset, offset + size));
  return chunks;
}

function chunkMistakes(track: LearnTrackProgress, ids: string[]): LearnStage[] {
  return chunkBySize(ids, track.stageSize).map((questions, index) => ({
    id: `${track.id}:mistakes:${index + 1}`,
    ordinal: index + 1,
    questions,
    mistakes: true,
  }));
}

function isLearnStageSize(value: unknown): value is (typeof LEARN_STAGE_SIZES)[number] {
  return LEARN_STAGE_SIZES.includes(value as (typeof LEARN_STAGE_SIZES)[number]);
}

function hash(value: string): string {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0).toString(36);
}

function minimumDefined(first?: number, second?: number): number | undefined {
  if (first === undefined) return second;
  if (second === undefined) return first;
  return Math.min(first, second);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}
