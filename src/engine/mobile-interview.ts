import { isCalendarDate, type ChecklistItem } from './interviews';
import { emptyLearnProgress, loadLearnProgress, mergeLearnProgress, parseLearnProgress, saveLearnProgress, type LearnProgress } from './learn-track';
import {
  emptySmartRevisionData,
  loadSmartRevisionData,
  mergeSmartRevisionData,
  parseSmartRevisionData,
  saveSmartRevisionData,
  type RevisionPickReason,
  type SmartRevisionData,
} from './smart-revision';

export type MobileInterviewTrack = 'kotlin' | 'spring-boot' | 'mixed';
export type MobileInterviewStatus = 'running' | 'paused' | 'finished';
export type MobileInterviewQuestionKind = 'short-answer' | 'coding' | 'mcq';
export type MobileCodingLanguage = 'kotlin' | 'java';
export type MobileInterviewAnswerResult = 'correct' | 'incorrect';

export interface MobileCodingVerification {
  status: 'correct' | 'incorrect' | 'unavailable';
  output: string;
  message?: string;
  stderr?: string;
}

export interface MobileInterviewOption {
  id: string;
  text: string;
}

export interface MobileInterviewPrompt {
  id: string;
  checklistId: string;
  checklistTitle: string;
  sectionId: string;
  sectionTitle: string;
  text: string;
  codeTerms?: string[];
  priority?: ChecklistItem['priority'];
  referenceItems: ChecklistItem[];
  answered: boolean;
  skipped: boolean;
  important: boolean;
  referenceRevealed: boolean;
  note: string;
  kind?: MobileInterviewQuestionKind;
  referenceAnswer?: string;
  starterCode?: string;
  options?: MobileInterviewOption[];
  correctOptionId?: string;
  explanation?: string;
  answerText?: string;
  selectedOptionId?: string | null;
  answerResult?: MobileInterviewAnswerResult;
  codingProblemId?: number;
  codingLanguage?: MobileCodingLanguage;
  codingAnswers?: Partial<Record<MobileCodingLanguage, string>>;
  codingStdin?: string;
  codingProblemCollapsed?: boolean;
  codingVerification?: MobileCodingVerification;
  codingRetryUsed?: boolean;
  pickReason?: RevisionPickReason;
}

export interface TimedMobileInterviewPrompt extends MobileInterviewPrompt {
  timeLimitSeconds: number;
  remainingSeconds: number;
  timeExpired: boolean;
}

export interface MobileInterviewSession {
  version: 1;
  id: string;
  track: MobileInterviewTrack;
  durationSeconds: number;
  questionDurationSeconds: number;
  remainingSeconds: number;
  endsAt: number | null;
  status: MobileInterviewStatus;
  activeIndex: number;
  prompts: TimedMobileInterviewPrompt[];
  startedAt: number;
  finishedAt: number | null;
  title?: string;
  setIds?: string[];
  scheduleId?: string;
  mode?: 'interview' | 'learn' | 'revision';
  stageId?: string;
  trackId?: string;
  untimed?: boolean;
}

export interface MobileInterviewSchedule {
  id: string;
  title: string;
  date: string;
  setIds: string[];
  sectionIds: string[];
  durationMinutes?: number;
  questionTimeLimitSeconds?: number;
  programQuestionTimeLimitSeconds?: number;
  randomizeQuestions?: boolean;
  status: 'planned' | 'completed';
  createdAt: number;
  completedAt?: number;
}

export const MOBILE_INTERVIEW_STORAGE_KEY = 'kotlin-interview-trainer-mobile-interview-v1';
export const MOBILE_INTERVIEW_HISTORY_STORAGE_KEY = 'kotlin-interview-trainer-mobile-interview-history-v1';
export const MOBILE_INTERVIEW_SCHEDULE_STORAGE_KEY = 'kotlin-interview-trainer-mobile-interview-schedule-v1';
export const MOBILE_INTERVIEW_QUESTION_STATS_STORAGE_KEY = 'kotlin-interview-trainer-mobile-interview-question-stats-v1';

export interface MobileInterviewQuestionStats {
  attended: number;
  correct: number;
  wrong: number;
  skipped: number;
}

export interface MobileInterviewQuestionStatsBackup {
  version: 2;
  questions: Record<string, MobileInterviewQuestionStats>;
  attendanceEvents: string[];
  skippedEvents: string[];
  answerEvents: Record<string, 'correct' | 'incorrect'>;
}

function emptyMobileInterviewQuestionStats(): MobileInterviewQuestionStatsBackup {
  return { version: 2, questions: {}, attendanceEvents: [], skippedEvents: [], answerEvents: {} };
}

function readStoredMobileInterviewQuestionStats(
  storage: Pick<Storage, 'getItem'>,
): MobileInterviewQuestionStatsBackup {
  const stored = storage.getItem(MOBILE_INTERVIEW_QUESTION_STATS_STORAGE_KEY);
  if (!stored) return emptyMobileInterviewQuestionStats();
  try {
    const parsed: unknown = JSON.parse(stored);
    if (!isRecord(parsed) || parsed.version !== 2 || !isRecord(parsed.questions)) {
      return emptyMobileInterviewQuestionStats();
    }
    const questions: Record<string, MobileInterviewQuestionStats> = {};
    Object.entries(parsed.questions).forEach(([id, value]) => {
      if (isRecord(value)
        && typeof value.attended === 'number' && Number.isInteger(value.attended) && value.attended >= 0
        && typeof value.correct === 'number' && Number.isInteger(value.correct) && value.correct >= 0
        && typeof value.wrong === 'number' && Number.isInteger(value.wrong) && value.wrong >= 0
        && typeof value.skipped === 'number' && Number.isInteger(value.skipped) && value.skipped >= 0) {
        questions[id] = {
          attended: value.attended,
          correct: value.correct,
          wrong: value.wrong,
          skipped: value.skipped,
        };
      }
    });
    return {
      version: 2,
      questions,
      attendanceEvents: Array.isArray(parsed.attendanceEvents)
        ? parsed.attendanceEvents.filter((value): value is string => typeof value === 'string')
        : [],
      skippedEvents: Array.isArray(parsed.skippedEvents)
        ? parsed.skippedEvents.filter((value): value is string => typeof value === 'string')
        : [],
      answerEvents: isRecord(parsed.answerEvents)
        ? Object.fromEntries(Object.entries(parsed.answerEvents).filter(
            (entry): entry is [string, 'correct' | 'incorrect'] => entry[1] === 'correct' || entry[1] === 'incorrect',
          ))
        : {},
    };
  } catch {
    return emptyMobileInterviewQuestionStats();
  }
}

