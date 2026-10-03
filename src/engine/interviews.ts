export interface ChecklistItem {
  id: string;
  text: string;
  codeTerms?: string[];
  priority?: 'high' | 'low';
}

export interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface SkillChecklist {
  id: string;
  title: string;
  sections: ChecklistSection[];
}

export type InterviewAttendance = 'scheduled' | 'attended' | 'not_attended';

export interface InterviewChecklist {
  checklistId: string;
  checklistTitle: string;
  sections: ChecklistSection[];
  completedItemIds: string[];
}

export interface InterviewRecord {
  id: string;
  date: string;
  title: string;
  company: string;
  notes: string;
  attendance: InterviewAttendance;
  checklists: InterviewChecklist[];
  createdAt: string;
}

export interface InterviewStore {
  version: 1;
  catalog: SkillChecklist[];
  interviews: InterviewRecord[];
}

export interface ChecklistProgress {
  completed: number;
  total: number;
  completionPercent: number;
  remainingPercent: number;
}

export const INTERVIEW_STORAGE_KEY = 'kotlin-interview-trainer-interviews-v1';

export function createInterviewStore(catalog: SkillChecklist[]): InterviewStore {
  return { version: 1, catalog: structuredClone(catalog), interviews: [] };
}

export function loadInterviewStore(
  storage: Pick<Storage, 'getItem'>,
  seedCatalog: SkillChecklist[],
): InterviewStore {
  const raw = storage.getItem(INTERVIEW_STORAGE_KEY);
  if (!raw) return createInterviewStore(seedCatalog);

  try {
    const parsed: unknown = JSON.parse(raw);
    if (isInterviewStore(parsed)) {
      return {
        ...parsed,
        catalog: addSeedCodeTerms(parsed.catalog, seedCatalog),
        interviews: addInterviewSnapshotCodeTerms(parsed.interviews, seedCatalog),
      };
    }
  } catch {
    return createInterviewStore(seedCatalog);
  }

  return createInterviewStore(seedCatalog);
}

export function saveInterviewStore(
  storage: Pick<Storage, 'setItem'>,
  store: InterviewStore,
): void {
  storage.setItem(INTERVIEW_STORAGE_KEY, JSON.stringify(store));
}

export function createInterview(
  date: string,
  checklistIds: string[],
  catalog: SkillChecklist[],
  options: { id?: string; now?: string; title?: string; company?: string } = {},
): InterviewRecord {
  if (!isCalendarDate(date)) throw new Error('Interview date must use YYYY-MM-DD.');

  const checklists = checklistIds.map((checklistId) => {
    const checklist = catalog.find((entry) => entry.id === checklistId);
    if (!checklist) throw new Error(`Unknown checklist: ${checklistId}`);

    return {
      checklistId: checklist.id,
      checklistTitle: checklist.title,
      sections: structuredClone(checklist.sections),
      completedItemIds: [],
    };
  });

  if (checklists.length === 0) throw new Error('Choose at least one checklist.');

  return {
    id: options.id ?? createId(),
    date,
    title: options.title ?? '',
    company: options.company ?? '',
    notes: '',
    attendance: 'scheduled',
    checklists,
    createdAt: options.now ?? new Date().toISOString(),
  };
}

export function getInterviewForDate(
  interviews: InterviewRecord[],
  date: string,
  preferredInterviewId?: string | null,
): InterviewRecord | undefined {
  const dayInterviews = interviews
    .filter((interview) => interview.date === date)
    .sort((first, second) => first.createdAt.localeCompare(second.createdAt));
  return dayInterviews.find((interview) => interview.id === preferredInterviewId) ?? dayInterviews[0];
}

export function setInterviewChecklistItem(
  interview: InterviewRecord,
  checklistId: string,
  itemId: string,
  checked: boolean,
): InterviewRecord {
  return {
    ...interview,
    checklists: interview.checklists.map((checklist) => {
      if (checklist.checklistId !== checklistId) return checklist;
      const itemExists = checklist.sections.some((section) => section.items.some((item) => item.id === itemId));
      if (!itemExists) return checklist;

      const completed = new Set(checklist.completedItemIds);
      if (checked) completed.add(itemId);
      else completed.delete(itemId);

      return { ...checklist, completedItemIds: [...completed] };
    }),
  };
}

export function getChecklistProgress(checklist: InterviewChecklist): ChecklistProgress {
  const itemIds = checklist.sections.flatMap((section) => section.items.map((item) => item.id));
  const completed = itemIds.filter((itemId) => checklist.completedItemIds.includes(itemId)).length;
  const total = itemIds.length;
  const completionPercent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    completed,
    total,
    completionPercent,
    remainingPercent: total === 0 ? 0 : 100 - completionPercent,
  };
}

export function getInterviewProgress(interview: InterviewRecord): ChecklistProgress {
  const progress = interview.checklists.map(getChecklistProgress);
  const total = progress.reduce((sum, checklist) => sum + checklist.total, 0);
  const completed = progress.reduce((sum, checklist) => sum + checklist.completed, 0);
  const completionPercent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    completed,
    total,
    completionPercent,
    remainingPercent: total === 0 ? 0 : 100 - completionPercent,
  };
}

export function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `interview-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isInterviewStore(value: unknown): value is InterviewStore {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<InterviewStore>;
  return candidate.version === 1 && Array.isArray(candidate.catalog) && Array.isArray(candidate.interviews);
}

function addSeedCodeTerms(catalog: SkillChecklist[], seedCatalog: SkillChecklist[]): SkillChecklist[] {
  const seedsById = new Map(seedCatalog.map((checklist) => [checklist.id, checklist]));

  return catalog.map((checklist) => {
    const seedChecklist = seedsById.get(checklist.id);
    if (!seedChecklist) return checklist;

    return {
      ...checklist,
      sections: addSectionCodeTerms(checklist.sections, seedChecklist.sections),
    };
  });
}

function addInterviewSnapshotCodeTerms(
  interviews: InterviewRecord[],
  seedCatalog: SkillChecklist[],
): InterviewRecord[] {
  const seedsById = new Map(seedCatalog.map((checklist) => [checklist.id, checklist]));

  return interviews.map((interview) => ({
    ...interview,
    checklists: interview.checklists.map((checklist) => {
      const seedChecklist = seedsById.get(checklist.checklistId);
      if (!seedChecklist) return checklist;
      return { ...checklist, sections: addSectionCodeTerms(checklist.sections, seedChecklist.sections) };
    }),
  }));
}

function addSectionCodeTerms(
  sections: ChecklistSection[],
  seedSections: ChecklistSection[],
): ChecklistSection[] {
  return sections.map((section) => {
    const seedSection = seedSections.find((entry) => entry.id === section.id);
    if (!seedSection) return section;

    return {
      ...section,
      items: section.items.map((item) => {
        if (item.codeTerms?.length) return item;
        const seedItem = seedSection.items.find((entry) => entry.id === item.id);
        const codeTerms = seedItem?.codeTerms?.filter((term) => item.text.includes(term));
        return codeTerms?.length ? { ...item, codeTerms } : item;
      }),
    };
  });
}