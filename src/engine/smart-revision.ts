export const SMART_REVISION_STORAGE_KEY = 'kotlin-interview-trainer-mobile-revision-v1';
export const DAY_MS = 24 * 60 * 60 * 1000;

export const SMART_REVISION_CONFIG = {
  schemaVersion: 1 as const,
  boxGapDays: [1, 3, 7, 14, 30] as const,
  priorityGapMultiplier: { 0: 1, 1: 0.75, 2: 0.5 } as const,
  sessionSize: 10,
  allowedSessionSizes: [5, 10, 15, 20, 30] as const,
  defaultSlots: { due: 30, weak: 20, new: 50 },
  scoreWeights: { overdue: 3, priority: 1.5, errorRate: 2, unseen: 1, age: 0.5, recent: -2 },
} as const;

export type RevisionPriority = 0 | 1 | 2;
export type RevisionPool = 'due' | 'weak' | 'new' | 'rest';
export type RevisionPickReason = RevisionPool | 'priority' | 'filler';
export type RevisionResult = 'correct' | 'incorrect' | 'skipped' | 'unavailable';

export interface RevisionQuestionRecord {
  priority: RevisionPriority;
  box: number;
  dueAt: number | null;
  lastSeenAt: number | null;
  cycle: number;
  recentSessions: string[];
  autoPromoted: boolean;
  lastResult?: Exclude<RevisionResult, 'unavailable'>;
}

export interface RevisionAssessmentEvent {
  questionId: string;
  result: RevisionResult;
  before: RevisionQuestionRecord;
}

export interface SmartRevisionData {
  version: 1;
  currentCycle: number;
  interviewDate: number | null;
  settings: {
    sessionSize: number;
    slots: { due: number; weak: number; new: number };
  };
  questions: Record<string, RevisionQuestionRecord>;
  assessmentEvents: Record<string, RevisionAssessmentEvent>;
  modifiedAt: number;
}

export interface RevisionQuestionInput {
  id: string;
  sectionId: string;
  stats?: { attended: number; correct: number; wrong: number; skipped: number };
}

export interface RevisionCandidate extends RevisionQuestionInput {
  record: RevisionQuestionRecord;
}

export interface RevisionPick {
  questionId: string;
  reason: RevisionPickReason;
  score: number;
}

export interface RevisionSelection {
  picks: RevisionPick[];
  data: SmartRevisionData;
  cycleAdvanced: boolean;
}

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

