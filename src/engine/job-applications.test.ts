import { describe, expect, it } from 'vitest';
import {
  createJobApplicationStore,
  getJobApplicationProgress,
  isJobApplicationScheduled,
  JOB_APPLICATION_STORAGE_KEY,
  loadJobApplicationStore,
  saveJobApplicationStore,
  setJobApplicationPlatformChecked,
  type JobApplicationStore,
} from './job-applications';

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe('job application schedule', () => {
  it('defaults to every two days and supports daily through weekly intervals', () => {
    const store = createJobApplicationStore('2026-10-05');
    expect(store.intervalDays).toBe(2);
    expect(isJobApplicationScheduled('2026-10-05', store)).toBe(true);
    expect(isJobApplicationScheduled('2026-10-06', store)).toBe(false);
    expect(isJobApplicationScheduled('2026-10-07', store)).toBe(true);
    expect(isJobApplicationScheduled('2026-10-04', store)).toBe(false);
    expect([1, 2, 3, 4, 5, 6, 7].every((intervalDays) => isJobApplicationScheduled('2026-10-05', { ...store, intervalDays }))).toBe(true);
  });

  it('keeps the fixed interval across month and year boundaries', () => {
    const store = { ...createJobApplicationStore('2026-12-30'), intervalDays: 2 };
    expect(isJobApplicationScheduled('2027-01-01', store)).toBe(true);
    expect(isJobApplicationScheduled('2027-01-02', store)).toBe(false);
  });

  it('tracks platform completion independently by role and date', () => {
    const store = createJobApplicationStore('2026-10-05');
    const withAndroid = setJobApplicationPlatformChecked(store, '2026-10-05', 'android', 'naukri', true);
    const withBackend = setJobApplicationPlatformChecked(withAndroid, '2026-10-05', 'springBoot', 'linkedin', true);
    const progress = getJobApplicationProgress(withBackend, '2026-10-05');

    expect(progress).toMatchObject({ androidCompleted: 1, springBootCompleted: 1, completed: 2, total: 6, completionPercent: 33 });
    expect(getJobApplicationProgress(withBackend, '2026-10-07').completed).toBe(0);
    expect(getJobApplicationProgress(withBackend, '2026-10-06')).toMatchObject({ scheduled: false, completed: 0 });
  });

  it('validates frequency and completion data when loading or importing', () => {
    const storage = memoryStorage();
    const store: JobApplicationStore = {
      ...createJobApplicationStore('2026-10-05'),
      completionByDate: { '2026-10-05': { android: ['naukri'], springBoot: [] } },
    };
    saveJobApplicationStore(storage, store);
    expect(storage.getItem(JOB_APPLICATION_STORAGE_KEY)).toBeTruthy();
    expect(loadJobApplicationStore(storage, '2026-10-06')).toEqual(store);

    storage.setItem(JOB_APPLICATION_STORAGE_KEY, JSON.stringify({ ...store, intervalDays: 8 }));
    expect(loadJobApplicationStore(storage, '2026-10-06')).toEqual(createJobApplicationStore('2026-10-06'));
  });
});