function parseMobileInterviewQuestionStatsBackup(value: unknown): MobileInterviewQuestionStatsBackup | undefined {
  if (!isRecord(value) || value.version !== 2 || !isRecord(value.questions)
    || !Array.isArray(value.attendanceEvents) || !value.attendanceEvents.every(isNonEmptyString)
    || !Array.isArray(value.skippedEvents) || !value.skippedEvents.every(isNonEmptyString)
    || !isRecord(value.answerEvents)) return undefined;

  const parsed = readQuestionStatsRecord(value.questions);
  if (!parsed) return undefined;
  const answerEvents = Object.fromEntries(Object.entries(value.answerEvents).filter(
    (entry): entry is [string, 'correct' | 'incorrect'] => entry[1] === 'correct' || entry[1] === 'incorrect',
  ));
  if (Object.keys(answerEvents).length !== Object.keys(value.answerEvents).length) return undefined;
  return {
    version: 2,
    questions: parsed,
    attendanceEvents: [...new Set(value.attendanceEvents as string[])],
    skippedEvents: [...new Set(value.skippedEvents as string[])],
    answerEvents,
  };
}

function readQuestionStatsRecord(value: Record<string, unknown>): Record<string, MobileInterviewQuestionStats> | undefined {
  const questions: Record<string, MobileInterviewQuestionStats> = {};
  for (const [id, stats] of Object.entries(value)) {
    if (!isRecord(stats)
      || !isNonNegativeInteger(stats.attended)
      || !isNonNegativeInteger(stats.correct)
      || !isNonNegativeInteger(stats.wrong)
      || !isNonNegativeInteger(stats.skipped)) return undefined;
    questions[id] = {
      attended: stats.attended,
      correct: stats.correct,
      wrong: stats.wrong,
      skipped: stats.skipped,
    };
  }
  return questions;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function saveMobileInterviewQuestionStats(
  storage: Pick<Storage, 'setItem'>,
  stats: MobileInterviewQuestionStatsBackup,
): void {
  storage.setItem(MOBILE_INTERVIEW_QUESTION_STATS_STORAGE_KEY, JSON.stringify(stats));
}

export function loadMobileInterviewQuestionStats(
  storage: Pick<Storage, 'getItem'>,
): Record<string, MobileInterviewQuestionStats> {
  return readStoredMobileInterviewQuestionStats(storage).questions;
}

export function recordMobileInterviewQuestionAttendance(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  sessionId: string,
  promptId: string,
): Record<string, MobileInterviewQuestionStats> {
  const stored = readStoredMobileInterviewQuestionStats(storage);
  const eventId = JSON.stringify([sessionId, promptId]);
  const changed = markMobileInterviewQuestionAttended(stored, eventId, promptId);
  if (changed) saveMobileInterviewQuestionStats(storage, stored);
  return stored.questions;
}

export function recordMobileInterviewQuestionAnswerResult(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  sessionId: string,
  promptId: string,
  result: 'correct' | 'incorrect',
): Record<string, MobileInterviewQuestionStats> {
  const stored = readStoredMobileInterviewQuestionStats(storage);
  const eventId = JSON.stringify([sessionId, promptId]);
  const attendanceChanged = markMobileInterviewQuestionAttended(stored, eventId, promptId);
  const previousResult = stored.answerEvents[eventId];
  if (previousResult !== result) {
    const current = stored.questions[promptId] ?? { attended: 0, correct: 0, wrong: 0, skipped: 0 };
    stored.questions[promptId] = {
      ...current,
      correct: current.correct + (result === 'correct' ? 1 : 0) - (previousResult === 'correct' ? 1 : 0),
      wrong: current.wrong + (result === 'incorrect' ? 1 : 0) - (previousResult === 'incorrect' ? 1 : 0),
    };
    stored.answerEvents[eventId] = result;
    saveMobileInterviewQuestionStats(storage, stored);
  } else if (attendanceChanged) {
    saveMobileInterviewQuestionStats(storage, stored);
  }
  return stored.questions;
}

export function recordMobileInterviewQuestionSkipped(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  sessionId: string,
  promptId: string,
): Record<string, MobileInterviewQuestionStats> {
  const stored = readStoredMobileInterviewQuestionStats(storage);
  const eventId = JSON.stringify([sessionId, promptId]);
  if (!stored.attendanceEvents.includes(eventId) && !stored.answerEvents[eventId] && !stored.skippedEvents.includes(eventId)) {
    const current = stored.questions[promptId] ?? { attended: 0, correct: 0, wrong: 0, skipped: 0 };
    stored.questions[promptId] = { ...current, skipped: current.skipped + 1 };
    stored.skippedEvents.push(eventId);
    saveMobileInterviewQuestionStats(storage, stored);
  }
  return stored.questions;
}

function markMobileInterviewQuestionAttended(
  stats: MobileInterviewQuestionStatsBackup,
  eventId: string,
  promptId: string,
): boolean {
  const alreadyAttended = stats.attendanceEvents.includes(eventId);
  const skippedIndex = stats.skippedEvents.indexOf(eventId);
  if (alreadyAttended && skippedIndex === -1) return false;

  const current = stats.questions[promptId] ?? { attended: 0, correct: 0, wrong: 0, skipped: 0 };
  stats.questions[promptId] = {
    ...current,
    attended: current.attended + (alreadyAttended ? 0 : 1),
    skipped: current.skipped - (skippedIndex === -1 ? 0 : 1),
  };
  if (!alreadyAttended) stats.attendanceEvents.push(eventId);
  if (skippedIndex !== -1) stats.skippedEvents.splice(skippedIndex, 1);
  return true;
}

export function clearMobileInterviewQuestionStats(
  storage: Pick<Storage, 'removeItem'>,
): void {
  storage.removeItem(MOBILE_INTERVIEW_QUESTION_STATS_STORAGE_KEY);
}

export function getMobileInterviewPromptLimit(durationMinutes: number): number {
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) return 0;
  return Math.ceil(durationMinutes * 2 / 3);
}

