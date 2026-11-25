import { describe, expect, it } from 'vitest';
import {
  applyRevisionAssessment,
  autoPromoteQuestion,
  buildRevisionSelection,
  calculateCoverage,
  calculateSlotCounts,
  classifyRevisionPool,
  DAY_MS,
  defaultRevisionQuestion,
  emptySmartRevisionData,
  getRevisionScore,
  getRevisionSummary,
  getRevisionMix,
  loadSmartRevisionData,
  mergeSmartRevisionData,
  parseSmartRevisionData,
  setRevisionPriority,
  saveSmartRevisionData,
  SMART_REVISION_STORAGE_KEY,
  SMART_REVISION_CONFIG,
  weightedSample,
  type RevisionCandidate,
  type RevisionQuestionInput,
} from './smart-revision';

const NOW = new Date(2026, 0, 15, 12).getTime();
const fixedRandom = () => 0.5;
const randomFrom = (seed: number) => () => {
  let value = seed += 0x6D2B79F5;
  value = Math.imul(value ^ value >>> 15, value | 1);
  value ^= value + Math.imul(value ^ value >>> 7, value | 61);
  return ((value ^ value >>> 14) >>> 0) / 4294967296;
};
const input = (id: string, sectionId = id): RevisionQuestionInput => ({ id, sectionId, stats: { attended: 0, correct: 0, wrong: 0, skipped: 0 } });
const candidate = (overrides: Partial<RevisionCandidate> = {}): RevisionCandidate => ({
  ...input('q1'),
  record: defaultRevisionQuestion(),
  ...overrides,
});

describe('smart revision assessment scheduling', () => {
  it('moves boxes and calculates due dates using priority multipliers', () => {
    let data = emptySmartRevisionData();
    data = applyRevisionAssessment(data, 'q1', 's1', 'correct', NOW);
    expect(data.questions.q1.box).toBe(2);
    expect(data.questions.q1.dueAt).toBe(NOW + 3 * DAY_MS);
    data = setRevisionPriority(data, 'q1', 1, NOW);
    data = applyRevisionAssessment(data, 'q1', 's2', 'correct', NOW);
    expect(data.questions.q1.box).toBe(3);
    expect(data.questions.q1.dueAt).toBe(NOW + 7 * 0.75 * DAY_MS);
    data = setRevisionPriority(data, 'q1', 2, NOW);
    data = applyRevisionAssessment(data, 'q1', 's3', 'correct', NOW);
    expect(data.questions.q1.dueAt).toBe(NOW + 14 * 0.5 * DAY_MS);
  });

  it('resets wrong answers to box one and makes them due immediately', () => {
    const data = applyRevisionAssessment(emptySmartRevisionData(), 'q1', 's1', 'incorrect', NOW);
    expect(data.questions.q1).toMatchObject({ box: 1, dueAt: NOW, lastResult: 'incorrect', lastSeenAt: NOW, cycle: 1 });
  });

  it('keeps the box for skipped prompts and schedules within one day', () => {
    let data = emptySmartRevisionData();
    data = applyRevisionAssessment(data, 'q1', 's1', 'correct', NOW);
    data = applyRevisionAssessment(data, 'q1', 's2', 'skipped', NOW + DAY_MS);
    expect(data.questions.q1.box).toBe(2);
    expect(data.questions.q1.dueAt).toBe(NOW + 2 * DAY_MS);
    expect(data.questions.q1.recentSessions).toEqual(['s1', 's2']);
  });

  it('is idempotent and replaces a revised short-answer assessment', () => {
    const first = applyRevisionAssessment(emptySmartRevisionData(), 'q1', 's1', 'incorrect', NOW);
    expect(applyRevisionAssessment(first, 'q1', 's1', 'incorrect', NOW + 100)).toBe(first);
    const corrected = applyRevisionAssessment(first, 'q1', 's1', 'correct', NOW + 200);
    expect(corrected.questions.q1.box).toBe(2);
    expect(corrected.questions.q1.dueAt).toBe(NOW + 200 + 3 * DAY_MS);
    expect(corrected.assessmentEvents[JSON.stringify(['s1', 'q1'])].result).toBe('correct');
  });

  it('leaves scheduling unchanged when verification is unavailable', () => {
    const data = applyRevisionAssessment(emptySmartRevisionData(), 'q1', 's1', 'unavailable', NOW);
    expect(data.questions.q1).toBeUndefined();
    expect(data.assessmentEvents).toEqual({});
  });
});