function isTimestamp(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function defaultRevisionQuestion(): RevisionQuestionRecord {
  return { priority: 0, box: 1, dueAt: null, lastSeenAt: null, cycle: 0, recentSessions: [], autoPromoted: false };
}

export function emptySmartRevisionData(now = 0): SmartRevisionData {
  return {
    version: 1,
    currentCycle: 1,
    interviewDate: null,
    settings: { sessionSize: SMART_REVISION_CONFIG.sessionSize, slots: { ...SMART_REVISION_CONFIG.defaultSlots } },
    questions: {},
    assessmentEvents: {},
    modifiedAt: now,
  };
}

function parseQuestionRecord(value: unknown): RevisionQuestionRecord | undefined {
  if (!isRecord(value)
    || ![0, 1, 2].includes(value.priority as number)
    || !Number.isInteger(value.box) || (value.box as number) < 1 || (value.box as number) > 5
    || (value.dueAt !== null && !isTimestamp(value.dueAt))
    || (value.lastSeenAt !== null && !isTimestamp(value.lastSeenAt))
    || !Number.isInteger(value.cycle) || (value.cycle as number) < 0
    || !Array.isArray(value.recentSessions) || !value.recentSessions.every((id) => typeof id === 'string')
    || typeof value.autoPromoted !== 'boolean'
    || (value.lastResult !== undefined && !['correct', 'incorrect', 'skipped'].includes(String(value.lastResult)))) return undefined;
  return {
    priority: value.priority as RevisionPriority,
    box: value.box as number,
    dueAt: value.dueAt as number | null,
    lastSeenAt: value.lastSeenAt as number | null,
    cycle: value.cycle as number,
    recentSessions: (value.recentSessions as string[]).slice(-3),
    autoPromoted: value.autoPromoted,
    ...(value.lastResult ? { lastResult: value.lastResult as RevisionQuestionRecord['lastResult'] } : {}),
  };
}

export function parseSmartRevisionData(value: unknown): SmartRevisionData | undefined {
  if (!isRecord(value) || !isRecord(value.settings) || !isRecord(value.questions) || !isRecord(value.assessmentEvents)) return undefined;
  const settings = value.settings;
  if (!isRecord(settings.slots)) return undefined;
  const slots = settings.slots;
  if (!['due', 'weak', 'new'].every((key) => Number.isInteger(slots[key]) && (slots[key] as number) >= 0)
    || value.version !== 1 || !Number.isInteger(value.currentCycle) || (value.currentCycle as number) < 1
    || (value.interviewDate !== null && !isTimestamp(value.interviewDate))
    || !Number.isInteger(settings.sessionSize) || (settings.sessionSize as number) < 5 || (settings.sessionSize as number) > 30
    || (slots.due as number) + (slots.weak as number) + (slots.new as number) !== 100
    || !isTimestamp(value.modifiedAt)) return undefined;

  const questions: Record<string, RevisionQuestionRecord> = {};
  for (const [id, record] of Object.entries(value.questions)) {
    const parsed = parseQuestionRecord(record);
    if (!parsed) return undefined;
    questions[id] = parsed;
  }
  const assessmentEvents: Record<string, RevisionAssessmentEvent> = {};
  for (const [id, event] of Object.entries(value.assessmentEvents)) {
    if (!isRecord(event) || typeof event.questionId !== 'string'
      || !['correct', 'incorrect', 'skipped', 'unavailable'].includes(String(event.result))) return undefined;
    const before = parseQuestionRecord(event.before);
    if (!before) return undefined;
    assessmentEvents[id] = { questionId: event.questionId, result: event.result as RevisionResult, before };
  }
  return {
    version: 1,
    currentCycle: value.currentCycle as number,
    interviewDate: value.interviewDate as number | null,
    settings: {
      sessionSize: settings.sessionSize as number,
      slots: { due: slots.due as number, weak: slots.weak as number, new: slots.new as number },
    },
    questions,
    assessmentEvents,
    modifiedAt: value.modifiedAt,
  };
}

export function loadSmartRevisionData(storage: Pick<Storage, 'getItem'>): SmartRevisionData {
  try {
    const serialized = storage.getItem(SMART_REVISION_STORAGE_KEY);
    if (!serialized) return emptySmartRevisionData();
    return parseSmartRevisionData(JSON.parse(serialized)) ?? emptySmartRevisionData();
  } catch {
    return emptySmartRevisionData();
  }
}

export function saveSmartRevisionData(storage: Pick<Storage, 'setItem'>, data: SmartRevisionData): void {
  storage.setItem(SMART_REVISION_STORAGE_KEY, JSON.stringify(data));
}

export function getRevisionRecord(data: SmartRevisionData, questionId: string): RevisionQuestionRecord {
  return data.questions[questionId] ?? defaultRevisionQuestion();
}

export function setRevisionPriority(
  data: SmartRevisionData,
  questionId: string,
  priority: RevisionPriority,
  now: number,
): SmartRevisionData {
  return {
    ...data,
    modifiedAt: now,
    questions: {
      ...data.questions,
      [questionId]: { ...getRevisionRecord(data, questionId), priority, autoPromoted: false },
    },
  };
}

export function autoPromoteQuestion(
  data: SmartRevisionData,
  questionId: string,
  wrongCount: number,
  now: number,
): SmartRevisionData {
  const record = getRevisionRecord(data, questionId);
  const priority: RevisionPriority = wrongCount >= 3 ? 2 : wrongCount >= 2 ? 1 : 0;
  if (priority <= record.priority) return data;
  return {
    ...data,
    modifiedAt: now,
    questions: { ...data.questions, [questionId]: { ...record, priority, autoPromoted: true } },
  };
}

function scheduledDueAt(record: RevisionQuestionRecord, now: number): number {
  const days = SMART_REVISION_CONFIG.boxGapDays[record.box - 1]
    * SMART_REVISION_CONFIG.priorityGapMultiplier[record.priority];
  return now + days * DAY_MS;
}

export function applyRevisionAssessment(
  data: SmartRevisionData,
  questionId: string,
  sessionId: string,
  result: RevisionResult,
  now: number,
): SmartRevisionData {
  const eventId = JSON.stringify([sessionId, questionId]);
  const previousEvent = data.assessmentEvents[eventId];
  if (previousEvent?.result === result) return data;
  const savedBefore = previousEvent?.before ?? getRevisionRecord(data, questionId);
  const currentRecord = getRevisionRecord(data, questionId);
  const before = previousEvent
    ? { ...savedBefore, priority: currentRecord.priority, autoPromoted: currentRecord.autoPromoted }
    : savedBefore;
  if (result === 'unavailable') {
    if (previousEvent) {
      const { [eventId]: _removed, ...assessmentEvents } = data.assessmentEvents;
      return {
        ...data,
        modifiedAt: now,
        assessmentEvents,
        questions: { ...data.questions, [questionId]: before },
      };
    }
    return data;
  }

  let updated: RevisionQuestionRecord = { ...before };
  if (result === 'incorrect') {
    updated = { ...updated, box: 1, dueAt: now, lastResult: 'incorrect' };
  } else if (result === 'skipped') {
    updated = {
      ...updated,
      dueAt: updated.dueAt === null ? now + DAY_MS : Math.min(updated.dueAt, now + DAY_MS),
      lastResult: 'skipped',
    };
  } else {
    updated = { ...updated, box: Math.min(updated.box + 1, 5), lastResult: 'correct' };
    updated.dueAt = scheduledDueAt(updated, now);
  }
  updated.lastSeenAt = now;
  updated.cycle = data.currentCycle;
  updated.recentSessions = [...updated.recentSessions.filter((id) => id !== sessionId), sessionId].slice(-3);
  return {
    ...data,
    modifiedAt: now,
    questions: { ...data.questions, [questionId]: updated },
    assessmentEvents: { ...data.assessmentEvents, [eventId]: { questionId, result, before } },
  };
}

export function classifyRevisionPool(
  record: RevisionQuestionRecord,
  stats: RevisionQuestionInput['stats'],
  now: number,
  currentCycle: number,
): RevisionPool {
  if (record.dueAt !== null && record.dueAt <= now) return 'due';
  if (((stats?.wrong ?? 0) > 0 && record.box <= 2) || record.lastResult === 'incorrect' || record.lastResult === 'skipped') return 'weak';
  if (record.cycle < currentCycle) return 'new';
  return 'rest';
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));

