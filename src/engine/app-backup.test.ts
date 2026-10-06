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
};

describe('full application backup', () => {
  it('exports and parses all four local stores as one version-two file', () => {
    const backup = createAppBackup(state, '2026-10-06T12:00:00.000Z');
    const parsed = parseAppBackup(JSON.stringify(backup), [1, 2]);

    expect(backup.version).toBe(2);
    expect(parsed?.sections).toEqual(['coding', 'completeRevision', 'interviews', 'jobApplications']);
    expect(parsed?.coding?.progress[1].importance).toBe(5);
    expect(parsed?.completeRevisionProgress).toEqual(state.completeRevisionProgress);
    expect(parsed?.interviews).toEqual(state.interviews);
    expect(parsed?.jobApplications).toEqual(state.jobApplications);
  });

  it('imports the previous coding-only and revision-data backup formats', () => {
    const oldCodingBackup = { version: 1, progress: { 1: { status: 'learning', attempts: 1 } }, drafts: {} };
    const oldRevisionBackup = { version: 1, catalog: state.interviews.catalog, interviews: [], jobApplications: state.jobApplications };

    expect(parseAppBackup(JSON.stringify(oldCodingBackup), [1])?.sections).toEqual(['coding']);
    expect(parseAppBackup(JSON.stringify(oldRevisionBackup), [1])?.sections).toEqual(['interviews', 'jobApplications']);
  });

  it('rejects malformed full backups instead of accepting a partial multi-store file', () => {
    const backup = createAppBackup(state, '2026-10-06T12:00:00.000Z');
    expect(parseAppBackup('{broken', [1])).toBeUndefined();
    expect(parseAppBackup(JSON.stringify({ ...backup, completeRevisionProgress: { 'question-1': { status: 'invalid' } } }), [1])).toBeUndefined();
    expect(parseAppBackup(JSON.stringify({ ...backup, jobApplications: { version: 1 } }), [1])).toBeUndefined();
    expect(parseAppBackup(JSON.stringify({ ...backup, interviews: { version: 1, catalog: [{ id: 'bad' }], interviews: [] } }), [1])).toBeUndefined();
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