export function createMobileInterviewSession(
  prompts: MobileInterviewPrompt[],
  track: MobileInterviewTrack,
  durationMinutes: number,
  now = Date.now(),
  options: {
    title?: string;
    setIds?: string[];
    scheduleId?: string;
    untimed?: boolean;
    questionTimeLimitSeconds?: number;
    programQuestionTimeLimitSeconds?: number;
    mode?: 'interview' | 'learn' | 'revision';
    stageId?: string;
    trackId?: string;
  } = {},
): MobileInterviewSession {
  if (prompts.length === 0) throw new Error('Choose at least one interview prompt.');
  if (options.questionTimeLimitSeconds !== undefined
    && (!Number.isInteger(options.questionTimeLimitSeconds) || options.questionTimeLimitSeconds <= 0)) {
    throw new Error('Question time limit must be a positive number of seconds.');
  }
  if (options.programQuestionTimeLimitSeconds !== undefined
    && (!Number.isInteger(options.programQuestionTimeLimitSeconds) || options.programQuestionTimeLimitSeconds <= 0)) {
    throw new Error('Program question time limit must be a positive number of seconds.');
  }
  if (!options.untimed && options.questionTimeLimitSeconds === undefined
    && (!Number.isFinite(durationMinutes) || durationMinutes <= 0)) throw new Error('Session duration must be greater than zero.');

  const questionDurationSeconds = options.untimed
    ? 0
    : options.questionTimeLimitSeconds ?? Math.ceil(Math.round(durationMinutes * 60) / prompts.length);
  const sessionPrompts: TimedMobileInterviewPrompt[] = prompts.map((prompt) => {
    const usesProgramTimer = prompt.kind === 'coding' || isProgramInterviewPrompt(prompt);
    const timeLimitSeconds = options.untimed
      ? 0
      : usesProgramTimer && options.programQuestionTimeLimitSeconds !== undefined
        ? options.programQuestionTimeLimitSeconds
        : prompt.kind === 'coding'
          ? 300
          : questionDurationSeconds;
    return {
      ...prompt,
      referenceItems: prompt.referenceItems.map((item) => ({ ...item })),
      timeLimitSeconds,
      remainingSeconds: timeLimitSeconds,
      timeExpired: false,
    };
  });
  const durationSeconds = options.untimed
    ? 0
    : options.questionTimeLimitSeconds !== undefined
      ? sessionPrompts.reduce((total, prompt) => total + prompt.timeLimitSeconds, 0)
      : Math.round(durationMinutes * 60);
  const initialQuestionDurationSeconds = sessionPrompts[0].timeLimitSeconds;
  return {
    version: 1,
    id: createId(),
    track,
    durationSeconds,
    questionDurationSeconds,
    remainingSeconds: initialQuestionDurationSeconds,
    endsAt: options.untimed ? null : now + initialQuestionDurationSeconds * 1000,
    status: 'running',
    activeIndex: 0,
    prompts: sessionPrompts,
    startedAt: now,
    finishedAt: null,
    ...(options.title ? { title: options.title } : {}),
    ...(options.setIds ? { setIds: [...options.setIds] } : {}),
    ...(options.scheduleId ? { scheduleId: options.scheduleId } : {}),
    ...(options.mode ? { mode: options.mode } : {}),
    ...(options.stageId ? { stageId: options.stageId } : {}),
    ...(options.trackId ? { trackId: options.trackId } : {}),
    untimed: options.untimed === true,
  };
}

export function isProgramInterviewPrompt(
  prompt: Pick<MobileInterviewPrompt, 'checklistTitle' | 'sectionTitle'> & Partial<Pick<MobileInterviewPrompt, 'kind'>>,
): boolean {
  return prompt.kind === 'coding'
    || /program/i.test(prompt.checklistTitle)
    || /program/i.test(prompt.sectionTitle);
}

export function formatMobileInterviewQaText(
  session: Pick<MobileInterviewSession, 'title' | 'track' | 'prompts'>,
): string {
  const title = session.title ?? `${session.track} interview`;
  const questionsAndAnswers = session.prompts.map((prompt, index) => {
    const correctOption = prompt.options?.find((option) => option.id === prompt.correctOptionId)?.text;
    const referenceAnswer = [
      ...(correctOption ? [`Correct option: ${correctOption}`] : []),
      ...(prompt.referenceAnswer ? [prompt.referenceAnswer] : []),
      ...prompt.referenceItems.map((item) => item.text),
      ...(prompt.explanation ? [`Explanation: ${prompt.explanation}`] : []),
    ].join('\n') || 'No reference answer is available.';
    const selectedOption = prompt.options?.find((option) => option.id === prompt.selectedOptionId)?.text;
    const codingAnswers = (['kotlin', 'java'] as const).flatMap((language) => {
      const code = prompt.codingAnswers?.[language]?.trim();
      return code ? [`${language === 'kotlin' ? 'Kotlin' : 'Java'} code:\n${code}`] : [];
    });
    const userAnswer = [
      prompt.answerText?.trim(),
      selectedOption,
      prompt.note.trim(),
      ...codingAnswers,
    ].filter((answer): answer is string => Boolean(answer)).join('\n\n') || 'No answer submitted.';
    return [
      `Question ${index + 1}${prompt.sectionTitle ? ` — ${prompt.sectionTitle}` : ''}`,
      prompt.text,
      '',
      'Reference answer:',
      referenceAnswer,
      '',
      'Your answer:',
      userAnswer,
    ].join('\n');
  });

  return [`${title} — Questions & Answers`, '', questionsAndAnswers.join('\n\n----------------------------------------\n\n')].join('\n');
}

export function getMobileInterviewRemainingSeconds(session: MobileInterviewSession, now = Date.now()): number {
  if (session.untimed) return 0;
  if (session.status !== 'running' || session.endsAt === null) return session.remainingSeconds;
  return Math.max(0, Math.ceil((session.endsAt - now) / 1000));
}

