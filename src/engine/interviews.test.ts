import { describe, expect, it } from 'vitest';
import {
  createInterview,
  createInterviewStore,
  getChecklistProgress,
  getInterviewForDate,
  getInterviewProgress,
  INTERVIEW_STORAGE_KEY,
  loadInterviewStore,
  saveInterviewStore,
  setInterviewChecklistItem,
  type SkillChecklist,
} from './interviews';

const catalog: SkillChecklist[] = [
  {
    id: 'kotlin',
    title: 'Kotlin',
    sections: [{
      id: 'basics',
      title: 'Basics',
      items: [
        { id: 'null-safety', text: 'Explain null safety' },
        { id: 'coroutines', text: 'Explain coroutines' },
      ],
    }],
  },
  {
    id: 'java',
    title: 'Java',
    sections: [{ id: 'core', title: 'Core Java', items: [{ id: 'collections', text: 'Describe collections' }] }],
  },
];

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe('interview checklist tracking', () => {
  it('allows multiple interviews on one date and snapshots each selected checklist', () => {
    const source = structuredClone(catalog);
    const first = createInterview('2026-10-02', ['kotlin', 'java'], source, { id: 'first' });
    const second = createInterview('2026-10-02', ['kotlin'], source, { id: 'second' });

    expect(first.checklists.map((checklist) => checklist.checklistId)).toEqual(['kotlin', 'java']);
    expect(second.date).toBe(first.date);
    source[0].sections[0].items.pop();
    expect(first.checklists[0].sections[0].items).toHaveLength(2);
  });

  it('tracks completion independently from attendance and computes weighted percentages', () => {
    const interview = createInterview('2026-10-02', ['kotlin', 'java'], catalog, { id: 'first' });
    const updated = setInterviewChecklistItem(interview, 'kotlin', 'null-safety', true);
    const kotlinProgress = getChecklistProgress(updated.checklists[0]);
    const overallProgress = getInterviewProgress(updated);

    expect(updated.attendance).toBe('scheduled');
    expect(kotlinProgress).toMatchObject({ completed: 1, total: 2, completionPercent: 50, remainingPercent: 50 });
    expect(overallProgress).toMatchObject({ completed: 1, total: 3, completionPercent: 33, remainingPercent: 67 });
    expect(getInterviewProgress({ ...updated, attendance: 'attended' })).toEqual(overallProgress);
  });

  it('selects an interview for the active date and ignores a preferred interview from another date', () => {
    const first = createInterview('2026-10-01', ['kotlin'], catalog, { id: 'first', now: '2026-09-01T10:00:00.000Z' });
    const second = createInterview('2026-10-02', ['java'], catalog, { id: 'second', now: '2026-09-01T11:00:00.000Z' });
    const sameDay = createInterview('2026-10-02', ['kotlin'], catalog, { id: 'same-day', now: '2026-09-01T12:00:00.000Z' });

    expect(getInterviewForDate([first, second, sameDay], '2026-10-02', first.id)?.id).toBe(second.id);
    expect(getInterviewForDate([first, second, sameDay], '2026-10-02', sameDay.id)?.id).toBe(sameDay.id);
    expect(getInterviewForDate([first, second], '2026-10-03')).toBeUndefined();
  });

  it('treats an empty checklist as zero remaining and completion', () => {
    const progress = getChecklistProgress({
      checklistId: 'empty',
      checklistTitle: 'Empty',
      sections: [],
      completedItemIds: [],
    });

    expect(progress).toMatchObject({ total: 0, completionPercent: 0, remainingPercent: 0 });
  });

  it('persists interview data under its own key and falls back to seed data when malformed', () => {
    const storage = memoryStorage();
    const store = createInterviewStore(catalog);
    store.interviews.push(createInterview('2026-10-02', ['kotlin'], catalog, { id: 'first' }));
    saveInterviewStore(storage, store);

    expect(storage.getItem(INTERVIEW_STORAGE_KEY)).toBeTruthy();
    expect(loadInterviewStore(storage, [])).toEqual(store);

    storage.setItem(INTERVIEW_STORAGE_KEY, '{broken');
    expect(loadInterviewStore(storage, catalog)).toEqual(createInterviewStore(catalog));
  });

  it('adds missing code-term metadata to saved catalogs and interview snapshots without replacing edited text', () => {
    const storage = memoryStorage();
    const savedCatalog = structuredClone(catalog);
    savedCatalog[0].sections[0].items[0].text = 'Edited val explanation';
    const store = createInterviewStore(savedCatalog);
    const interview = createInterview('2026-10-02', ['kotlin'], savedCatalog, { id: 'legacy' });
    interview.checklists[0].completedItemIds.push('null-safety');
    store.interviews.push(interview);
    saveInterviewStore(storage, store);
    const seed = structuredClone(savedCatalog);
    seed[0].sections[0].items[0].codeTerms = ['val'];

    const restored = loadInterviewStore(storage, seed);

    expect(restored.catalog[0].sections[0].items[0]).toMatchObject({
      text: 'Edited val explanation',
      codeTerms: ['val'],
    });
    expect(restored.interviews[0].checklists[0].sections[0].items[0]).toMatchObject({
      text: 'Edited val explanation',
      codeTerms: ['val'],
    });
    expect(restored.interviews[0].checklists[0].completedItemIds).toEqual(['null-safety']);
  });

  it('rejects invalid calendar dates and missing checklist selections', () => {
    expect(() => createInterview('2026-02-30', ['kotlin'], catalog)).toThrow(/YYYY-MM-DD/);
    expect(() => createInterview('2026-10-02', [], catalog)).toThrow(/at least one checklist/);
  });
});