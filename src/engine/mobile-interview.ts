import type { ChecklistItem, SkillChecklist } from './interviews';

export type MobileInterviewTrack = 'kotlin' | 'spring-boot';
export type MobileInterviewStatus = 'running' | 'paused' | 'finished';

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
}

export const MOBILE_INTERVIEW_STORAGE_KEY = 'kotlin-interview-trainer-mobile-interview-v1';

export function getMobileInterviewPromptLimit(durationMinutes: number): number {
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) return 0;
  return Math.ceil(durationMinutes * 2 / 3);
}

const KOTLIN_CHECKLISTS = new Set([
  'backend-kotlin-spring-boot-backend-interview-checklist',
  'android-kotlin-interview-checklist-android-developer',
]);
const SPRING_BOOT_CHECKLISTS = new Set([
  'backend-kotlin-spring-boot-backend-interview-checklist',
  'backend-java-spring-boot-backend-interview-checklist',
]);
const SPRING_BOOT_KOTLIN_SECTIONS = new Set([
  'Kotlin + Spring Setup',
  'Dependency Injection and Beans',
  'REST APIs with Kotlin',
  'Coroutines in Spring',
  'Data Access',
  'Kotlin DSLs in Spring',
  'Security',
  'Error Handling and Design',
  'Testing',
  'Microservices, Messaging and Performance',
  'Build, Deployment and Migration',
  'Project Story',
  'Classic "Kotlin + Spring" questions (prepare short answers)',
]);
const SPRING_BOOT_JAVA_SECTIONS = new Set([
  'Spring Core',
  'Spring Boot Fundamentals',
  'REST API Development',
  'Spring Data JPA and Hibernate',
  'Databases and SQL',
  'Spring Security',
  'Microservices',
  'Messaging and Async Processing',
  'Caching and Performance',
  'Testing',
  'DevOps, Deployment and Observability',
  'Backend System Design',
  'Project and Behavioral',
  "What's New (know this to sound current)",
]);
const KOTLIN_EXCLUDED_SECTIONS = new Set(['Kotlin in Android-Specific Context']);

export function getMobileInterviewPrompts(
  catalog: SkillChecklist[],
  track: MobileInterviewTrack,
  sectionId?: string,
  highPriorityOnly = false,
): MobileInterviewPrompt[] {
  const allowedChecklists = track === 'kotlin' ? KOTLIN_CHECKLISTS : SPRING_BOOT_CHECKLISTS;

  const prompts = catalog.flatMap((checklist) => {
    if (!allowedChecklists.has(checklist.id)) return [];

    return checklist.sections.flatMap((section) => {
      const normalizedTitle = section.title
        .replace(/^\d+\.\s*/, '')
        .replace(/^Segment\s+\d+:\s*/i, '')
        .replace(/\s*⭐+\s*$/, '')
        .trim();
      const included = track === 'kotlin'
        ? !KOTLIN_EXCLUDED_SECTIONS.has(normalizedTitle)
        : checklist.id === 'backend-kotlin-spring-boot-backend-interview-checklist'
          ? SPRING_BOOT_KOTLIN_SECTIONS.has(normalizedTitle)
          : SPRING_BOOT_JAVA_SECTIONS.has(normalizedTitle);
      if (!included || (sectionId && section.id !== sectionId)) return [];

      return section.items
        .filter((item) => !highPriorityOnly || item.priority === 'high' || section.priority === 'high')
        .map((item) => ({
          id: item.id,
          checklistId: checklist.id,
          checklistTitle: checklist.title,
          sectionId: section.id,
          sectionTitle: normalizedTitle,
          text: item.text,
          ...(item.codeTerms ? { codeTerms: [...item.codeTerms] } : {}),
          ...(item.priority || section.priority ? { priority: item.priority ?? section.priority } : {}),
          referenceItems: section.items.map((referenceItem) => ({ ...referenceItem })),
          answered: false,
          skipped: false,
          important: false,
          referenceRevealed: false,
          note: '',
        }));
    });
  });

  const groupedPrompts = new Map<string, MobileInterviewPrompt[]>();
  prompts.forEach((prompt) => {
    const sourceGroup = groupedPrompts.get(prompt.checklistId);
    if (sourceGroup) sourceGroup.push(prompt);
    else groupedPrompts.set(prompt.checklistId, [prompt]);
  });
  const sourceGroups = [...groupedPrompts.values()];
  const interleaved: MobileInterviewPrompt[] = [];
  for (let index = 0; sourceGroups.some((group) => index < group.length); index += 1) {
    sourceGroups.forEach((group) => {
      if (group[index]) interleaved.push(group[index]);
    });
  }
  return interleaved;
}

export function createMobileInterviewSession(
  prompts: MobileInterviewPrompt[],
  track: MobileInterviewTrack,
  durationMinutes: number,
  now = Date.now(),
): MobileInterviewSession {
  if (prompts.length === 0) throw new Error('Choose at least one interview prompt.');
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) throw new Error('Session duration must be greater than zero.');

  const durationSeconds = Math.round(durationMinutes * 60);
  const questionDurationSeconds = Math.ceil(durationSeconds / prompts.length);
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
    endsAt: now + questionDurationSeconds * 1000,
    status: 'running',
    activeIndex: 0,
    prompts: sessionPrompts,
    startedAt: now,
    finishedAt: null,
  };
}

