import { describe, expect, it } from 'vitest';
import {
  createMobileInterviewSession,
  expireMobileInterviewPrompt,
  finishMobileInterviewSession,
  getMobileInterviewPromptLimit,
  getMobileInterviewRemainingSeconds,
  loadMobileInterviewHistory,
  loadMobileInterviewSchedules,
  loadMobileInterviewSession,
  MOBILE_INTERVIEW_HISTORY_STORAGE_KEY,
  MOBILE_INTERVIEW_SCHEDULE_STORAGE_KEY,
  MOBILE_INTERVIEW_STORAGE_KEY,
  mergeMobileInterviewBackups,
  moveMobileInterviewToPrompt,
  parseMobileInterviewBackup,
  parseMobileInterviewSession,
  parseMobileInterviewSchedule,
  pauseMobileInterviewSession,
  resumeMobileInterviewSession,
  saveMobileInterviewHistory,
  saveMobileInterviewSchedules,
  saveMobileInterviewSession,
  type MobileInterviewPrompt,
  type MobileInterviewSchedule,
} from './mobile-interview';

function prompt(id: string): MobileInterviewPrompt {
  return {
    id,
    checklistId: 'mobile-set:kotlin-essentials',
    checklistTitle: 'Kotlin Essentials',
    sectionId: 'mobile-section:null-safety',
    sectionTitle: 'Null safety',
    text: `Question ${id}`,
    referenceItems: [],
    answered: false,
    skipped: false,
    important: false,
    referenceRevealed: false,
    note: '',
    kind: 'short-answer',
    referenceAnswer: 'Example answer',
  };
}

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

const schedule: MobileInterviewSchedule = {
  id: 'schedule-1',
  title: 'Kotlin mock interview',
  date: '2026-10-06',
  setIds: ['mobile-set:kotlin-essentials'],
  sectionIds: [],
  randomizeQuestions: true,
  status: 'planned',
  createdAt: 1_000,
};