export function pauseMobileInterviewSession(session: MobileInterviewSession, now = Date.now()): MobileInterviewSession {
  if (session.status !== 'running') return session;
  if (session.untimed) return { ...session, endsAt: null, status: 'paused' };
  const remainingSeconds = getMobileInterviewRemainingSeconds(session, now);
  if (remainingSeconds === 0) return expireMobileInterviewPrompt(session, now);
  return {
    ...session,
    remainingSeconds,
    endsAt: null,
    status: 'paused',
    prompts: session.prompts.map((prompt, index) => index === session.activeIndex ? { ...prompt, remainingSeconds } : prompt),
  };
}

export function resumeMobileInterviewSession(session: MobileInterviewSession, now = Date.now()): MobileInterviewSession {
  if (session.untimed) {
    return session.status === 'paused' ? { ...session, status: 'running', endsAt: null } : session;
  }
  if (session.status !== 'paused' || session.remainingSeconds <= 0 || session.prompts[session.activeIndex].timeExpired) return session;
  return { ...session, status: 'running', endsAt: now + session.remainingSeconds * 1000 };
}

export function retryCodingInterviewPromptWithExtraTime(
  session: MobileInterviewSession,
  now = Date.now(),
): MobileInterviewSession {
  if (session.status !== 'paused' || session.untimed) return session;
  const prompt = session.prompts[session.activeIndex];
  if (prompt.kind !== 'coding' || !prompt.timeExpired || prompt.codingRetryUsed) return session;

  const extraSeconds = Math.max(1, Math.ceil(prompt.timeLimitSeconds / 4));
  const prompts = session.prompts.map((item, index) => index === session.activeIndex
    ? {
        ...item,
        answered: false,
        answerResult: undefined,
        codingVerification: undefined,
        codingRetryUsed: true,
        remainingSeconds: extraSeconds,
        timeExpired: false,
      }
    : item);
  return {
    ...session,
    prompts,
    durationSeconds: session.durationSeconds + extraSeconds,
    remainingSeconds: extraSeconds,
    endsAt: now + extraSeconds * 1000,
    status: 'running',
  };
}

export function moveMobileInterviewToPrompt(
  session: MobileInterviewSession,
  index: number,
  now = Date.now(),
): MobileInterviewSession {
  if (session.status === 'finished') return session;
  if (session.untimed) {
    if (index >= session.prompts.length) return finishMobileInterviewSession(session, now);
    return { ...session, activeIndex: Math.max(0, index), endsAt: null };
  }
  const remainingSeconds = session.status === 'running'
    ? getMobileInterviewRemainingSeconds(session, now)
    : session.remainingSeconds;
  const prompts = session.prompts.map((prompt, promptIndex) => promptIndex === session.activeIndex
    ? { ...prompt, remainingSeconds }
    : prompt);
  if (remainingSeconds === 0 && !session.prompts[session.activeIndex].timeExpired) {
    return expireMobileInterviewPrompt({ ...session, prompts, remainingSeconds, endsAt: null }, now);
  }
  if (index >= prompts.length) {
    return finishMobileInterviewSession({ ...session, prompts, remainingSeconds, endsAt: null }, now);
  }

  const activeIndex = Math.max(0, index);
  const nextPrompt = prompts[activeIndex];
  const nextRemainingSeconds = nextPrompt.remainingSeconds;
  return {
    ...session,
    prompts,
    activeIndex,
    remainingSeconds: nextRemainingSeconds,
    endsAt: session.status === 'running' && !nextPrompt.timeExpired
      ? now + nextRemainingSeconds * 1000
      : null,
    status: session.status === 'running' && !nextPrompt.timeExpired ? 'running' : 'paused',
  };
}

export function expireMobileInterviewPrompt(session: MobileInterviewSession, now = Date.now()): MobileInterviewSession {
  if (session.status !== 'running' || session.untimed) return session;
  const prompts = session.prompts.map((prompt, index) => index === session.activeIndex
    ? {
        ...prompt,
        ...(prompt.kind === 'coding' ? { answered: true } : {}),
        remainingSeconds: 0,
        timeExpired: true,
      }
    : prompt);
  const activePrompt = prompts[session.activeIndex];
  if (activePrompt.kind === 'coding') {
    return {
      ...session,
      prompts,
      status: 'paused',
      remainingSeconds: 0,
      endsAt: null,
    };
  }
  const nextIndex = session.activeIndex + 1;
  if (nextIndex >= prompts.length) {
    return {
      ...session,
      prompts,
      status: 'finished',
      remainingSeconds: 0,
      endsAt: null,
      finishedAt: now,
    };
  }

  const nextPrompt = prompts[nextIndex];
  return {
    ...session,
    prompts,
    activeIndex: nextIndex,
    remainingSeconds: nextPrompt.remainingSeconds,
    endsAt: now + nextPrompt.remainingSeconds * 1000,
  };
}

export function finishMobileInterviewSession(session: MobileInterviewSession, now = Date.now()): MobileInterviewSession {
  if (session.status === 'finished') return session;
  if (session.untimed) {
    return { ...session, status: 'finished', endsAt: null, finishedAt: now };
  }
  const remainingSeconds = session.status === 'running'
    ? getMobileInterviewRemainingSeconds(session, now)
    : session.remainingSeconds;
  return {
    ...session,
    status: 'finished',
    remainingSeconds,
    endsAt: null,
    finishedAt: now,
    prompts: session.prompts.map((prompt, index) => index === session.activeIndex ? { ...prompt, remainingSeconds } : prompt),
  };
}

