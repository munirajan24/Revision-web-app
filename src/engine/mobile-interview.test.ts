import { describe, expect, it } from 'vitest';
import { seedSkillChecklists } from '../data/skill-checklists';
import type { SkillChecklist } from './interviews';
import {
  createMobileInterviewSession,
  expireMobileInterviewPrompt,
  finishMobileInterviewSession,
  getMobileInterviewPrompts,
  getMobileInterviewPromptLimit,
  getMobileInterviewRemainingSeconds,
  loadMobileInterviewSession,
  MOBILE_INTERVIEW_STORAGE_KEY,
  moveMobileInterviewToPrompt,
  pauseMobileInterviewSession,
  parseMobileInterviewSession,
  resumeMobileInterviewSession,
  saveMobileInterviewSession,
} from './mobile-interview';

const catalog: SkillChecklist[] = [
  {
    id: 'backend-kotlin-spring-boot-backend-interview-checklist',
    title: 'Kotlin + Spring Boot',
    sections: [
      {
        id: 'kotlin-essentials',
        title: '2. Kotlin Language Essentials ⭐',
        priority: 'high',
        items: [
          { id: 'null-safety', text: 'Explain null safety', priority: 'high' },
          { id: 'scope-functions', text: 'Compare scope functions' },
        ],
      },
      {
        id: 'spring-setup',
        title: '1. Kotlin + Spring Setup ⭐',
        priority: 'high',
        items: [{ id: 'all-open', text: 'Why are Spring classes open?', priority: 'high' }],
      },
      {
        id: 'spring-beans',
        title: '3. Dependency Injection and Beans',
        items: [{ id: 'constructor-injection', text: 'Explain constructor injection' }],
      },
    ],
  },
  {
    id: 'backend-java-spring-boot-backend-interview-checklist',
    title: 'Java + Spring Boot',
    sections: [
      { id: 'java-core', title: 'Segment 1: Core Java ⭐', items: [{ id: 'oops', text: 'Explain OOP' }] },
      { id: 'spring-core', title: 'Segment 7: Spring Core ⭐', items: [{ id: 'ioc', text: 'Explain IoC' }] },
    ],
  },
  {
    id: 'android-kotlin-interview-checklist-android-developer',
    title: 'Kotlin Android',
    sections: [
      { id: 'language-basics', title: '1. Language Basics', items: [{ id: 'val-var', text: 'Compare val and var' }] },
      { id: 'android-context', title: '9. Kotlin in Android-Specific Context', items: [{ id: 'android-state', text: 'Explain Android state' }] },
    ],
  },
  {
    id: 'unrelated',
    title: 'Unrelated',
    sections: [{ id: 'other', title: 'Other', items: [{ id: 'other-question', text: 'Other question' }] }],
  },
];

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe('mobile interview sessions', () => {
  it('scales the question round to the selected time limit', () => {
    expect([15, 30, 45].map(getMobileInterviewPromptLimit)).toEqual([10, 20, 30]);
    expect(getMobileInterviewPromptLimit(0)).toBe(0);
  });

  it('builds both tracks from the actual revision checklist catalog', () => {
    const kotlinPrompts = getMobileInterviewPrompts(seedSkillChecklists, 'kotlin');
    const springPrompts = getMobileInterviewPrompts(seedSkillChecklists, 'spring-boot');

    expect(kotlinPrompts.length).toBeGreaterThan(0);
    expect(springPrompts.length).toBeGreaterThan(0);
    expect(new Set(kotlinPrompts.map((prompt) => prompt.id)).size).toBe(kotlinPrompts.length);
    expect(new Set(springPrompts.map((prompt) => prompt.id)).size).toBe(springPrompts.length);
    expect(kotlinPrompts.every((prompt) => prompt.checklistId.startsWith('backend-kotlin-') || prompt.checklistId.startsWith('android-kotlin-'))).toBe(true);
    expect(springPrompts.every((prompt) => prompt.sectionTitle !== 'Kotlin Language Essentials')).toBe(true);
    expect(springPrompts.some((prompt) => prompt.sectionTitle === 'Spring Boot Fundamentals')).toBe(true);
    expect(getMobileInterviewPrompts(seedSkillChecklists, 'spring-boot', undefined, true).length).toBeGreaterThan(0);
    expect(new Set(kotlinPrompts.slice(0, 10).map((prompt) => prompt.checklistId)).size).toBe(2);
    expect(new Set(springPrompts.slice(0, 10).map((prompt) => prompt.checklistId)).size).toBe(2);
  });

  it('uses the revision checklist catalog for Kotlin and Spring Boot tracks without unrelated topics', () => {
    expect(getMobileInterviewPrompts(catalog, 'kotlin').map((prompt) => prompt.id)).toEqual([
      'null-safety',
      'val-var',
      'scope-functions',
      'all-open',
      'constructor-injection',
    ]);
    expect(getMobileInterviewPrompts(catalog, 'spring-boot').map((prompt) => prompt.id)).toEqual([
      'all-open',
      'ioc',
      'constructor-injection',
    ]);
    expect(getMobileInterviewPrompts(catalog, 'kotlin', 'kotlin-essentials', true).map((prompt) => prompt.id)).toEqual([
      'null-safety',
      'scope-functions',
    ]);
  });

  it('starts a timed session and calculates remaining time from its end timestamp', () => {
    const prompts = getMobileInterviewPrompts(catalog, 'kotlin');
    const session = createMobileInterviewSession(prompts, 'kotlin', 15, 1_000);

    expect(session).toMatchObject({
      track: 'kotlin',
      durationSeconds: 900,
      questionDurationSeconds: 180,
      remainingSeconds: 180,
      endsAt: 181_000,
      status: 'running',
      activeIndex: 0,
    });
    expect(session.prompts.every((prompt) => prompt.timeLimitSeconds === 180 && prompt.remainingSeconds === 180)).toBe(true);
    expect(getMobileInterviewRemainingSeconds(session, 31_001)).toBe(150);
  });

  it('preserves independent question time when moving, pausing and resuming', () => {
    const session = createMobileInterviewSession(getMobileInterviewPrompts(catalog, 'kotlin'), 'kotlin', 15, 1_000);
    const next = moveMobileInterviewToPrompt(session, 1, 31_001);
    const paused = pauseMobileInterviewSession(next, 61_001);
    const resumed = resumeMobileInterviewSession(paused, 100_000);

    expect(next).toMatchObject({ activeIndex: 1, remainingSeconds: 180, endsAt: 211_001 });
    expect(next.prompts[0].remainingSeconds).toBe(150);
    expect(paused).toMatchObject({ status: 'paused', remainingSeconds: 150, endsAt: null });
    expect(paused.prompts[1].remainingSeconds).toBe(150);
    expect(resumed).toMatchObject({ status: 'running', remainingSeconds: 150, endsAt: 250_000 });
    expect(getMobileInterviewRemainingSeconds(resumed, 200_000)).toBe(50);
  });

  it('automatically expires one question and starts the next question with its own full clock', () => {
    const session = createMobileInterviewSession(getMobileInterviewPrompts(catalog, 'kotlin'), 'kotlin', 15, 1_000);
    const secondQuestion = expireMobileInterviewPrompt(session, 181_000);

    expect(secondQuestion).toMatchObject({ activeIndex: 1, status: 'running', remainingSeconds: 180, endsAt: 361_000 });
    expect(secondQuestion.prompts[0]).toMatchObject({ timeExpired: true, remainingSeconds: 0 });
    expect(secondQuestion.prompts[1]).toMatchObject({ timeExpired: false, remainingSeconds: 180 });
  });

  it('finishes expired sessions and recovers persisted sessions after refresh', () => {
    const storage = memoryStorage();
    const now = Date.now();
    const session = createMobileInterviewSession(getMobileInterviewPrompts(catalog, 'kotlin'), 'kotlin', 15, now);

    saveMobileInterviewSession(storage, session);

    expect(storage.getItem(MOBILE_INTERVIEW_STORAGE_KEY)).toBeTruthy();
    expect(loadMobileInterviewSession(storage)).toMatchObject({ status: 'running' });
    const paused = pauseMobileInterviewSession(session, now + 31_000);
    saveMobileInterviewSession(storage, paused);
    expect(loadMobileInterviewSession(storage)).toMatchObject({ status: 'paused', remainingSeconds: 149 });
    const finished = finishMobileInterviewSession(paused, now + 32_000);
    saveMobileInterviewSession(storage, finished);
    expect(loadMobileInterviewSession(storage)).toMatchObject({ status: 'finished', remainingSeconds: 149 });

    saveMobileInterviewSession(storage, null);
    expect(storage.getItem(MOBILE_INTERVIEW_STORAGE_KEY)).toBeNull();
  });

  it('rejects malformed or internally inconsistent saved sessions', () => {
    const session = createMobileInterviewSession(getMobileInterviewPrompts(catalog, 'kotlin'), 'kotlin', 15, 1_000);

    expect(parseMobileInterviewSession({ ...session, activeIndex: 999 })).toBeUndefined();
    expect(parseMobileInterviewSession({ ...session, status: 'paused', endsAt: 2_000 })).toBeUndefined();
    expect(parseMobileInterviewSession({ ...session, prompts: [{ ...session.prompts[0], note: null }] })).toBeUndefined();
  });

  it('migrates a saved session from the former shared timer to per-question clocks', () => {
    const session = createMobileInterviewSession(getMobileInterviewPrompts(catalog, 'kotlin'), 'kotlin', 15, Date.now());
    const { questionDurationSeconds: _questionDurationSeconds, ...legacySession } = session;
    const legacy = {
      ...legacySession,
      remainingSeconds: 700,
      endsAt: Date.now() + 700_000,
      prompts: session.prompts.map(({ timeLimitSeconds: _timeLimit, remainingSeconds: _remaining, timeExpired: _expired, ...prompt }) => prompt),
    };

    const migrated = parseMobileInterviewSession(legacy);
    expect(migrated).toMatchObject({
      status: 'running',
      questionDurationSeconds: 180,
      remainingSeconds: 180,
    });
    expect(migrated?.prompts.every((prompt) => prompt.timeLimitSeconds === 180 && prompt.remainingSeconds === 180)).toBe(true);
  });
});