describe('mobile interview sessions', () => {
  it('scales the question round to the selected time limit', () => {
    expect([15, 30, 45].map(getMobileInterviewPromptLimit)).toEqual([10, 20, 30]);
    expect(getMobileInterviewPromptLimit(0)).toBe(0);
  });

  it('starts a timed session and calculates remaining time from its end timestamp', () => {
    const session = createMobileInterviewSession([prompt('one'), prompt('two')], 'kotlin', 15, 1_000);

    expect(session).toMatchObject({
      track: 'kotlin',
      durationSeconds: 900,
      questionDurationSeconds: 450,
      remainingSeconds: 450,
      endsAt: 451_000,
      status: 'running',
      activeIndex: 0,
    });

    expect(getMobileInterviewRemainingSeconds(session, 31_001)).toBe(420);
  });

  it('sets the same independent countdown duration for each selected question', () => {
    const session = createMobileInterviewSession([prompt('one'), prompt('two'), prompt('three')], 'kotlin', 0, 1_000, {
      questionTimeLimitSeconds: 60,
    });

    expect(session).toMatchObject({
      durationSeconds: 180,
      questionDurationSeconds: 60,
      remainingSeconds: 60,
      endsAt: 61_000,
    });
    expect(session.prompts.map((item) => item.timeLimitSeconds)).toEqual([60, 60, 60]);
  });

  it('creates untimed sessions that preserve section order through pause, resume, and navigation', () => {
    const prompts = [prompt('section-one-first'), {
      ...prompt('section-two'),
      sectionId: 'mobile-section:coroutines',
      sectionTitle: 'Coroutines',
    }, prompt('section-one-second')];
    const session = createMobileInterviewSession(prompts, 'kotlin', 0, 1_000, { untimed: true });
    const paused = pauseMobileInterviewSession(session, 20_000);
    const resumed = resumeMobileInterviewSession(paused, 1_000_000);
    const next = moveMobileInterviewToPrompt(resumed, 1, 5_000_000);
    const finished = finishMobileInterviewSession(next, 9_000_000);

    expect(session).toMatchObject({
      untimed: true,
      durationSeconds: 0,
      questionDurationSeconds: 0,
      remainingSeconds: 0,
      endsAt: null,
      status: 'running',
    });
    expect(session.prompts.every((item) => item.timeLimitSeconds === 0 && !item.timeExpired)).toBe(true);
    expect(paused.status).toBe('paused');
    expect(resumed).toMatchObject({ status: 'running', endsAt: null });
    expect(next.activeIndex).toBe(1);
    expect(next.prompts.map((item) => item.id)).toEqual(['section-one-first', 'section-two', 'section-one-second']);
    expect(finished.status).toBe('finished');
    expect(parseMobileInterviewSession(session)).toMatchObject({ untimed: true, status: 'running' });
  });

  it('preserves independent question time when moving, pausing and resuming', () => {
    const session = createMobileInterviewSession([prompt('one'), prompt('two')], 'kotlin', 15, 1_000);
    const next = moveMobileInterviewToPrompt(session, 1, 31_001);
    const paused = pauseMobileInterviewSession(next, 61_001);
    const resumed = resumeMobileInterviewSession(paused, 100_000);

    expect(next).toMatchObject({ activeIndex: 1, remainingSeconds: 450, endsAt: 481_001 });
    expect(next.prompts[0].remainingSeconds).toBe(420);
    expect(paused).toMatchObject({ status: 'paused', remainingSeconds: 420, endsAt: null });
    expect(paused.prompts[1].remainingSeconds).toBe(420);
    expect(resumed).toMatchObject({ status: 'running', remainingSeconds: 420, endsAt: 520_000 });
    expect(getMobileInterviewRemainingSeconds(resumed, 200_000)).toBe(320);
  });

  it('automatically expires one question and starts the next question with its own full clock', () => {
    const session = createMobileInterviewSession([prompt('one'), prompt('two')], 'kotlin', 15, 1_000);
    const secondQuestion = expireMobileInterviewPrompt(session, 451_000);

    expect(secondQuestion).toMatchObject({ activeIndex: 1, status: 'running', remainingSeconds: 450, endsAt: 901_000 });
    expect(secondQuestion.prompts[0]).toMatchObject({ timeExpired: true, remainingSeconds: 0 });
    expect(secondQuestion.prompts[1]).toMatchObject({ timeExpired: false, remainingSeconds: 450 });
  });

  it('keeps in-progress answer drafts when a question times out', () => {
    const prompts = [prompt('one'), prompt('two')].map((item, index) => index === 0
      ? { ...item, answerText: 'My saved explanation', important: true }
      : item);
    const session = createMobileInterviewSession(prompts, 'kotlin', 15, 1_000);
    const expired = expireMobileInterviewPrompt(session, 451_000);

    expect(expired.prompts[0]).toMatchObject({
      timeExpired: true,
      answerText: 'My saved explanation',
      important: true,
    });
  });

  it('stores completed history and independent schedules in the mobile interview backup', () => {
    const storage = memoryStorage();
    const finished = finishMobileInterviewSession(
      createMobileInterviewSession([prompt('one'), prompt('two')], 'kotlin', 15, 1_000),
      2_000,
    );
    const second = { ...finished, id: 'second-session', finishedAt: 3_000 };
    saveMobileInterviewHistory(storage, [finished]);
    saveMobileInterviewSchedules(storage, [schedule]);

    expect(storage.getItem(MOBILE_INTERVIEW_HISTORY_STORAGE_KEY)).toBeTruthy();
    expect(storage.getItem(MOBILE_INTERVIEW_SCHEDULE_STORAGE_KEY)).toBeTruthy();
    expect(loadMobileInterviewHistory(storage)).toHaveLength(1);
    expect(loadMobileInterviewSchedules(storage)).toEqual([schedule]);
    expect(parseMobileInterviewBackup({ activeSession: null, history: [finished], schedules: [schedule] }))
      .toMatchObject({ history: [finished], schedules: [schedule] });
    expect(parseMobileInterviewBackup({ activeSession: null, history: [finished] })?.schedules).toEqual([]);
    expect(mergeMobileInterviewBackups(
      { activeSession: null, history: [finished], schedules: [schedule] },
      { activeSession: null, history: [second], schedules: [{ ...schedule, id: 'schedule-2' }] },
    )).toMatchObject({ history: [second, finished], schedules: [schedule, { ...schedule, id: 'schedule-2' }] });
    expect(parseMobileInterviewBackup({ activeSession: null, history: [{ id: 'invalid' }] })).toBeUndefined();
  });

  it('validates independent calendar sessions', () => {
    expect(parseMobileInterviewSchedule(schedule)).toEqual(schedule);
    expect(parseMobileInterviewSchedule({ ...schedule, date: '2026-02-31' })).toBeUndefined();
    expect(parseMobileInterviewSchedule({ ...schedule, setIds: [] })).toBeUndefined();
    expect(parseMobileInterviewBackup({ activeSession: null, history: [], schedules: [{ ...schedule, durationMinutes: 0 }] }))
      .toBeUndefined();
    expect(parseMobileInterviewSchedule({ ...schedule, randomizeQuestions: false })).toMatchObject({ randomizeQuestions: false });
    expect(parseMobileInterviewSchedule({ ...schedule, questionTimeLimitSeconds: 90 })).toMatchObject({ questionTimeLimitSeconds: 90 });
    expect(parseMobileInterviewSchedule({ ...schedule, questionTimeLimitSeconds: 0 })).toBeUndefined();
  });

  it('migrates a saved untimed active session to an independently timed question clock', () => {
    const storage = memoryStorage();
    const untimed = createMobileInterviewSession([prompt('one'), prompt('two')], 'kotlin', 0, 1_000, { untimed: true });
    saveMobileInterviewSession(storage, untimed);

    expect(loadMobileInterviewSession(storage)).toMatchObject({
      untimed: false,
      questionDurationSeconds: 120,
      remainingSeconds: 120,
      prompts: [
        { timeLimitSeconds: 120, remainingSeconds: 120 },
        { timeLimitSeconds: 120, remainingSeconds: 120 },
      ],
    });
  });

  it('recovers persisted sessions after refresh and removes the active record when cleared', () => {
    const storage = memoryStorage();
    const now = Date.now();
    const session = createMobileInterviewSession([prompt('one'), prompt('two')], 'kotlin', 15, now);
    saveMobileInterviewSession(storage, session);

    expect(storage.getItem(MOBILE_INTERVIEW_STORAGE_KEY)).toBeTruthy();
    expect(loadMobileInterviewSession(storage)).toMatchObject({ status: 'running' });
    const paused = pauseMobileInterviewSession(session, now + 31_000);
    saveMobileInterviewSession(storage, paused);
    expect(loadMobileInterviewSession(storage)).toMatchObject({ status: 'paused', remainingSeconds: 419 });
    const finished = finishMobileInterviewSession(paused, now + 32_000);
    saveMobileInterviewSession(storage, finished);
    expect(loadMobileInterviewSession(storage)).toMatchObject({ status: 'finished', remainingSeconds: 419 });

    saveMobileInterviewSession(storage, null);
    expect(storage.getItem(MOBILE_INTERVIEW_STORAGE_KEY)).toBeNull();
  });

  it('rejects malformed or internally inconsistent saved sessions', () => {
    const session = createMobileInterviewSession([prompt('one'), prompt('two')], 'kotlin', 15, 1_000);

    expect(parseMobileInterviewSession({ ...session, activeIndex: 999 })).toBeUndefined();
    expect(parseMobileInterviewSession({ ...session, status: 'paused', endsAt: 2_000 })).toBeUndefined();
    expect(parseMobileInterviewSession({ ...session, prompts: [{ ...session.prompts[0], note: null }, session.prompts[1]] })).toBeUndefined();
  });

  it('migrates a saved session from the former shared timer to per-question clocks', () => {
    const session = createMobileInterviewSession([prompt('one'), prompt('two')], 'kotlin', 15, Date.now());
    const { questionDurationSeconds: _questionDurationSeconds, ...legacySession } = session;
    const legacy = {
      ...legacySession,
      remainingSeconds: 700,
      endsAt: Date.now() + 700_000,
      prompts: session.prompts.map(({ timeLimitSeconds: _timeLimit, remainingSeconds: _remaining, timeExpired: _expired, ...item }) => item),
    };

    const migrated = parseMobileInterviewSession(legacy);
    expect(migrated).toMatchObject({ status: 'running', questionDurationSeconds: 450, remainingSeconds: 450 });
    expect(migrated?.prompts.every((item) => item.timeLimitSeconds === 450 && item.remainingSeconds === 450)).toBe(true);
  });
});
