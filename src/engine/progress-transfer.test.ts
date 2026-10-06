import { describe, expect, it } from 'vitest';
import { createProgressBackup, mergeProgressRecords, parseProgressBackup, replaceProgressRecords } from './progress-transfer';

const baseState = {
  progress: {
    1: { status: 'mastered', attempts: 2, notes: 'Recall this', importance: 5 as const },
    2: { status: 'learning', attempts: 1, notes: '', importance: undefined },
  },
  drafts: { 1: 'fun answer() = 42' },
  theme: 'light' as const,
  language: 'java' as const,
  selectedProblemId: 2,
  mode: 'learning' as const,
};

describe('progress backup transfer', () => {
  it('exports every persisted app setting and marks unrated questions explicitly', () => {
    const backup = createProgressBackup(baseState, '2026-10-06T12:00:00.000Z');

    expect(backup).toEqual({
      version: 1,
      exportedAt: '2026-10-06T12:00:00.000Z',
      ...baseState,
      progress: {
        1: { ...baseState.progress[1], importance: 5 },
        2: { ...baseState.progress[2], importance: null },
      },
    });
  });

  it('round-trips complete exports and accepts legacy version-one exports', () => {
    const backup = createProgressBackup(baseState, '2026-10-06T12:00:00.000Z');
    expect(parseProgressBackup(JSON.stringify(backup), [1, 2])).toEqual(backup);

    const legacy = { version: 1, progress: { 1: { important: true, attempts: 1 } }, drafts: {}, theme: 'dark' };
    expect(parseProgressBackup(JSON.stringify(legacy), [1, 2])).toMatchObject(legacy);
  });

  it('rejects malformed, unsupported, and unknown-problem backups', () => {
    expect(parseProgressBackup('{broken', [1, 2])).toBeUndefined();
    expect(parseProgressBackup(JSON.stringify({ version: 2, progress: {} }), [1, 2])).toBeUndefined();
    expect(parseProgressBackup(JSON.stringify({ version: 1, progress: { 99: {} } }), [1, 2])).toBeUndefined();
    expect(parseProgressBackup(JSON.stringify({ version: 1, progress: { 1: { status: 'invalid' } } }), [1, 2])).toBeUndefined();
    expect(parseProgressBackup(JSON.stringify({ version: 1, progress: {}, drafts: { 1: 42 } }), [1, 2])).toBeUndefined();
  });

  it('preserves omitted ratings but maps an explicit legacy false flag to unrated', () => {
    const current = { 1: { status: 'mastered', attempts: 5, importance: 4 }, 2: { status: 'learning', attempts: 1, importance: 4 } };
    const merged = mergeProgressRecords(current, {
      1: { status: 'learning', attempts: 2 },
      2: { status: 'mastered', attempts: 3, importance: 2 },
      3: { status: 'practicing', attempts: 1, important: false },
    });

    expect(merged).toEqual({
      1: { status: 'learning', attempts: 2, importance: 4 },
      2: { status: 'mastered', attempts: 3, importance: 2 },
      3: { status: 'practicing', attempts: 1, importance: undefined },
    });
  });

  it('replaces imported progress while resetting problems absent from the backup', () => {
    const defaults = { 1: { status: 'not_started', attempts: 0 }, 2: { status: 'not_started', attempts: 0 } };
    const replaced = replaceProgressRecords(defaults, { 1: { status: 'mastered', attempts: 4 } });

    expect(replaced).toEqual({
      1: { status: 'mastered', attempts: 4 },
      2: { status: 'not_started', attempts: 0 },
    });
  });
});