export function parseMobileInterviewSession(value: unknown): MobileInterviewSession | undefined {
  if (!isRecord(value)
    || value.version !== 1
    || typeof value.id !== 'string'
    || (value.track !== 'kotlin' && value.track !== 'spring-boot' && value.track !== 'mixed')
    || !isNonNegativeNumber(value.durationSeconds)
    || (!value.untimed && value.durationSeconds === 0)
    || (value.questionDurationSeconds !== undefined && (!isNonNegativeNumber(value.questionDurationSeconds) || (!value.untimed && value.questionDurationSeconds === 0)))
    || !isNonNegativeNumber(value.remainingSeconds)
    || (value.endsAt !== null && !isNonNegativeNumber(value.endsAt))
    || (value.status !== 'running' && value.status !== 'paused' && value.status !== 'finished')
    || typeof value.activeIndex !== 'number'
    || !Number.isInteger(value.activeIndex)
    || !Array.isArray(value.prompts)
    || value.prompts.length === 0
    || !isNonNegativeNumber(value.startedAt)
    || (value.finishedAt !== null && !isNonNegativeNumber(value.finishedAt))
    || (value.title !== undefined && typeof value.title !== 'string')
    || (value.setIds !== undefined && (!Array.isArray(value.setIds) || !value.setIds.every((id) => typeof id === 'string')))
    || (value.scheduleId !== undefined && typeof value.scheduleId !== 'string')
    || (value.mode !== undefined && value.mode !== 'interview' && value.mode !== 'learn' && value.mode !== 'revision')
    || (value.stageId !== undefined && typeof value.stageId !== 'string')
    || (value.trackId !== undefined && typeof value.trackId !== 'string')
    || (value.untimed !== undefined && typeof value.untimed !== 'boolean')) return undefined;

  const isLegacySession = value.questionDurationSeconds === undefined;
  const isUntimed = value.untimed === true;
  const questionDurationSeconds = typeof value.questionDurationSeconds === 'number'
    ? value.questionDurationSeconds
    : Math.ceil(value.durationSeconds / value.prompts.length);
  const parsedPrompts = value.prompts.map((prompt) => parsePrompt(
    prompt,
    isLegacySession,
    questionDurationSeconds,
    value.status === 'finished' ? 0 : questionDurationSeconds,
    isUntimed,
  ));
  if (!parsedPrompts.every(isMobileInterviewPrompt)) return undefined;
  const prompts = parsedPrompts;
  if (value.activeIndex < 0 || value.activeIndex >= prompts.length) return undefined;
  const remainingSeconds = isLegacySession ? prompts[value.activeIndex].remainingSeconds : value.remainingSeconds;
  const endsAt = isLegacySession && value.status === 'running'
    ? Date.now() + remainingSeconds * 1000
    : value.endsAt;
  if ((value.status === 'running' && !isUntimed) !== (endsAt !== null)) return undefined;
  if (isUntimed && endsAt !== null) return undefined;
  if (prompts[value.activeIndex].remainingSeconds !== remainingSeconds) return undefined;

  return {
    version: 1,
    id: value.id,
    track: value.track,
    durationSeconds: value.durationSeconds,
    questionDurationSeconds,
    remainingSeconds,
    endsAt: isUntimed || value.untimed === undefined ? null : endsAt,
    status: value.status,
    activeIndex: value.activeIndex,
    prompts,
    startedAt: value.startedAt,
    finishedAt: value.finishedAt,
    ...(typeof value.title === 'string' ? { title: value.title } : {}),
    ...(Array.isArray(value.setIds) ? { setIds: [...value.setIds] } : {}),
    ...(typeof value.scheduleId === 'string' ? { scheduleId: value.scheduleId } : {}),
    mode: value.mode === 'learn' || value.mode === 'revision' ? value.mode : 'interview',
    ...(typeof value.stageId === 'string' ? { stageId: value.stageId } : {}),
    ...(typeof value.trackId === 'string' ? { trackId: value.trackId } : {}),
    untimed: isUntimed || value.untimed === undefined,
  };
}

export function loadMobileInterviewSession(storage: Pick<Storage, 'getItem'>): MobileInterviewSession | null {
  const stored = storage.getItem(MOBILE_INTERVIEW_STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = parseMobileInterviewSession(JSON.parse(stored));
    if (!parsed) return null;
    if (parsed.untimed && parsed.status !== 'finished') return migrateUntimedSessionToTimed(parsed);
    if (parsed.status === 'running' && !parsed.untimed) {
      const remainingSeconds = getMobileInterviewRemainingSeconds(parsed);
      if (remainingSeconds === 0) return expireMobileInterviewPrompt(parsed);
      return {
        ...parsed,
        remainingSeconds,
        prompts: parsed.prompts.map((prompt, index) => index === parsed.activeIndex ? { ...prompt, remainingSeconds } : prompt),
      };
    }
    return parsed;
  } catch {
    return null;
  }
}

function migrateUntimedSessionToTimed(session: MobileInterviewSession): MobileInterviewSession {
  const questionDurationSeconds = 120;
  return {
    ...session,
    durationSeconds: session.prompts.length * questionDurationSeconds,
    questionDurationSeconds,
    remainingSeconds: questionDurationSeconds,
    endsAt: session.status === 'running' ? Date.now() + questionDurationSeconds * 1000 : null,
    prompts: session.prompts.map((prompt) => ({
      ...prompt,
      timeLimitSeconds: questionDurationSeconds,
      remainingSeconds: questionDurationSeconds,
      timeExpired: false,
    })),
    untimed: false,
  };
}

export function saveMobileInterviewSession(
  storage: Pick<Storage, 'setItem' | 'removeItem'>,
  session: MobileInterviewSession | null,
): void {
  if (session) storage.setItem(MOBILE_INTERVIEW_STORAGE_KEY, JSON.stringify(session));
  else storage.removeItem(MOBILE_INTERVIEW_STORAGE_KEY);
}

export function loadMobileInterviewHistory(storage: Pick<Storage, 'getItem'>): MobileInterviewSession[] {
  const stored = storage.getItem(MOBILE_INTERVIEW_HISTORY_STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(parseMobileInterviewSession)
      .filter((session): session is MobileInterviewSession => session?.status === 'finished')
      .sort((first, second) => (second.finishedAt ?? 0) - (first.finishedAt ?? 0));
  } catch {
    return [];
  }
}

export function saveMobileInterviewHistory(
  storage: Pick<Storage, 'setItem'>,
  history: MobileInterviewSession[],
): void {
  storage.setItem(MOBILE_INTERVIEW_HISTORY_STORAGE_KEY, JSON.stringify(history));
}

export interface MobileInterviewBackup {
  activeSession: MobileInterviewSession | null;
  history: MobileInterviewSession[];
  schedules: MobileInterviewSchedule[];
  questionStats: MobileInterviewQuestionStatsBackup;
  learnProgress: LearnProgress;
  revision?: SmartRevisionData;
}

