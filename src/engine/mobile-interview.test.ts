import { describe, expect, it } from 'vitest';
import {
  createMobileInterviewSession,
  clearMobileInterviewQuestionStats,
  expireMobileInterviewPrompt,
  finishMobileInterviewSession,
  formatMobileInterviewQaText,
  getMobileInterviewPromptLimit,
  getMobileInterviewRemainingSeconds,
  isProgramInterviewPrompt,
  loadMobileInterviewHistory,
  loadMobileInterviewBackup,
  loadMobileInterviewQuestionStats,
  loadMobileInterviewSchedules,
  loadMobileInterviewSession,
  MOBILE_INTERVIEW_HISTORY_STORAGE_KEY,
  MOBILE_INTERVIEW_QUESTION_STATS_STORAGE_KEY,
  MOBILE_INTERVIEW_SCHEDULE_STORAGE_KEY,
  MOBILE_INTERVIEW_STORAGE_KEY,
  mergeMobileInterviewBackups,
  moveMobileInterviewToPrompt,
  parseMobileInterviewBackup,
  parseMobileInterviewSession,
  parseMobileInterviewSchedule,
  pauseMobileInterviewSession,
  recordMobileInterviewQuestionAnswerResult,
  recordMobileInterviewQuestionAttendance,
  recordMobileInterviewQuestionSkipped,
  resumeMobileInterviewSession,
  retryCodingInterviewPromptWithExtraTime,
  saveMobileInterviewHistory,
  saveMobileInterviewBackup,
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

describe('mobile interview question statistics', () => {
  it('counts question attendance once per question in an interview session', () => {
    const storage = memoryStorage();

    recordMobileInterviewQuestionAttendance(storage, 'session-1', 'question-1');
    recordMobileInterviewQuestionAttendance(storage, 'session-1', 'question-1');
    recordMobileInterviewQuestionAttendance(storage, 'session-2', 'question-1');

    expect(loadMobileInterviewQuestionStats(storage)).toEqual({
      'question-1': { attended: 2, correct: 0, wrong: 0, skipped: 0 },
    });
  });

  it('tracks correct and wrong answers once per question and updates a changed self-assessment', () => {
    const storage = memoryStorage();

    recordMobileInterviewQuestionAnswerResult(storage, 'session-1', 'question-1', 'incorrect');
    recordMobileInterviewQuestionAnswerResult(storage, 'session-1', 'question-1', 'incorrect');
    recordMobileInterviewQuestionAnswerResult(storage, 'session-2', 'question-1', 'correct');

    expect(loadMobileInterviewQuestionStats(storage)).toEqual({
      'question-1': { attended: 2, correct: 1, wrong: 1, skipped: 0 },
    });

    recordMobileInterviewQuestionAnswerResult(storage, 'session-1', 'question-1', 'correct');

    expect(loadMobileInterviewQuestionStats(storage)).toEqual({
      'question-1': { attended: 2, correct: 2, wrong: 0, skipped: 0 },
    });
  });

  it('records attendance when an answer result is saved, even if the caller omits attendance', () => {
    const storage = memoryStorage();

    recordMobileInterviewQuestionAnswerResult(storage, 'session-1', 'question-1', 'correct');
    recordMobileInterviewQuestionAnswerResult(storage, 'session-1', 'question-1', 'incorrect');
    recordMobileInterviewQuestionSkipped(storage, 'session-1', 'question-1');

    expect(loadMobileInterviewQuestionStats(storage)).toEqual({
      'question-1': { attended: 1, correct: 0, wrong: 1, skipped: 0 },
    });
  });

  it('counts skipped questions once per interview', () => {
    const storage = memoryStorage();

    recordMobileInterviewQuestionSkipped(storage, 'session-1', 'question-1');
    recordMobileInterviewQuestionSkipped(storage, 'session-1', 'question-1');
    recordMobileInterviewQuestionSkipped(storage, 'session-2', 'question-1');

    expect(loadMobileInterviewQuestionStats(storage)).toEqual({
      'question-1': { attended: 0, correct: 0, wrong: 0, skipped: 2 },
    });

    recordMobileInterviewQuestionAttendance(storage, 'session-1', 'question-1');

    expect(loadMobileInterviewQuestionStats(storage)).toEqual({
      'question-1': { attended: 1, correct: 0, wrong: 0, skipped: 1 },
    });
  });

  it('counts an empty coding submission as skipped, not attended', () => {
    const storage = memoryStorage();

    recordMobileInterviewQuestionSkipped(storage, 'session-1', 'coding-question');

    expect(loadMobileInterviewQuestionStats(storage)).toEqual({
      'coding-question': { attended: 0, correct: 0, wrong: 0, skipped: 1 },
    });
  });

  it('replaces a skipped count with attendance and the eventual answer result', () => {
    const storage = memoryStorage();

    recordMobileInterviewQuestionSkipped(storage, 'session-1', 'question-1');
    recordMobileInterviewQuestionAttendance(storage, 'session-1', 'question-1');
    recordMobileInterviewQuestionAnswerResult(storage, 'session-1', 'question-1', 'incorrect');

    expect(loadMobileInterviewQuestionStats(storage)).toEqual({
      'question-1': { attended: 1, correct: 0, wrong: 1, skipped: 0 },
    });

    recordMobileInterviewQuestionAnswerResult(storage, 'session-1', 'question-1', 'correct');

    expect(loadMobileInterviewQuestionStats(storage)).toEqual({
      'question-1': { attended: 1, correct: 1, wrong: 0, skipped: 0 },
    });
  });

  it('keeps skip and attendance mutually exclusive for the same session and question', () => {
    const storage = memoryStorage();

    recordMobileInterviewQuestionSkipped(storage, 'session-1', 'question-1');
    recordMobileInterviewQuestionAttendance(storage, 'session-1', 'question-1');
    recordMobileInterviewQuestionSkipped(storage, 'session-1', 'question-1');

    expect(loadMobileInterviewQuestionStats(storage)).toEqual({
      'question-1': { attended: 1, correct: 0, wrong: 0, skipped: 0 },
    });
  });

  it('clears saved statistics', () => {
    const storage = memoryStorage();
    recordMobileInterviewQuestionAttendance(storage, 'session-1', 'question-1');

    clearMobileInterviewQuestionStats(storage);

    expect(storage.getItem(MOBILE_INTERVIEW_QUESTION_STATS_STORAGE_KEY)).toBeNull();
    expect(loadMobileInterviewQuestionStats(storage)).toEqual({});
  });

  it('discards the previous open-question counts that were recorded merely by viewing questions', () => {
    const storage = memoryStorage();
    storage.setItem(MOBILE_INTERVIEW_QUESTION_STATS_STORAGE_KEY, JSON.stringify({
      version: 1,
      questions: { 'question-1': { attended: 1, correct: 0 } },
      attendanceEvents: ['["session-1","question-1"]'],
      correctEvents: [],
    }));

    expect(loadMobileInterviewQuestionStats(storage)).toEqual({});
  });
});

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

  it('uses the secondary timer for program-bank or program-section questions only', () => {
    const prompts = [
      prompt('regular'),
      { ...prompt('program-bank'), checklistTitle: 'Programming Questions' },
      { ...prompt('program-section'), sectionTitle: 'Program Exercises' },
      { ...prompt('generated-coding'), checklistTitle: 'Kotlin Coding', sectionTitle: 'Kotlin Coding', kind: 'coding' as const },
    ];
    const session = createMobileInterviewSession(prompts, 'kotlin', 0, 1_000, {
      questionTimeLimitSeconds: 120,
      programQuestionTimeLimitSeconds: 900,
    });

    expect(prompts.map(isProgramInterviewPrompt)).toEqual([false, true, true, true]);
    expect(session.durationSeconds).toBe(2_820);
    expect(session.prompts.map((item) => item.timeLimitSeconds)).toEqual([120, 900, 900, 900]);
    expect(moveMobileInterviewToPrompt(session, 1, 2_000)).toMatchObject({
      activeIndex: 1,
      questionDurationSeconds: 120,
      remainingSeconds: 900,
      endsAt: 902_000,
    });
  });

  it('uses the selected program timer for coding questions and preserves editor memory in saved sessions', () => {
    const codingPrompt = {
      ...prompt('coding'),
      kind: 'coding' as const,
      codingProblemId: 7,
      codingLanguage: 'java' as const,
      codingAnswers: { kotlin: 'fun main() {}', java: 'class Main {}' },
      codingStdin: 'sample input',
      codingVerification: { status: 'correct' as const, output: '42' },
    };
    const session = createMobileInterviewSession([codingPrompt], 'mixed', 0, 1_000, {
      questionTimeLimitSeconds: 60,
      programQuestionTimeLimitSeconds: 900,
    });
    const restored = parseMobileInterviewSession(session);

    expect(session.prompts[0].timeLimitSeconds).toBe(900);
    expect(session.durationSeconds).toBe(900);
    expect(restored?.prompts[0]).toMatchObject({
      codingProblemId: 7,
      codingLanguage: 'java',
      codingAnswers: { kotlin: 'fun main() {}', java: 'class Main {}' },
      codingStdin: 'sample input',
      codingVerification: { status: 'correct', output: '42' },
    });

  });

  it('applies the selected program duration to coding questions and leaves regular questions unchanged', () => {
    const prompts = [
      prompt('regular'),
      {
        ...prompt('coding'),
        kind: 'coding' as const,
        codingProblemId: 7,
        codingLanguage: 'kotlin' as const,
      },
    ];
    const session = createMobileInterviewSession(prompts, 'mixed', 0, 1_000, {
      questionTimeLimitSeconds: 120,
      programQuestionTimeLimitSeconds: 600,
    });

    expect(session.prompts.map((item) => item.timeLimitSeconds)).toEqual([120, 600]);
    expect(session.durationSeconds).toBe(720);
    expect(session.remainingSeconds).toBe(120);
  });

  it('formats the full interview with reference and submitted answers for text export', () => {
    const prompts = [
      { ...prompt('one'), text: 'What is null safety?', answerText: 'Avoid null pointer exceptions.' },
      {
        ...prompt('two'),
        text: 'Choose the correct option.',
        kind: 'mcq' as const,
        options: [{ id: 'a', text: 'Option A' }, { id: 'b', text: 'Option B' }],
        correctOptionId: 'b',
        selectedOptionId: 'a',
      },
      {
        ...prompt('three'),
        text: 'Write a Kotlin program.',
        kind: 'coding' as const,
        referenceAnswer: 'fun main() { println("hello") }',
        codingAnswers: { kotlin: 'fun main() { println("hello") }', java: 'class Main { }' },
      },
    ];
    const session = createMobileInterviewSession(prompts, 'kotlin', 15, 1_000, { questionTimeLimitSeconds: 60 });
    const text = formatMobileInterviewQaText({ ...session, title: 'Kotlin Review' });

    expect(text).toContain('Kotlin Review — Questions & Answers');
    expect(text).toContain('Question 1 — Null safety\nWhat is null safety?\n\nReference answer:\nExample answer\n\nYour answer:\nAvoid null pointer exceptions.');
    expect(text).toContain('Question 2 — Null safety\nChoose the correct option.\n\nReference answer:\nCorrect option: Option B\nExample answer\n\nYour answer:\nOption A');
    expect(text).toContain('Question 3 — Null safety\nWrite a Kotlin program.\n\nReference answer:\nfun main() { println("hello") }\n\nYour answer:\nKotlin code:\nfun main() { println("hello") }\n\nJava code:\nclass Main { }');
    expect(text).toContain('----------------------------------------');
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

  it('keeps an expired coding question active and paused for answer verification', () => {
    const codingPrompt = {
      ...prompt('coding'),
      kind: 'coding' as const,
      codingProblemId: 7,
      codingLanguage: 'java' as const,
    };
    const session = createMobileInterviewSession([codingPrompt, prompt('next')], 'kotlin', 15, 1_000);
    const expired = expireMobileInterviewPrompt(session, 301_000);

    expect(expired).toMatchObject({
      activeIndex: 0,
      status: 'paused',
      remainingSeconds: 0,
      endsAt: null,
    });
    expect(expired.prompts[0]).toMatchObject({ answered: true, timeExpired: true, remainingSeconds: 0 });
    expect(expired.prompts[1]).toMatchObject({ answered: false, timeExpired: false });
  });

  it('grants one coding retry with one quarter of the original time limit', () => {
    const codingPrompt = {
      ...prompt('coding'),
      kind: 'coding' as const,
      codingProblemId: 7,
      codingVerification: { status: 'incorrect' as const, output: 'wrong' },
      answerResult: 'incorrect' as const,
    };
    const started = createMobileInterviewSession([codingPrompt, prompt('next')], 'kotlin', 0, 1_000, {
      questionTimeLimitSeconds: 300,
    });
    const expired = expireMobileInterviewPrompt(started, 301_000);
    const retried = retryCodingInterviewPromptWithExtraTime(expired, 302_000);

    expect(retried).toMatchObject({
      status: 'running',
      remainingSeconds: 75,
      endsAt: 377_000,
      durationSeconds: 675,
    });
    expect(retried.prompts[0]).toMatchObject({
      timeLimitSeconds: 300,
      remainingSeconds: 75,
      timeExpired: false,
      answered: false,
      codingRetryUsed: true,
    });
    expect(retried.prompts[0].codingVerification).toBeUndefined();
    expect(retried.prompts[0].answerResult).toBeUndefined();
    expect(parseMobileInterviewSession(retried)?.prompts[0].codingRetryUsed).toBe(true);

    const expiredAgain = expireMobileInterviewPrompt(retried, 377_000);
    expect(retryCodingInterviewPromptWithExtraTime(expiredAgain, 378_000)).toBe(expiredAgain);
  });

  it('advances from a paused expired coding question instead of expiring it again', () => {
    const codingPrompt = {
      ...prompt('coding'),
      kind: 'coding' as const,
      codingProblemId: 7,
      codingLanguage: 'java' as const,
    };
    const session = createMobileInterviewSession([codingPrompt, prompt('next')], 'kotlin', 15, 1_000);
    const expired = expireMobileInterviewPrompt(session, 301_000);
    const next = moveMobileInterviewToPrompt(expired, 1, 302_000);

    expect(next).toMatchObject({ activeIndex: 1, status: 'paused', remainingSeconds: 450 });
    expect(resumeMobileInterviewSession(next, 303_000)).toMatchObject({
      activeIndex: 1,
      status: 'running',
      endsAt: 753_000,
    });
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
    const emptyQuestionStats = {
      version: 2 as const,
      questions: {},
      attendanceEvents: [],
      skippedEvents: [],
      answerEvents: {},
    };
    expect(mergeMobileInterviewBackups(
      { activeSession: null, history: [finished], schedules: [schedule], questionStats: emptyQuestionStats },
      { activeSession: null, history: [second], schedules: [{ ...schedule, id: 'schedule-2' }], questionStats: emptyQuestionStats },
    )).toMatchObject({ history: [second, finished], schedules: [schedule, { ...schedule, id: 'schedule-2' }] });
    expect(parseMobileInterviewBackup({ activeSession: null, history: [{ id: 'invalid' }] })).toBeUndefined();
  });

  it('backs up and restores Mobile Interview attendance, correct, wrong, and skipped stats', () => {
    const source = memoryStorage();
    recordMobileInterviewQuestionAttendance(source, 'session-1', 'question-1');
    recordMobileInterviewQuestionAnswerResult(source, 'session-1', 'question-1', 'incorrect');
    recordMobileInterviewQuestionSkipped(source, 'session-2', 'question-1');
    const backup = loadMobileInterviewBackup(source);
    const destination = memoryStorage();

    saveMobileInterviewBackup(destination, backup);

    expect(loadMobileInterviewBackup(destination).questionStats).toEqual(backup.questionStats);
    expect(loadMobileInterviewQuestionStats(destination)).toEqual({
      'question-1': { attended: 1, correct: 0, wrong: 1, skipped: 1 },
    });
    expect(parseMobileInterviewBackup(backup)).toEqual(backup);
  });

  it('merges Mobile Interview stats by unique interview-question events', () => {
    const firstDevice = memoryStorage();
    recordMobileInterviewQuestionAttendance(firstDevice, 'shared-session', 'question-1');
    recordMobileInterviewQuestionAnswerResult(firstDevice, 'shared-session', 'question-1', 'incorrect');
    recordMobileInterviewQuestionSkipped(firstDevice, 'shared-session', 'question-2');

    const secondDevice = memoryStorage();
    recordMobileInterviewQuestionAttendance(secondDevice, 'shared-session', 'question-1');
    recordMobileInterviewQuestionAnswerResult(secondDevice, 'shared-session', 'question-1', 'correct');
    recordMobileInterviewQuestionSkipped(secondDevice, 'shared-session', 'question-2');
    recordMobileInterviewQuestionAttendance(secondDevice, 'shared-session', 'question-2');
    recordMobileInterviewQuestionAttendance(secondDevice, 'other-session', 'question-3');

    const merged = mergeMobileInterviewBackups(
      loadMobileInterviewBackup(firstDevice),
      loadMobileInterviewBackup(secondDevice),
    );
    const restored = memoryStorage();
    saveMobileInterviewBackup(restored, merged);

    expect(loadMobileInterviewQuestionStats(restored)).toEqual({
      'question-1': { attended: 1, correct: 1, wrong: 0, skipped: 0 },
      'question-2': { attended: 1, correct: 0, wrong: 0, skipped: 0 },
      'question-3': { attended: 1, correct: 0, wrong: 0, skipped: 0 },
    });
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
    expect(parseMobileInterviewSchedule({ ...schedule, programQuestionTimeLimitSeconds: 900 }))
      .toMatchObject({ programQuestionTimeLimitSeconds: 900 });
    expect(parseMobileInterviewSchedule({ ...schedule, programQuestionTimeLimitSeconds: 0 })).toBeUndefined();
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