describe('smart revision classification and scoring', () => {
  it('classifies exactly one pool with due and weakness precedence', () => {
    const record = defaultRevisionQuestion();
    expect(classifyRevisionPool(record, undefined, NOW, 1)).toBe('new');
    expect(classifyRevisionPool({ ...record, cycle: 1 }, undefined, NOW, 1)).toBe('rest');
    expect(classifyRevisionPool({ ...record, dueAt: NOW }, undefined, NOW, 1)).toBe('due');
    expect(classifyRevisionPool({ ...record, lastResult: 'incorrect', dueAt: NOW - 1 }, undefined, NOW, 1)).toBe('due');
    expect(classifyRevisionPool({ ...record, lastResult: 'skipped' }, undefined, NOW, 1)).toBe('weak');
    expect(classifyRevisionPool({ ...record, cycle: 1 }, { attended: 3, correct: 1, wrong: 1, skipped: 0 }, NOW, 1)).toBe('weak');
  });

  it('scores urgency, priority, error rate, unseen, age and recent sessions, clamping clock rollback', () => {
    const unseen = candidate();
    expect(getRevisionScore(unseen, NOW)).toBe(1.5);
    const old = candidate({ record: { ...defaultRevisionQuestion(), priority: 2, dueAt: NOW - 60 * DAY_MS, lastSeenAt: NOW - 60 * DAY_MS }, stats: { attended: 2, correct: 0, wrong: 2, skipped: 0 } });
    expect(getRevisionScore(old, NOW)).toBeGreaterThan(getRevisionScore(unseen, NOW));
    const recent = candidate({ record: { ...defaultRevisionQuestion(), recentSessions: ['s1'] } });
    expect(getRevisionScore(recent, NOW)).toBe(0.1);
    expect(Number.isFinite(getRevisionScore(candidate({ record: { ...defaultRevisionQuestion(), dueAt: NOW + DAY_MS } }), NOW))).toBe(true);
    expect(getRevisionScore(candidate({ record: { ...defaultRevisionQuestion(), lastSeenAt: NOW + 10 * DAY_MS } }), NOW)).toBe(1);
    expect(SMART_REVISION_CONFIG.scoreWeights.overdue).toBe(3);
  });
});