export function getRevisionScore(
  candidate: RevisionCandidate,
  now: number,
  askedRecentlyPenalty = true,
): number {
  const { record, stats } = candidate;
  const gap = SMART_REVISION_CONFIG.boxGapDays[record.box - 1]
    * SMART_REVISION_CONFIG.priorityGapMultiplier[record.priority];
  const overdueRatio = record.dueAt === null ? 0 : clamp((now - record.dueAt) / Math.max(gap, 1) / DAY_MS, 0, 2);
  const errorRate = clamp((stats?.wrong ?? 0) / Math.max(stats?.attended ?? 0, 1), 0, 1);
  const unseenBonus = (stats?.attended ?? 0) === 0 ? 1 : 0;
  const ageFactor = record.lastSeenAt === null ? 1 : clamp((now - record.lastSeenAt) / DAY_MS / 30, 0, 1);
  const askedRecently = askedRecentlyPenalty && record.recentSessions.length > 0 ? 1 : 0;
  const weights = SMART_REVISION_CONFIG.scoreWeights;
  return Math.max(0.1, weights.overdue * overdueRatio + weights.priority * record.priority
    + weights.errorRate * errorRate + weights.unseen * unseenBonus + weights.age * ageFactor
    + weights.recent * askedRecently);
}

export function calculateSlotCounts(size: number, slots: { due: number; weak: number; new: number }): Record<RevisionPool, number> {
  if (size <= 0) return { due: 0, weak: 0, new: 0, rest: 0 };
  const values = (['due', 'weak', 'new'] as const).map((pool) => {
    const raw = size * slots[pool] / 100;
    return { pool, count: Math.floor(raw), remainder: raw - Math.floor(raw) };
  });
  let left = size - values.reduce((total, entry) => total + entry.count, 0);
  values.sort((first, second) => second.remainder - first.remainder);
  for (let index = 0; index < left; index += 1) values[index % values.length].count += 1;
  const counts: Record<RevisionPool, number> = { due: 0, weak: 0, new: 0, rest: 0 };
  values.forEach(({ pool, count }) => { counts[pool] = count; });
  return counts;
}

