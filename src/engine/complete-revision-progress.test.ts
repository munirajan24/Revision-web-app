import { describe, expect, it } from 'vitest';
import { COMPLETE_REVISION_PROGRESS_KEY, loadCompleteRevisionProgress, mergeCompleteRevisionProgress, parseCompleteRevisionProgress, saveCompleteRevisionProgress } from './complete-revision-progress';

describe('complete revision question progress', () => {
  it('validates supported per-question status and bookmark fields', () => {
    expect(parseCompleteRevisionProgress({ 'question-1': { status: 'learning', bookmarked: true } })).toEqual({
      'question-1': { status: 'learning', bookmarked: true },
    });
    expect(parseCompleteRevisionProgress({ 'question-1': { status: 'invalid' } })).toBeUndefined();
    expect(parseCompleteRevisionProgress([])).toBeUndefined();
  });

  it('loads an empty map for missing or malformed local storage', () => {
    const storage = { getItem: (key: string) => key === COMPLETE_REVISION_PROGRESS_KEY ? '{broken' : null };
    expect(loadCompleteRevisionProgress(storage)).toEqual({});
  });

  it('saves and merges question records by ID', () => {
    let stored: string | null = null;
    const storage = {
      getItem: () => stored,
      setItem: (_key: string, value: string) => { stored = value; },
    };
    const current = { 'question-1': { status: 'mastered' as const } };
    const incoming = { 'question-1': { bookmarked: true }, 'question-2': { status: 'learning' as const } };

    saveCompleteRevisionProgress(storage, mergeCompleteRevisionProgress(current, incoming));

    expect(loadCompleteRevisionProgress(storage)).toEqual({
      'question-1': { status: 'mastered', bookmarked: true },
      'question-2': { status: 'learning' },
    });
  });
});