export function loadMobileInterviewBackup(storage: Pick<Storage, 'getItem'>): MobileInterviewBackup {
  return {
    activeSession: loadMobileInterviewSession(storage),
    history: loadMobileInterviewHistory(storage),
    schedules: loadMobileInterviewSchedules(storage),
    questionStats: readStoredMobileInterviewQuestionStats(storage),
    learnProgress: loadLearnProgress(storage),
    revision: loadSmartRevisionData(storage),
  };
}

export function saveMobileInterviewBackup(
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>,
  backup: MobileInterviewBackup,
): void {
  saveMobileInterviewSession(storage, backup.activeSession);
  saveMobileInterviewHistory(storage, backup.history);
  saveMobileInterviewSchedules(storage, backup.schedules);
  saveMobileInterviewQuestionStats(storage, backup.questionStats);
  saveLearnProgress(storage, backup.learnProgress);
  if (backup.revision) saveSmartRevisionData(storage, backup.revision);
}

export function parseMobileInterviewBackup(value: unknown): MobileInterviewBackup | undefined {
  if (!isRecord(value) || !Array.isArray(value.history)) return undefined;
  const parsedActiveSession = value.activeSession === null ? null : parseMobileInterviewSession(value.activeSession);
  if (value.activeSession !== null && !parsedActiveSession) return undefined;
  const activeSession = parsedActiveSession ?? null;
  const history = value.history.map(parseMobileInterviewSession);
  const schedules = value.schedules === undefined
    ? []
    : Array.isArray(value.schedules) ? value.schedules.map(parseMobileInterviewSchedule) : undefined;
  const questionStats = value.questionStats === undefined
    ? emptyMobileInterviewQuestionStats()
    : parseMobileInterviewQuestionStatsBackup(value.questionStats);
  const learnProgress = value.learnProgress === undefined
    ? emptyLearnProgress()
    : parseLearnProgress(value.learnProgress);
  const revision = value.revision === undefined
    ? emptySmartRevisionData()
    : parseSmartRevisionData(value.revision) ?? emptySmartRevisionData();
  if (!history.every((session) => session?.status === 'finished')
    || !schedules || !schedules.every((schedule) => schedule !== undefined) || !questionStats || !learnProgress) return undefined;
  return {
    activeSession,
    history: history as MobileInterviewSession[],
    schedules: schedules as MobileInterviewSchedule[],
    questionStats,
    learnProgress,
    revision,
  };
}

export function mergeMobileInterviewBackups(
  current: MobileInterviewBackup,
  incoming: MobileInterviewBackup,
): MobileInterviewBackup {
  const historyById = new Map(current.history.map((session) => [session.id, session]));
  incoming.history.forEach((session) => historyById.set(session.id, session));
  const schedulesById = new Map(current.schedules.map((schedule) => [schedule.id, schedule]));
  incoming.schedules.forEach((schedule) => schedulesById.set(schedule.id, schedule));
  return {
    activeSession: incoming.activeSession ?? current.activeSession,
    history: [...historyById.values()].sort((first, second) => (second.finishedAt ?? 0) - (first.finishedAt ?? 0)),
    schedules: [...schedulesById.values()].sort((first, second) => first.date.localeCompare(second.date)),
    questionStats: mergeMobileInterviewQuestionStats(current.questionStats, incoming.questionStats),
    learnProgress: mergeLearnProgress(current.learnProgress, incoming.learnProgress),
    revision: mergeSmartRevisionData(current.revision ?? emptySmartRevisionData(), incoming.revision ?? emptySmartRevisionData()),
  };
}

function mergeMobileInterviewQuestionStats(
  current: MobileInterviewQuestionStatsBackup,
  incoming: MobileInterviewQuestionStatsBackup,
): MobileInterviewQuestionStatsBackup {
  const attendanceEvents = [...new Set([...current.attendanceEvents, ...incoming.attendanceEvents])];
  const attendedEvents = new Set(attendanceEvents);
  const skippedEvents = [...new Set([...current.skippedEvents, ...incoming.skippedEvents])]
    .filter((event) => !attendedEvents.has(event));
  const answerEvents = { ...current.answerEvents, ...incoming.answerEvents };
  const questions: Record<string, MobileInterviewQuestionStats> = {};
  const questionIds = new Set([
    ...Object.keys(current.questions),
    ...Object.keys(incoming.questions),
    ...attendanceEvents.map(getQuestionIdFromStatsEvent),
    ...skippedEvents.map(getQuestionIdFromStatsEvent),
    ...Object.keys(answerEvents).map(getQuestionIdFromStatsEvent),
  ]);
  questionIds.delete('');

  questionIds.forEach((questionId) => {
    const currentStats = current.questions[questionId] ?? emptyQuestionStats();
    const incomingStats = incoming.questions[questionId] ?? emptyQuestionStats();
    const currentEventStats = getQuestionEventStats(current, questionId);
    const incomingEventStats = getQuestionEventStats(incoming, questionId);
    const mergedEventStats = getQuestionEventStats({ version: 2, questions: {}, attendanceEvents, skippedEvents, answerEvents }, questionId);
    questions[questionId] = {
      attended: mergedEventStats.attended + Math.max(
        currentStats.attended - currentEventStats.attended,
        incomingStats.attended - incomingEventStats.attended,
      ),
      correct: mergedEventStats.correct + Math.max(
        currentStats.correct - currentEventStats.correct,
        incomingStats.correct - incomingEventStats.correct,
      ),
      wrong: mergedEventStats.wrong + Math.max(
        currentStats.wrong - currentEventStats.wrong,
        incomingStats.wrong - incomingEventStats.wrong,
      ),
      skipped: mergedEventStats.skipped + Math.max(
        currentStats.skipped - currentEventStats.skipped,
        incomingStats.skipped - incomingEventStats.skipped,
      ),
    };
  });

  return { version: 2, questions, attendanceEvents, skippedEvents, answerEvents };
}