describe('smart revision selection', () => {
  it('uses largest-remainder rounding and accounts for all slots', () => {
    expect(calculateSlotCounts(7, { due: 30, weak: 20, new: 50 })).toEqual({ due: 2, weak: 1, new: 4, rest: 0 });
    expect(Object.values(calculateSlotCounts(13, { due: 30, weak: 20, new: 50 })).reduce((sum, value) => sum + value, 0)).toBe(13);
  });

  it('does not duplicate questions, fills small/rest pools, and respects section caps when possible', () => {
    const data = emptySmartRevisionData();
    const questions = Array.from({ length: 12 }, (_, index) => input(`q${index}`, `section-${index % 4}`));
    const result = buildRevisionSelection(data, questions, { now: NOW, random: randomFrom(3), sessionSize: 10 });
    const ids = result.picks.map((pick) => pick.questionId);
    expect(ids).toHaveLength(10);
    expect(new Set(ids).size).toBe(ids.length);
    for (let index = 3; index < result.picks.length; index += 1) {
      const last = result.picks.slice(index - 3, index).map((pick) => questions.find((q) => q.id === pick.questionId)?.sectionId);
      expect(last.every((section) => section === questions.find((q) => q.id === result.picks[index].questionId)?.sectionId)).toBe(false);
    }
    const small = buildRevisionSelection(data, questions.slice(0, 2), { now: NOW, random: fixedRandom, sessionSize: 10 });
    expect(small.picks).toHaveLength(2);
  });

  it('uses all questions in sequence before moving to the next coverage cycle', () => {
    let data = emptySmartRevisionData();
    const questions = Array.from({ length: 20 }, (_, index) => input(`q${index}`, `section-${index % 5}`));
    const asked: string[] = [];
    for (let session = 0; session < 2; session += 1) {
      const selection = buildRevisionSelection(data, questions, { now: NOW + session * DAY_MS, random: randomFrom(session + 1), sessionSize: 10 });
      data = selection.data;
      selection.picks.forEach(({ questionId }) => {
        asked.push(questionId);
        data = applyRevisionAssessment(data, questionId, `session-${session}`, 'correct', NOW + session * DAY_MS);
      });
    }
    expect(new Set(asked).size).toBe(20);
    expect(calculateCoverage(questions, data)).toBe(100);
    const next = buildRevisionSelection(data, questions, { now: NOW + 2 * DAY_MS, random: fixedRandom, sessionSize: 10 });
    expect(next.cycleAdvanced).toBe(true);
    expect(next.data.currentCycle).toBe(2);
    expect(buildRevisionSelection(next.data, questions, { now: NOW + 2 * DAY_MS, random: fixedRandom, sessionSize: 10 }).cycleAdvanced).toBe(false);
  });

  it('prioritizes must-know questions, includes them when due-date countdown is near, and allows must-know only', () => {
    let data = emptySmartRevisionData();
    data = { ...data, interviewDate: new Date(2026, 0, 17, 12).getTime() };
    const items = Array.from({ length: 30 }, (_, index) => input(`q${index}`, `s${index % 6}`));
    data.questions.q0 = { ...defaultRevisionQuestion(), priority: 2, cycle: 1, dueAt: NOW + 15 * DAY_MS };
    const selection = buildRevisionSelection(data, items, { now: NOW, random: randomFrom(9), sessionSize: 10 });
    expect(selection.picks.some((pick) => pick.questionId === 'q0')).toBe(true);
    const onlyMust = buildRevisionSelection(data, items, { now: NOW, random: fixedRandom, sessionSize: 10, mustKnowOnly: true });
    expect(onlyMust.picks.map((pick) => pick.questionId)).toEqual(['q0']);
    data.questions.q0 = { ...data.questions.q0, dueAt: NOW };
    data.questions.q1 = { ...defaultRevisionQuestion(), priority: 2, dueAt: NOW };
    expect(buildRevisionSelection(data, items, { now: NOW, random: randomFrom(2), sessionSize: 5, mustKnowOnly: true }).picks).toHaveLength(2);
  });

  it('advances coverage based on the Must-know candidate set in Must-know-only mode', () => {
    const data = emptySmartRevisionData();
    data.questions.important = { ...defaultRevisionQuestion(), priority: 2, cycle: 1 };
    const questions = [input('important'), input('normal')];
    const selection = buildRevisionSelection(data, questions, { now: NOW, random: fixedRandom, mustKnowOnly: true });

    expect(selection.cycleAdvanced).toBe(true);
    expect(selection.data.currentCycle).toBe(2);
    expect(selection.data.modifiedAt).toBe(NOW);
    expect(selection.picks.map((pick) => pick.questionId)).toEqual(['important']);
  });

  it('uses the required interview countdown tiers and ignores past dates', () => {
    const data = emptySmartRevisionData();
    const localDate = (days: number) => new Date(new Date(NOW).getFullYear(), new Date(NOW).getMonth(), new Date(NOW).getDate() + days, 12).getTime();
    data.interviewDate = localDate(14);
    expect(getRevisionMix(data, NOW)).toMatchObject({ slots: { due: 15, weak: 15, new: 50 }, priority: 20 });
    data.interviewDate = localDate(7);
    expect(getRevisionMix(data, NOW)).toMatchObject({ slots: { due: 17, weak: 18, new: 30 }, priority: 35 });
    data.interviewDate = localDate(2);
    expect(getRevisionMix(data, NOW)).toMatchObject({ slots: { due: 20, weak: 20, new: 10 }, priority: 50 });
    data.interviewDate = localDate(1);
    expect(getRevisionMix(data, NOW)).toMatchObject({ slots: { due: 15, weak: 15, new: 0 }, priority: 70, finalDays: true });
    data.interviewDate = localDate(-1);
    expect(getRevisionMix(data, NOW)).toMatchObject({ slots: data.settings.slots, priority: 0, finalDays: false });
  });

  it('returns an incorrect answer in the very next session even with unseen questions', () => {
    let data = emptySmartRevisionData();
    const items = Array.from({ length: 60 }, (_, index) => input(`q${index}`, `s${index % 6}`));
    data.questions.q10 = { ...defaultRevisionQuestion(), cycle: 1, dueAt: NOW, lastResult: 'incorrect' };
    const wrongQuestion = items.find((question) => question.id === 'q10');
    if (wrongQuestion) wrongQuestion.stats = { attended: 1, correct: 0, wrong: 1, skipped: 0 };
    const selection = buildRevisionSelection(data, items, { now: NOW, random: randomFrom(11), sessionSize: 10 });
    expect(selection.picks.map((pick) => pick.questionId)).toContain('q10');
  });

  it('covers 60 questions before a normal question repeats across seeded sessions', () => {
    let data = emptySmartRevisionData();
    const items = Array.from({ length: 60 }, (_, index) => input(`q${index}`, `section-${index % 8}`));
    const seen = new Set<string>();
    for (let session = 0; session < 6; session += 1) {
      const selection = buildRevisionSelection(data, items, { now: NOW + session * DAY_MS, random: randomFrom(session + 33), sessionSize: 10 });
      for (const pick of selection.picks) {
        expect(seen.has(pick.questionId)).toBe(false);
        seen.add(pick.questionId);
        data = applyRevisionAssessment(data, pick.questionId, `coverage-${session}`, 'correct', NOW + session * DAY_MS);
      }
    }
    expect(seen.size).toBe(60);
  });

  it('selects must-know questions more often during a multi-session seeded simulation', () => {
    let data = emptySmartRevisionData();
    const items = Array.from({ length: 60 }, (_, index) => input(`q${index}`, `section-${index % 8}`));
    items.forEach((question) => { data.questions[question.id] = { ...defaultRevisionQuestion(), cycle: 1 }; });
    for (let index = 0; index < 6; index += 1) data.questions[`q${index}`].priority = 2;
    const counts = new Map(items.map((question) => [question.id, 0]));
    for (let session = 0; session < 40; session += 1) {
      const now = NOW + session * DAY_MS;
      const selection = buildRevisionSelection(data, items, { now, random: randomFrom(session + 1_000), sessionSize: 10 });
      selection.picks.forEach(({ questionId }) => {
        counts.set(questionId, (counts.get(questionId) ?? 0) + 1);
        data = applyRevisionAssessment(data, questionId, `simulation-${session}`, 'correct', now);
      });
    }
    const mustKnowAverage = [...counts].filter(([id]) => Number(id.slice(1)) < 6).reduce((sum, [, count]) => sum + count, 0) / 6;
    const normalAverage = [...counts].filter(([id]) => Number(id.slice(1)) >= 6).reduce((sum, [, count]) => sum + count, 0) / 54;
    expect(mustKnowAverage).toBeGreaterThan(normalAverage);
  });

  it('varies weighted samples across seeds and favors higher scores', () => {
    const items = Array.from({ length: 2 }, (_, index) => `q${index}`);
    const draws = new Map<string, number>();
    for (let seed = 1; seed <= 500; seed += 1) {
      const picked = weightedSample(items, 1, (item) => item === 'q0' ? 100 : 0.1, randomFrom(seed))[0];
      draws.set(picked, (draws.get(picked) ?? 0) + 1);
    }
    expect(draws.get('q0')).toBeGreaterThan(450);
    expect(weightedSample(items, 1, () => 1, randomFrom(1))).not.toEqual(weightedSample(items, 1, () => 1, randomFrom(99)));
  });
});

