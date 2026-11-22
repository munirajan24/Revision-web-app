import { isCalendarDate, type ChecklistItem } from './interviews';

export type MobileInterviewTrack = 'kotlin' | 'spring-boot' | 'mixed';
export type MobileInterviewStatus = 'running' | 'paused' | 'finished';
export type MobileInterviewQuestionKind = 'short-answer' | 'coding' | 'mcq';
export type MobileInterviewAnswerResult = 'correct' | 'incorrect';

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
  randomizeQuestions?: boolean;
  status: 'planned' | 'completed';
  createdAt: number;
  completedAt?: number;
}

export const MOBILE_INTERVIEW_STORAGE_KEY = 'kotlin-interview-trainer-mobile-interview-v1';
export const MOBILE_INTERVIEW_HISTORY_STORAGE_KEY = 'kotlin-interview-trainer-mobile-interview-history-v1';
export const MOBILE_INTERVIEW_SCHEDULE_STORAGE_KEY = 'kotlin-interview-trainer-mobile-interview-schedule-v1';

export function getMobileInterviewPromptLimit(durationMinutes: number): number {
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) return 0;
  return Math.ceil(durationMinutes * 2 / 3);
}

export function createMobileInterviewSession(
  prompts: MobileInterviewPrompt[],
  track: MobileInterviewTrack,
  durationMinutes: number,
  now = Date.now(),
  options: { title?: string; setIds?: string[]; scheduleId?: string; untimed?: boolean; questionTimeLimitSeconds?: number } = {},
): MobileInterviewSession {
  if (prompts.length === 0) throw new Error('Choose at least one interview prompt.');
  if (options.questionTimeLimitSeconds !== undefined
    && (!Number.isInteger(options.questionTimeLimitSeconds) || options.questionTimeLimitSeconds <= 0)) {
    throw new Error('Question time limit must be a positive number of seconds.');
  }
  if (!options.untimed && options.questionTimeLimitSeconds === undefined
    && (!Number.isFinite(durationMinutes) || durationMinutes <= 0)) throw new Error('Session duration must be greater than zero.');

  const durationSeconds = options.untimed
    ? 0
    : options.questionTimeLimitSeconds !== undefined
      ? options.questionTimeLimitSeconds * prompts.length
      : Math.round(durationMinutes * 60);
  const questionDurationSeconds = options.untimed
    ? 0
    : options.questionTimeLimitSeconds ?? Math.ceil(durationSeconds / prompts.length);
  const sessionPrompts: TimedMobileInterviewPrompt[] = prompts.map((prompt) => ({
    ...prompt,
    referenceItems: prompt.referenceItems.map((item) => ({ ...item })),
    timeLimitSeconds: questionDurationSeconds,
    remainingSeconds: questionDurationSeconds,
    timeExpired: false,
  }));
  return {
    version: 1,
    id: createId(),
    track,
    durationSeconds,
    questionDurationSeconds,
    remainingSeconds: questionDurationSeconds,
    endsAt: options.untimed ? null : now + questionDurationSeconds * 1000,
    status: 'running',
    activeIndex: 0,
    prompts: sessionPrompts,
    startedAt: now,
    finishedAt: null,
    ...(options.title ? { title: options.title } : {}),
    ...(options.setIds ? { setIds: [...options.setIds] } : {}),
    ...(options.scheduleId ? { scheduleId: options.scheduleId } : {}),
    untimed: options.untimed === true,
  };
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
  if (remainingSeconds === 0) {
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
    ? { ...prompt, remainingSeconds: 0, timeExpired: true }
    : prompt);
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
}

export function loadMobileInterviewBackup(storage: Pick<Storage, 'getItem'>): MobileInterviewBackup {
  return {
    activeSession: loadMobileInterviewSession(storage),
    history: loadMobileInterviewHistory(storage),
    schedules: loadMobileInterviewSchedules(storage),
  };
}

export function saveMobileInterviewBackup(
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>,
  backup: MobileInterviewBackup,
): void {
  saveMobileInterviewSession(storage, backup.activeSession);
  saveMobileInterviewHistory(storage, backup.history);
  saveMobileInterviewSchedules(storage, backup.schedules);
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
  if (!history.every((session) => session?.status === 'finished')
    || !schedules || !schedules.every((schedule) => schedule !== undefined)) return undefined;
  return { activeSession, history: history as MobileInterviewSession[], schedules: schedules as MobileInterviewSchedule[] };
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
  };
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
    || typeof value.note !== 'string') return undefined;
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
    timeLimitSeconds,
    remainingSeconds,
    timeExpired,
  };
}

function isMobileInterviewOption(value: unknown): value is MobileInterviewOption {
  return isRecord(value) && typeof value.id === 'string' && typeof value.text === 'string';
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
