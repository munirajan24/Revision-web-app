import { describe, expect, it } from 'vitest';
import { getProblemImportanceLabel, normalizeProblemImportance, normalizeProblemImportanceEntry, problemImportanceOptions } from './problem-importance';

describe('problem importance', () => {
  it('defines five labeled importance levels', () => {
    expect(problemImportanceOptions.map(({ value, label }) => [value, label])).toEqual([
      [1, 'Not important'],
      [2, 'Slightly important'],
      [3, 'Moderately important'],
      [4, 'Very important'],
      [5, 'Essential / must know'],
    ]);
  });

  it('uses Not Rated / New when no rating is set', () => {
    expect(getProblemImportanceLabel()).toBe('Not Rated / New');
    expect(normalizeProblemImportance(undefined, false)).toBeUndefined();
  });

  it('preserves valid ratings and rejects values outside the scale', () => {
    expect([1, 2, 3, 4, 5].map((value) => normalizeProblemImportance(value))).toEqual([1, 2, 3, 4, 5]);
    expect(normalizeProblemImportance(0)).toBeUndefined();
    expect(normalizeProblemImportance(6)).toBeUndefined();
    expect(normalizeProblemImportance('5')).toBeUndefined();
  });

  it('migrates the old important flag and removes it from normalized entries', () => {
    expect(normalizeProblemImportanceEntry({ status: 'learning', important: true })).toEqual({ status: 'learning', importance: 3 });
    expect(normalizeProblemImportanceEntry({ important: false })).toEqual({ importance: undefined });
  });

  it('prefers an explicit rating over the legacy flag', () => {
    expect(normalizeProblemImportanceEntry({ importance: 5, important: true })).toEqual({ importance: 5 });
  });
});