function getQuestionEventStats(
  stats: MobileInterviewQuestionStatsBackup,
  questionId: string,
): MobileInterviewQuestionStats {
  let attended = 0;
  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  stats.attendanceEvents.forEach((event) => {
    if (getQuestionIdFromStatsEvent(event) === questionId) attended += 1;
  });
  stats.skippedEvents.forEach((event) => {
    if (getQuestionIdFromStatsEvent(event) === questionId) skipped += 1;
  });
  Object.entries(stats.answerEvents).forEach(([event, result]) => {
    if (getQuestionIdFromStatsEvent(event) === questionId) {
      if (result === 'correct') correct += 1;
      else wrong += 1;
    }
  });
  return { attended, correct, wrong, skipped };
}

function getQuestionIdFromStatsEvent(event: string): string {
  try {
    const parsed: unknown = JSON.parse(event);
    return Array.isArray(parsed) && parsed.length === 2 && typeof parsed[1] === 'string' ? parsed[1] : '';
  } catch {
    return '';
  }
}

function emptyQuestionStats(): MobileInterviewQuestionStats {
  return { attended: 0, correct: 0, wrong: 0, skipped: 0 };
}

export function loadMobileInterviewSchedules(storage: Pick<Storage, 'getItem'>): MobileInterviewSchedule[] {
  const stored = storage.getItem(MOBILE_INTERVIEW_SCHEDULE_STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    const schedules = parsed.map(parseMobileInterviewSchedule);
    if (schedules.some((schedule) => !schedule)) return [];
    return (schedules as MobileInterviewSchedule[]).sort((first, second) => first.date.localeCompare(second.date));
  } catch {
    return [];
  }
}

export function saveMobileInterviewSchedules(
  storage: Pick<Storage, 'setItem'>,
  schedules: MobileInterviewSchedule[],
): void {
  storage.setItem(MOBILE_INTERVIEW_SCHEDULE_STORAGE_KEY, JSON.stringify(schedules));
}

export function parseMobileInterviewSchedule(value: unknown): MobileInterviewSchedule | undefined {
  if (!isRecord(value)
    || typeof value.id !== 'string'
    || !value.id
    || typeof value.title !== 'string'
    || !value.title.trim()
    || typeof value.date !== 'string'
    || !isCalendarDate(value.date)
    || !Array.isArray(value.setIds)
    || value.setIds.length === 0
    || !value.setIds.every((id) => typeof id === 'string' && id.length > 0)
    || new Set(value.setIds).size !== value.setIds.length
    || !Array.isArray(value.sectionIds)
    || !value.sectionIds.every((id) => typeof id === 'string')
    || (value.durationMinutes !== undefined && (!Number.isInteger(value.durationMinutes) || typeof value.durationMinutes !== 'number' || value.durationMinutes <= 0))
    || (value.questionTimeLimitSeconds !== undefined && (!Number.isInteger(value.questionTimeLimitSeconds) || typeof value.questionTimeLimitSeconds !== 'number' || value.questionTimeLimitSeconds <= 0))
    || (value.programQuestionTimeLimitSeconds !== undefined && (!Number.isInteger(value.programQuestionTimeLimitSeconds) || typeof value.programQuestionTimeLimitSeconds !== 'number' || value.programQuestionTimeLimitSeconds <= 0))
    || (value.randomizeQuestions !== undefined && typeof value.randomizeQuestions !== 'boolean')
    || (value.status !== 'planned' && value.status !== 'completed')
    || !isNonNegativeNumber(value.createdAt)
    || (value.completedAt !== undefined && !isNonNegativeNumber(value.completedAt))) return undefined;
  return {
    id: value.id,
    title: value.title,
    date: value.date,
    setIds: [...value.setIds] as string[],
    sectionIds: [...value.sectionIds] as string[],
    status: value.status,
    createdAt: value.createdAt,
    ...(typeof value.durationMinutes === 'number' ? { durationMinutes: value.durationMinutes } : {}),
    ...(typeof value.questionTimeLimitSeconds === 'number' ? { questionTimeLimitSeconds: value.questionTimeLimitSeconds } : {}),
    ...(typeof value.programQuestionTimeLimitSeconds === 'number' ? { programQuestionTimeLimitSeconds: value.programQuestionTimeLimitSeconds } : {}),
    ...(typeof value.randomizeQuestions === 'boolean' ? { randomizeQuestions: value.randomizeQuestions } : {}),
    ...(typeof value.completedAt === 'number' ? { completedAt: value.completedAt } : {}),
  };
}