function calculateSlotsWithPriority(
  size: number,
  slots: { due: number; weak: number; new: number },
  priorityPercent: number,
): { due: number; weak: number; new: number; priority: number } {
  const percentages = { ...slots, priority: priorityPercent };
  const entries = (['due', 'weak', 'new', 'priority'] as const).map((pool) => {
    const raw = size * percentages[pool] / 100;
    return { pool, count: Math.floor(raw), remainder: raw - Math.floor(raw) };
  });
  let left = size - entries.reduce((total, entry) => total + entry.count, 0);
  entries.sort((first, second) => second.remainder - first.remainder);
  for (let index = 0; index < left; index += 1) entries[index % entries.length].count += 1;
  return {
    due: entries.find((entry) => entry.pool === 'due')!.count,
    weak: entries.find((entry) => entry.pool === 'weak')!.count,
    new: entries.find((entry) => entry.pool === 'new')!.count,
    priority: entries.find((entry) => entry.pool === 'priority')!.count,
  };
}

export function weightedSample<T>(items: T[], count: number, score: (item: T) => number, random: () => number): T[] {
  return items.map((item) => {
    const weight = Math.max(score(item), 0.1);
    const value = clamp(random(), Number.EPSILON, 1);
    return { item, key: value ** (1 / weight) };
  }).sort((first, second) => second.key - first.key).slice(0, Math.max(0, count)).map(({ item }) => item);
}

function splitForDate(data: SmartRevisionData, now: number): { slots: { due: number; weak: number; new: number }; priority: number; finalDays: boolean } {
  if (data.interviewDate === null) return { slots: data.settings.slots, priority: 0, finalDays: false };
  const daysLeft = Math.floor((localDay(data.interviewDate) - localDay(now)) / DAY_MS);
  if (daysLeft < 0) return { slots: data.settings.slots, priority: 0, finalDays: false };
  if (daysLeft >= 14) return { slots: { due: 15, weak: 15, new: 50 }, priority: 20, finalDays: false };
  if (daysLeft >= 7) return { slots: { due: 17, weak: 18, new: 30 }, priority: 35, finalDays: false };
  if (daysLeft >= 2) return { slots: { due: 20, weak: 20, new: 10 }, priority: 50, finalDays: false };
  return { slots: { due: 15, weak: 15, new: 0 }, priority: 70, finalDays: true };
}

export function getRevisionMix(data: SmartRevisionData, now: number): { slots: { due: number; weak: number; new: number }; priority: number; finalDays: boolean } {
  return splitForDate(data, now);
}

