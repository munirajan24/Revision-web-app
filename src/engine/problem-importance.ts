export type ProblemImportance = 1 | 2 | 3 | 4 | 5;

export const problemImportanceOptions: Array<{ value: ProblemImportance; label: string }> = [
  { value: 1, label: 'Not important' },
  { value: 2, label: 'Slightly important' },
  { value: 3, label: 'Moderately important' },
  { value: 4, label: 'Very important' },
  { value: 5, label: 'Essential / must know' },
];

export function normalizeProblemImportance(value: unknown, legacyImportant?: unknown): ProblemImportance | undefined {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5) {
    return value as ProblemImportance;
  }

  return legacyImportant === true ? 3 : undefined;
}

export function normalizeProblemImportanceEntry<T extends { importance?: unknown; important?: unknown }>(entry: T): Omit<T, 'important'> & { importance?: ProblemImportance } {
  const { important, ...currentEntry } = entry;
  const importance = normalizeProblemImportance(entry.importance, important);

  return { ...currentEntry, importance };
}

export function getProblemImportanceLabel(value?: ProblemImportance): string {
  if (value === undefined) return 'Not Rated / New';
  return problemImportanceOptions[value - 1].label;
}