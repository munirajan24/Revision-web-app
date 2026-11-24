import { describe, expect, it } from 'vitest';
import { createAppBackup, mergeInterviewStores, mergeJobApplicationStores, parseAppBackup } from './app-backup';
import type { InterviewStore } from './interviews';
import type { JobApplicationStore } from './job-applications';

const state = {
  coding: {
    progress: { 1: { status: 'mastered', attempts: 2, importance: 5 as const } },
    drafts: { 1: 'fun solve() = 1' },
    theme: 'light' as const,
    language: 'java' as const,
    selectedProblemId: 1,
    mode: 'learning' as const,
  },
  completeRevisionProgress: { 'question-1': { status: 'learning' as const, bookmarked: true } },
  interviews: {
    version: 1 as const,
    catalog: [{ id: 'android', title: 'Android', sections: [] }],
    interviews: [],
  },
  jobApplications: {
    version: 1 as const,
    intervalDays: 2,
    startDate: '2026-10-06',
    completionByDate: { '2026-10-06': { android: ['naukri'], springBoot: [] } },
  },
  mobileInterview: {
    activeSession: null,
    history: [],
    questionStats: {
      version: 2 as const,
      questions: { 'mobile-question-1': { attended: 3, correct: 2, wrong: 1, skipped: 1 } },
      attendanceEvents: ['["session-1","mobile-question-1"]'],
      skippedEvents: ['["session-2","mobile-question-1"]'],
      answerEvents: { '["session-1","mobile-question-1"]': 'incorrect' as const },
    },
    schedules: [{
      id: 'mobile-schedule-1',
      title: 'Kotlin mock interview',
      date: '2026-10-06',
      setIds: ['mobile-set:kotlin-essentials'],
      sectionIds: [],
      randomizeQuestions: false,
      status: 'planned' as const,
      createdAt: 1_000,
    }],
  },
};

describe('full application backup', () => {
  it('exports and parses all local stores including the independent mobile interview calendar', () => {
    const backup = createAppBackup(state, '2026-10-06T12:00:00.000Z');
    const parsed = parseAppBackup(JSON.stringify(backup), [1, 2]);

    expect(backup.version).toBe(3);
    expect(parsed?.sections).toEqual(['coding', 'completeRevision', 'interviews', 'jobApplications', 'mobileInterview']);
    expect(parsed?.coding?.progress[1].importance).toBe(5);
    expect(parsed?.completeRevisionProgress).toEqual(state.completeRevisionProgress);
    expect(parsed?.interviews).toEqual(state.interviews);
    expect(parsed?.jobApplications).toEqual(state.jobApplications);
    expect(parsed?.mobileInterview).toEqual(state.mobileInterview);
    expect(parsed?.mobileInterview?.questionStats.questions['mobile-question-1'])
      .toEqual({ attended: 3, correct: 2, wrong: 1, skipped: 1 });
  });

  it('imports the previous coding-only and revision-data backup formats', () => {
    const oldCodingBackup = { version: 1, progress: { 1: { status: 'learning', attempts: 1 } }, drafts: {} };
    const oldRevisionBackup = { version: 1, catalog: state.interviews.catalog, interviews: [], jobApplications: state.jobApplications };

    expect(parseAppBackup(JSON.stringify(oldCodingBackup), [1])?.sections).toEqual(['coding']);
    expect(parseAppBackup(JSON.stringify(oldRevisionBackup), [1])?.sections).toEqual(['interviews', 'jobApplications']);
    const previousFullBackup = createAppBackup(state, '2026-10-06T12:00:00.000Z');
    expect(parseAppBackup(JSON.stringify({ ...previousFullBackup, version: 2, mobileInterview: undefined }), [1, 2])?.sections)
      .toEqual(['coding', 'completeRevision', 'interviews', 'jobApplications']);
  });

  it('rejects malformed full backups instead of accepting a partial multi-store file', () => {
    const backup = createAppBackup(state, '2026-10-06T12:00:00.000Z');
    expect(parseAppBackup('{broken', [1])).toBeUndefined();
    expect(parseAppBackup(JSON.stringify({ ...backup, completeRevisionProgress: { 'question-1': { status: 'invalid' } } }), [1])).toBeUndefined();
    expect(parseAppBackup(JSON.stringify({ ...backup, jobApplications: { version: 1 } }), [1])).toBeUndefined();
    expect(parseAppBackup(JSON.stringify({ ...backup, interviews: { version: 1, catalog: [{ id: 'bad' }], interviews: [] } }), [1])).toBeUndefined();
    expect(parseAppBackup(JSON.stringify({ ...backup, mobileInterview: { activeSession: null, history: [{ id: 'bad' }] } }), [1])).toBeUndefined();
  });

  it('merges interview and checklist records by ID', () => {
    const current: InterviewStore = {
      version: 1,
      catalog: [{ id: 'one', title: 'Old', sections: [] }],
      interviews: [],
    };
    const incoming: InterviewStore = {
      version: 1,
      catalog: [{ id: 'one', title: 'Updated', sections: [] }, { id: 'two', title: 'New', sections: [] }],
      interviews: [],
    };

    expect(mergeInterviewStores(current, incoming).catalog).toEqual(incoming.catalog);
  });

  it('unions calendar completions while retaining the current schedule', () => {
    const current: JobApplicationStore = {
      version: 1,
      intervalDays: 2,
      startDate: '2026-10-06',
      completionByDate: { '2026-10-06': { android: ['naukri'], springBoot: [] } },
    };
    const incoming: JobApplicationStore = {
      version: 1,
      intervalDays: 3,
      startDate: '2026-10-01',
      completionByDate: { '2026-10-06': { android: ['linkedin'], springBoot: ['other'] } },
    };

    expect(mergeJobApplicationStores(current, incoming)).toEqual({
      ...current,
      completionByDate: { '2026-10-06': { android: ['naukri', 'linkedin'], springBoot: ['other'] } },
    });
  });
});