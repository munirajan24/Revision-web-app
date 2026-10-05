export type JobApplicationTrack = 'android' | 'springBoot';
export type JobApplicationPlatform = 'naukri' | 'linkedin' | 'other';

export interface JobApplicationDay {
  android: JobApplicationPlatform[];
  springBoot: JobApplicationPlatform[];
}

export interface JobApplicationStore {
  version: 1;
  intervalDays: number;
  startDate: string;
  completionByDate: Record<string, JobApplicationDay>;
}

export interface JobApplicationProgress {
  scheduled: boolean;
  androidCompleted: number;
  springBootCompleted: number;
  completed: number;
  total: number;
  completionPercent: number;
}

export const JOB_APPLICATION_STORAGE_KEY = 'kotlin-interview-trainer-job-applications-v1';
export const JOB_APPLICATION_PLATFORMS: JobApplicationPlatform[] = ['naukri', 'linkedin', 'other'];

export function createJobApplicationStore(startDate = getLocalDateKey()): JobApplicationStore {
  return { version: 1, intervalDays: 2, startDate, completionByDate: {} };
}

export function loadJobApplicationStore(
  storage: Pick<Storage, 'getItem'>,
  today = getLocalDateKey(),
): JobApplicationStore {
  const raw = storage.getItem(JOB_APPLICATION_STORAGE_KEY);
  if (!raw) return createJobApplicationStore(today);

  try {
    const parsed: unknown = JSON.parse(raw);
    if (isJobApplicationStore(parsed)) return parsed;
  } catch {
    return createJobApplicationStore(today);
  }

  return createJobApplicationStore(today);
}

export function saveJobApplicationStore(
  storage: Pick<Storage, 'setItem'>,
  store: JobApplicationStore,
): void {
  storage.setItem(JOB_APPLICATION_STORAGE_KEY, JSON.stringify(store));
}

export function isJobApplicationStore(value: unknown): value is JobApplicationStore {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<JobApplicationStore>;
  if (candidate.version !== 1 || !Number.isInteger(candidate.intervalDays) || candidate.intervalDays! < 1 || candidate.intervalDays! > 7) return false;
  if (!isCalendarDate(candidate.startDate ?? '') || !candidate.completionByDate || typeof candidate.completionByDate !== 'object' || Array.isArray(candidate.completionByDate)) return false;

  return Object.entries(candidate.completionByDate).every(([date, day]) => (
    isCalendarDate(date)
    && isJobApplicationDay(day)
  ));
}

export function isJobApplicationScheduled(date: string, store: JobApplicationStore): boolean {
  if (!isCalendarDate(date) || !isCalendarDate(store.startDate) || !Number.isInteger(store.intervalDays) || store.intervalDays < 1 || store.intervalDays > 7) return false;
  const elapsedDays = getDateOrdinal(date) - getDateOrdinal(store.startDate);
  return elapsedDays >= 0 && elapsedDays % store.intervalDays === 0;
}

export function setJobApplicationPlatformChecked(
  store: JobApplicationStore,
  date: string,
  track: JobApplicationTrack,
  platform: JobApplicationPlatform,
  checked: boolean,
): JobApplicationStore {
  if (!isCalendarDate(date) || !JOB_APPLICATION_PLATFORMS.includes(platform)) return store;

  const currentDay = store.completionByDate[date] ?? { android: [], springBoot: [] };
  const checkedPlatforms = new Set(currentDay[track]);
  if (checked) checkedPlatforms.add(platform);
  else checkedPlatforms.delete(platform);

  return {
    ...store,
    completionByDate: {
      ...store.completionByDate,
      [date]: { ...currentDay, [track]: JOB_APPLICATION_PLATFORMS.filter((item) => checkedPlatforms.has(item)) },
    },
  };
}

export function getJobApplicationProgress(store: JobApplicationStore, date: string): JobApplicationProgress {
  const day = store.completionByDate[date] ?? { android: [], springBoot: [] };
  const androidCompleted = JOB_APPLICATION_PLATFORMS.filter((platform) => day.android.includes(platform)).length;
  const springBootCompleted = JOB_APPLICATION_PLATFORMS.filter((platform) => day.springBoot.includes(platform)).length;
  const completed = androidCompleted + springBootCompleted;
  const total = JOB_APPLICATION_PLATFORMS.length * 2;

  return {
    scheduled: isJobApplicationScheduled(date, store),
    androidCompleted,
    springBootCompleted,
    completed,
    total,
    completionPercent: Math.round((completed / total) * 100),
  };
}

export function getLocalDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isJobApplicationDay(value: unknown): value is JobApplicationDay {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<JobApplicationDay>;
  return isPlatformList(candidate.android) && isPlatformList(candidate.springBoot);
}

function isPlatformList(value: unknown): value is JobApplicationPlatform[] {
  return Array.isArray(value) && value.every((platform) => JOB_APPLICATION_PLATFORMS.includes(platform));
}

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function getDateOrdinal(value: string): number {
  const [year, month, day] = value.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}