function localDay(value: number): number {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function interleavePicks(groups: RevisionPick[][]): RevisionPick[] {
  const result: RevisionPick[] = [];
  while (groups.some((group) => group.length)) {
    groups.forEach((group) => {
      const item = group.shift();
      if (item) result.push(item);
    });
  }
  return result;
}

function orderBySection(picks: RevisionPick[], candidates: Map<string, RevisionCandidate>, random: () => number): RevisionPick[] {
  const remaining = [...picks];
  for (let index = remaining.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(clamp(random(), 0, 0.999999) * (index + 1));
    [remaining[index], remaining[swap]] = [remaining[swap], remaining[index]];
  }
  const result: RevisionPick[] = [];
  while (remaining.length) {
    const lastThree = result.slice(-3).map((pick) => candidates.get(pick.questionId)?.sectionId);
    const allowedIndex = remaining.findIndex((pick) => !lastThree.every((id) => id === candidates.get(pick.questionId)?.sectionId));
    result.push(remaining.splice(allowedIndex < 0 ? 0 : allowedIndex, 1)[0]);
  }
  return result;
}

export function buildRevisionSelection(
  data: SmartRevisionData,
  inputs: RevisionQuestionInput[],
  options: { now: number; random: () => number; sessionSize?: number; mustKnowOnly?: boolean },
): RevisionSelection {
  const size = options.sessionSize ?? data.settings.sessionSize;
  const cycleInputs = options.mustKnowOnly ? inputs.filter((input) => getRevisionRecord(data, input.id).priority === 2) : inputs;
  const cycleAdvanced = cycleInputs.length > 0 && cycleInputs.every((input) => getRevisionRecord(data, input.id).cycle >= data.currentCycle);
  const activeData = cycleAdvanced ? { ...data, currentCycle: data.currentCycle + 1, modifiedAt: options.now } : data;
  const candidates = inputs.map((input) => ({ ...input, record: getRevisionRecord(activeData, input.id) }));
  const byId = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  const mix = splitForDate(activeData, options.now);
  const lastDaysPriority = mix.finalDays ? candidates.filter((candidate) => candidate.record.priority === 2 && candidate.record.dueAt !== null && candidate.record.dueAt > options.now) : [];
  const hasUnseenNormal = candidates.some((candidate) => candidate.record.cycle < activeData.currentCycle && candidate.record.priority === 0);
  const poolLists: Record<RevisionPool, RevisionCandidate[]> = { due: [], weak: [], new: [], rest: [] };
  candidates.forEach((candidate) => {
    if (options.mustKnowOnly && candidate.record.priority !== 2) return;
    let pool = classifyRevisionPool(candidate.record, candidate.stats, options.now, activeData.currentCycle);
    if (lastDaysPriority.includes(candidate) && pool === 'rest') pool = 'due';
    const weak = ((candidate.stats?.wrong ?? 0) > 0 && candidate.record.box <= 2)
      || candidate.record.lastResult === 'incorrect' || candidate.record.lastResult === 'skipped';
    if (hasUnseenNormal && candidate.record.cycle >= activeData.currentCycle && candidate.record.priority === 0 && !weak) return;
    poolLists[pool].push(candidate);
  });

  const availableCount = candidates.filter((candidate) => !options.mustKnowOnly || candidate.record.priority === 2).length;
  const target = Math.min(Math.max(0, size), availableCount);
  const allocated = calculateSlotsWithPriority(target, options.mustKnowOnly ? { due: 30, weak: 20, new: 50 } : mix.slots, options.mustKnowOnly ? 0 : mix.priority);
  const priorityCount = allocated.priority;
  const slots = { due: allocated.due, weak: allocated.weak, new: allocated.new, rest: 0 };
  if (!mix.finalDays && slots.new === 0 && poolLists.new.length > 0 && target > priorityCount) {
    const donor = slots.due >= slots.weak ? 'due' : 'weak';
    if (slots[donor] > 0) {
      slots[donor] -= 1;
      slots.new = 1;
    }
  }
  const scores = (candidate: RevisionCandidate) => getRevisionScore(candidate, options.now, !mix.finalDays);
  const selected: RevisionPick[] = [];
  const used = new Set<string>();
  const choose = (pool: RevisionPool, count: number) => {
    const items = poolLists[pool].filter((candidate) => !used.has(candidate.id));
    weightedSample(items, count, scores, options.random).forEach((candidate) => {
      used.add(candidate.id);
      selected.push({ questionId: candidate.id, reason: pool, score: scores(candidate) });
    });
  };

  if (!options.mustKnowOnly && mix.priority > 0) {
    const priorityQuestions = candidates.filter((candidate) => candidate.record.priority >= 1);
    weightedSample(priorityQuestions, priorityCount, scores, options.random).forEach((candidate) => {
      if (!used.has(candidate.id)) {
        used.add(candidate.id);
        selected.push({ questionId: candidate.id, reason: 'priority', score: scores(candidate) });
      }
    });
  }

  const shortageOrder: RevisionPool[] = ['new', 'due', 'weak'];
  const counts = { ...slots };
  (['due', 'weak', 'new'] as const).forEach((pool) => {
    const available = poolLists[pool].filter((candidate) => !used.has(candidate.id)).length;
    const take = Math.min(counts[pool], available);
    counts[pool] = take;
  });
  let remainder = Math.max(0, target - selected.length - counts.due - counts.weak - counts.new);
  shortageOrder.forEach((pool) => {
    const available = poolLists[pool].filter((candidate) => !used.has(candidate.id)).length - counts[pool];
    const transfer = Math.min(remainder, Math.max(0, available));
    counts[pool] += transfer;
    remainder -= transfer;
  });
  (['due', 'weak', 'new'] as const).forEach((pool) => choose(pool, counts[pool]));
  if (selected.length < target) {
    const unseen = candidates.filter((candidate) => !used.has(candidate.id)
      && candidate.record.cycle < activeData.currentCycle
      && (!options.mustKnowOnly || candidate.record.priority === 2));
    weightedSample(unseen, target - selected.length, scores, options.random).forEach((candidate) => {
      used.add(candidate.id);
      selected.push({
        questionId: candidate.id,
        reason: classifyRevisionPool(candidate.record, candidate.stats, options.now, activeData.currentCycle),
        score: scores(candidate),
      });
    });
  }
  const rest = poolLists.rest.filter((candidate) => !used.has(candidate.id));
  weightedSample(rest, target - selected.length, scores, options.random).forEach((candidate) => {
    used.add(candidate.id);
    selected.push({ questionId: candidate.id, reason: 'filler', score: scores(candidate) });
  });
  if (selected.length < target) {
    const remaining = candidates.filter((candidate) => !used.has(candidate.id));
    weightedSample(remaining, target - selected.length, scores, options.random).forEach((candidate) => {
      used.add(candidate.id);
      selected.push({ questionId: candidate.id, reason: 'filler', score: scores(candidate) });
    });
  }

  const groups = (['due', 'weak', 'new', 'priority', 'filler'] as const).map((reason) => selected.filter((pick) => pick.reason === reason));
  const interleaved = interleavePicks(groups);
  const picks = orderBySection(interleaved, byId, options.random).slice(0, target);
  return { picks, data: activeData, cycleAdvanced };
}

export function calculateCoverage(inputs: RevisionQuestionInput[], data: SmartRevisionData): number {
  if (inputs.length === 0) return 100;
  return Math.round(inputs.filter((input) => getRevisionRecord(data, input.id).cycle >= data.currentCycle).length / inputs.length * 100);
}

export function getRevisionSummary(inputs: RevisionQuestionInput[], data: SmartRevisionData, now: number) {
  const result = { dueNow: 0, dueThisWeek: 0, weak: 0, mustKnow: 0, boxes: [0, 0, 0, 0, 0], coverage: calculateCoverage(inputs, data) };
  for (const input of inputs) {
    const record = getRevisionRecord(data, input.id);
    result.boxes[record.box - 1] += 1;
    if (record.priority === 2) result.mustKnow += 1;
    if (record.dueAt !== null && record.dueAt <= now) result.dueNow += 1;
    if (record.dueAt !== null && record.dueAt <= now + 7 * DAY_MS) result.dueThisWeek += 1;
    if (((input.stats?.wrong ?? 0) > 0 && record.box <= 2) || record.lastResult === 'incorrect' || record.lastResult === 'skipped') result.weak += 1;
  }
  return result;
}

export function mergeSmartRevisionData(current: SmartRevisionData, incoming: SmartRevisionData): SmartRevisionData {
  const questions: Record<string, RevisionQuestionRecord> = {};
  for (const id of new Set([...Object.keys(current.questions), ...Object.keys(incoming.questions)])) {
    const first = current.questions[id];
    const second = incoming.questions[id];
    if (!first) { questions[id] = second; continue; }
    if (!second) { questions[id] = first; continue; }
    const winner = (second.lastSeenAt ?? -1) >= (first.lastSeenAt ?? -1) ? second : first;
    const maximumPriority = Math.max(first.priority, second.priority);
    const winningPriorityRecords = [first, second].filter((record) => record.priority === maximumPriority);
    questions[id] = {
      ...winner,
      priority: maximumPriority as RevisionPriority,
      cycle: Math.max(first.cycle, second.cycle),
      autoPromoted: winningPriorityRecords.every((record) => record.autoPromoted),
    };
  }
  const global = incoming.modifiedAt >= current.modifiedAt ? incoming : current;
  return {
    version: 1,
    currentCycle: Math.max(current.currentCycle, incoming.currentCycle),
    interviewDate: global.interviewDate,
    settings: global.settings,
    questions,
    assessmentEvents: { ...current.assessmentEvents, ...incoming.assessmentEvents },
    modifiedAt: Math.max(current.modifiedAt, incoming.modifiedAt),
  };
}