export function getMobileInterviewRemainingSeconds(session: MobileInterviewSession, now = Date.now()): number {
  if (session.status !== 'running' || session.endsAt === null) return session.remainingSeconds;
  return Math.max(0, Math.ceil((session.endsAt - now) / 1000));
}

export function pauseMobileInterviewSession(session: MobileInterviewSession, now = Date.now()): MobileInterviewSession {
  if (session.status !== 'running') return session;
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
  if (session.status !== 'paused' || session.remainingSeconds <= 0 || session.prompts[session.activeIndex].timeExpired) return session;
  return { ...session, status: 'running', endsAt: now + session.remainingSeconds * 1000 };
}

export function moveMobileInterviewToPrompt(
  session: MobileInterviewSession,
  index: number,
  now = Date.now(),
): MobileInterviewSession {
  if (session.status === 'finished') return session;
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
  if (session.status !== 'running') return session;
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
    || (value.track !== 'kotlin' && value.track !== 'spring-boot')
    || !isNonNegativeNumber(value.durationSeconds)
    || value.durationSeconds === 0
    || (value.questionDurationSeconds !== undefined && (!isNonNegativeNumber(value.questionDurationSeconds) || value.questionDurationSeconds === 0))
    || !isNonNegativeNumber(value.remainingSeconds)
    || (value.endsAt !== null && !isNonNegativeNumber(value.endsAt))
    || (value.status !== 'running' && value.status !== 'paused' && value.status !== 'finished')
    || typeof value.activeIndex !== 'number'
    || !Number.isInteger(value.activeIndex)
    || !Array.isArray(value.prompts)
    || value.prompts.length === 0
    || !isNonNegativeNumber(value.startedAt)
    || (value.finishedAt !== null && !isNonNegativeNumber(value.finishedAt))) return undefined;

  const isLegacySession = value.questionDurationSeconds === undefined;
  const questionDurationSeconds = typeof value.questionDurationSeconds === 'number'
    ? value.questionDurationSeconds
    : Math.ceil(value.durationSeconds / value.prompts.length);
  const parsedPrompts = value.prompts.map((prompt) => parsePrompt(
    prompt,
    isLegacySession,
    questionDurationSeconds,
    value.status === 'finished' ? 0 : questionDurationSeconds,
  ));
  if (!parsedPrompts.every(isMobileInterviewPrompt)) return undefined;
  const prompts = parsedPrompts;
  if (value.activeIndex < 0 || value.activeIndex >= prompts.length) return undefined;
  const remainingSeconds = isLegacySession ? prompts[value.activeIndex].remainingSeconds : value.remainingSeconds;
  const endsAt = isLegacySession && value.status === 'running'
    ? Date.now() + remainingSeconds * 1000
    : value.endsAt;
  if ((value.status === 'running') !== (endsAt !== null)) return undefined;
  if (prompts[value.activeIndex].remainingSeconds !== remainingSeconds) return undefined;

  return {
    version: 1,
    id: value.id,
    track: value.track,
    durationSeconds: value.durationSeconds,
    questionDurationSeconds,
    remainingSeconds,
    endsAt,
    status: value.status,
    activeIndex: value.activeIndex,
    prompts,
    startedAt: value.startedAt,
    finishedAt: value.finishedAt,
  };
}

export function loadMobileInterviewSession(storage: Pick<Storage, 'getItem'>): MobileInterviewSession | null {
  const stored = storage.getItem(MOBILE_INTERVIEW_STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = parseMobileInterviewSession(JSON.parse(stored));
    if (!parsed) return null;
    if (parsed.status === 'running') {
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

export function saveMobileInterviewSession(
  storage: Pick<Storage, 'setItem' | 'removeItem'>,
  session: MobileInterviewSession | null,
): void {
  if (session) storage.setItem(MOBILE_INTERVIEW_STORAGE_KEY, JSON.stringify(session));
  else storage.removeItem(MOBILE_INTERVIEW_STORAGE_KEY);
}

function parsePrompt(
  value: unknown,
  allowLegacyTiming = false,
  defaultTimeLimit = 0,
  defaultRemaining = defaultTimeLimit,
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
  const timeLimitSeconds = allowLegacyTiming && value.timeLimitSeconds === undefined
    ? defaultTimeLimit
    : value.timeLimitSeconds;
  const remainingSeconds = allowLegacyTiming && value.remainingSeconds === undefined
    ? defaultRemaining
    : value.remainingSeconds;
  const timeExpired = allowLegacyTiming && value.timeExpired === undefined ? false : value.timeExpired;
  if (!isNonNegativeNumber(timeLimitSeconds)
    || timeLimitSeconds === 0
    || !isNonNegativeNumber(remainingSeconds)
    || remainingSeconds > timeLimitSeconds
    || typeof timeExpired !== 'boolean'
    || (timeExpired && remainingSeconds !== 0)) return undefined;
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
    timeLimitSeconds,
    remainingSeconds,
    timeExpired,
  };
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