describe('smart revision promotion, summary and backup', () => {
  it('promotes repeated mistakes and never lowers manually chosen priority', () => {
    let data = emptySmartRevisionData();
    data = setRevisionPriority(data, 'q1', 1, NOW);
    expect(data.questions.q1.autoPromoted).toBe(false);
    expect(autoPromoteQuestion(data, 'q1', 2, NOW).questions.q1.priority).toBe(1);
    const promoted = autoPromoteQuestion(data, 'q1', 3, NOW);
    expect(promoted.questions.q1.priority).toBe(2);
    expect(promoted.questions.q1.autoPromoted).toBe(true);
    const manualMustKnow = setRevisionPriority(promoted, 'q1', 2, NOW + 1);
    expect(manualMustKnow.questions.q1.autoPromoted).toBe(false);
    expect(autoPromoteQuestion(manualMustKnow, 'q1', 0, NOW + 2).questions.q1.priority).toBe(2);
    expect(autoPromoteQuestion(emptySmartRevisionData(), 'q1', 2, NOW).questions.q1.priority).toBe(1);
  });

  it('merges question records by last seen and global settings by modified time', () => {
    const current = emptySmartRevisionData(NOW);
    current.questions.q1 = { ...defaultRevisionQuestion(), priority: 1, box: 3, lastSeenAt: NOW, cycle: 2 };
    const incoming = emptySmartRevisionData(NOW + 1);
    incoming.interviewDate = NOW + 20 * DAY_MS;
    incoming.questions.q1 = { ...defaultRevisionQuestion(), priority: 2, box: 2, lastSeenAt: NOW - DAY_MS, cycle: 1, autoPromoted: true };
    const merged = mergeSmartRevisionData(current, incoming);
    expect(merged.questions.q1).toMatchObject({ priority: 2, box: 3, cycle: 2, autoPromoted: true });
    expect(merged.interviewDate).toBe(incoming.interviewDate);
  });

  it('parses valid data, rejects malformed shapes, and summarizes scope progress', () => {
    const data = emptySmartRevisionData(NOW);
    data.questions.q1 = { ...defaultRevisionQuestion(), dueAt: NOW };
    expect(parseSmartRevisionData(data)).toEqual(data);
    expect(parseSmartRevisionData({ ...data, version: 99 })).toBeUndefined();
    expect(getRevisionSummary([input('q1'), input('q2')], data, NOW)).toMatchObject({ dueNow: 1, dueThisWeek: 1, boxes: [2, 0, 0, 0, 0] });
    const storage = {
      value: '',
      getItem(key: string) { expect(key).toBe(SMART_REVISION_STORAGE_KEY); return this.value; },
      setItem(key: string, value: string) { expect(key).toBe(SMART_REVISION_STORAGE_KEY); this.value = value; },
    };
    saveSmartRevisionData(storage, data);
    expect(loadSmartRevisionData(storage)).toEqual(data);
  });
});