function parsePrompt(
  value: unknown,
  allowLegacyTiming = false,
  defaultTimeLimit = 0,
  defaultRemaining = defaultTimeLimit,
  untimed = false,
): TimedMobileInterviewPrompt | undefined {
  if (!isRecord(value)
    || typeof value.id !== 'string'
    || typeof value.checklistId !== 'string'
    || typeof value.checklistTitle !== 'string'
    || typeof value.sectionId !== 'string'
    || typeof value.sectionTitle !== 'string'
    || typeof value.text !== 'string'
    || (value.codeTerms !== undefined && (!Array.isArray(value.codeTerms) || !value.codeTerms.every((term) => typeof term === 'string')))
    || (value.priority !== undefined && value.priority !== 'high' && value.priority !== 'low')
    || !Array.isArray(value.referenceItems)
    || !value.referenceItems.every(isChecklistItem)
    || typeof value.answered !== 'boolean'
    || typeof value.skipped !== 'boolean'
    || typeof value.important !== 'boolean'
    || typeof value.referenceRevealed !== 'boolean'
    || typeof value.note !== 'string'
    || (value.pickReason !== undefined && !['due', 'weak', 'new', 'priority', 'filler'].includes(String(value.pickReason)))) return undefined;
  const kind = value.kind === undefined ? undefined : value.kind;
  const options = value.options === undefined ? undefined : value.options;
  if ((kind !== undefined && kind !== 'short-answer' && kind !== 'coding' && kind !== 'mcq')
    || (value.referenceAnswer !== undefined && typeof value.referenceAnswer !== 'string')
    || (value.starterCode !== undefined && typeof value.starterCode !== 'string')
    || (options !== undefined && (!Array.isArray(options) || !options.every(isMobileInterviewOption)))
    || (value.correctOptionId !== undefined && typeof value.correctOptionId !== 'string')
    || (value.explanation !== undefined && typeof value.explanation !== 'string')
    || (value.answerText !== undefined && typeof value.answerText !== 'string')
    || (value.selectedOptionId !== undefined && value.selectedOptionId !== null && typeof value.selectedOptionId !== 'string')
    || (value.answerResult !== undefined && value.answerResult !== 'correct' && value.answerResult !== 'incorrect')
    || (value.codingProblemId !== undefined && (!Number.isInteger(value.codingProblemId) || typeof value.codingProblemId !== 'number' || value.codingProblemId <= 0))
    || (value.codingLanguage !== undefined && value.codingLanguage !== 'kotlin' && value.codingLanguage !== 'java')
    || (value.codingAnswers !== undefined && (!isRecord(value.codingAnswers)
      || Object.entries(value.codingAnswers).some(([language, code]) => (
        (language !== 'kotlin' && language !== 'java') || typeof code !== 'string'
      ))))
    || (value.codingStdin !== undefined && typeof value.codingStdin !== 'string')
    || (value.codingProblemCollapsed !== undefined && typeof value.codingProblemCollapsed !== 'boolean')
    || (value.codingRetryUsed !== undefined && typeof value.codingRetryUsed !== 'boolean')
    || (value.codingVerification !== undefined && !isMobileCodingVerification(value.codingVerification))
    || (kind === 'mcq' && (!options || options.length < 2 || typeof value.correctOptionId !== 'string'))) return undefined;
  if (kind === 'mcq' && options) {
    const optionIds = options.map((option) => option.id);
    const correctOptionId = typeof value.correctOptionId === 'string' ? value.correctOptionId : '';
    if (new Set(optionIds).size !== optionIds.length
      || !optionIds.includes(correctOptionId)
      || (typeof value.selectedOptionId === 'string' && !optionIds.includes(value.selectedOptionId))) return undefined;
  }
  const timeLimitSeconds = allowLegacyTiming && value.timeLimitSeconds === undefined
    ? defaultTimeLimit
    : value.timeLimitSeconds;
  const remainingSeconds = allowLegacyTiming && value.remainingSeconds === undefined
    ? defaultRemaining
    : value.remainingSeconds;
  const timeExpired = allowLegacyTiming && value.timeExpired === undefined ? false : value.timeExpired;
  if (!isNonNegativeNumber(timeLimitSeconds)
    || (!untimed && timeLimitSeconds === 0)
    || !isNonNegativeNumber(remainingSeconds)
    || remainingSeconds > timeLimitSeconds
    || typeof timeExpired !== 'boolean'
    || (timeExpired && remainingSeconds !== 0)
    || (untimed && timeExpired)) return undefined;
  return {
    id: value.id,
    checklistId: value.checklistId,
    checklistTitle: value.checklistTitle,
    sectionId: value.sectionId,
    sectionTitle: value.sectionTitle,
    text: value.text,
    ...(value.codeTerms ? { codeTerms: [...value.codeTerms] } : {}),
    ...(value.priority ? { priority: value.priority } : {}),
    referenceItems: value.referenceItems.map((item) => ({ ...item })),
    answered: value.answered,
    skipped: value.skipped,
    important: value.important,
    referenceRevealed: value.referenceRevealed,
    note: value.note,
    ...(kind ? { kind } : {}),
    ...(typeof value.referenceAnswer === 'string' ? { referenceAnswer: value.referenceAnswer } : {}),
    ...(typeof value.starterCode === 'string' ? { starterCode: value.starterCode } : {}),
    ...(options ? { options: options.map((option) => ({ ...option })) } : {}),
    ...(typeof value.correctOptionId === 'string' ? { correctOptionId: value.correctOptionId } : {}),
    ...(typeof value.explanation === 'string' ? { explanation: value.explanation } : {}),
    ...(typeof value.answerText === 'string' ? { answerText: value.answerText } : {}),
    ...(value.selectedOptionId === null || typeof value.selectedOptionId === 'string' ? { selectedOptionId: value.selectedOptionId } : {}),
    ...(value.answerResult === 'correct' || value.answerResult === 'incorrect' ? { answerResult: value.answerResult } : {}),
    ...(typeof value.codingProblemId === 'number' ? { codingProblemId: value.codingProblemId } : {}),
    ...(value.codingLanguage === 'kotlin' || value.codingLanguage === 'java' ? { codingLanguage: value.codingLanguage } : {}),
    ...(isRecord(value.codingAnswers) ? {
      codingAnswers: {
        ...(typeof value.codingAnswers.kotlin === 'string' ? { kotlin: value.codingAnswers.kotlin } : {}),
        ...(typeof value.codingAnswers.java === 'string' ? { java: value.codingAnswers.java } : {}),
      },
    } : {}),
    ...(typeof value.codingStdin === 'string' ? { codingStdin: value.codingStdin } : {}),
    ...(typeof value.codingProblemCollapsed === 'boolean' ? { codingProblemCollapsed: value.codingProblemCollapsed } : {}),
    ...(typeof value.codingRetryUsed === 'boolean' ? { codingRetryUsed: value.codingRetryUsed } : {}),
    ...(isMobileCodingVerification(value.codingVerification) ? { codingVerification: { ...value.codingVerification } } : {}),
    ...(typeof value.pickReason === 'string' ? { pickReason: value.pickReason as RevisionPickReason } : {}),
    timeLimitSeconds,
    remainingSeconds,
    timeExpired,
  };
}

function isMobileInterviewOption(value: unknown): value is MobileInterviewOption {
  return isRecord(value) && typeof value.id === 'string' && typeof value.text === 'string';
}

function isMobileCodingVerification(value: unknown): value is MobileCodingVerification {
  return isRecord(value)
    && (value.status === 'correct' || value.status === 'incorrect' || value.status === 'unavailable')
    && typeof value.output === 'string'
    && (value.message === undefined || typeof value.message === 'string')
    && (value.stderr === undefined || typeof value.stderr === 'string');
}

function isMobileInterviewPrompt(value: TimedMobileInterviewPrompt | undefined): value is TimedMobileInterviewPrompt {
  return value !== undefined;
}

function isChecklistItem(value: unknown): value is ChecklistItem {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.text === 'string'
    && (value.codeTerms === undefined || (Array.isArray(value.codeTerms) && value.codeTerms.every((term) => typeof term === 'string')))
    && (value.priority === undefined || value.priority === 'high' || value.priority === 'low');
}

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `mobile-interview-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}
