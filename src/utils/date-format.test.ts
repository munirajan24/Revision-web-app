import { describe, expect, it } from 'vitest';
import { formatAppDate, formatAppDateKey, formatAppDateTime, formatAppFileDateTime } from './date-format';

describe('app date formatting', () => {
  it('formats dates as day-month-year', () => {
    expect(formatAppDate(new Date(2026, 10, 23, 12))).toBe('23-11-2026');
    expect(formatAppDateKey('2026-11-23')).toBe('23-11-2026');
  });

  it('shows 12-hour time with minutes and AM/PM in app date-times', () => {
    expect(formatAppDateTime(new Date(2026, 10, 23, 23, 59, 59))).toBe('23-11-2026 11:59 PM');
    expect(formatAppDateTime(new Date(2026, 10, 23, 0, 0))).toBe('23-11-2026 12:00 AM');
    expect(formatAppDateTime(new Date(2026, 10, 23, 12, 0))).toBe('23-11-2026 12:00 PM');
    expect(formatAppDateTime(new Date(2026, 10, 23, 14, 2))).toBe('23-11-2026 2:02 PM');
  });

  it('uses compact am/pm time only for text-file names', () => {
    expect(formatAppFileDateTime(new Date(2026, 10, 23, 23, 59, 59))).toBe('23-11-2026 11pm');
    expect(formatAppFileDateTime(new Date(2026, 10, 23, 0, 0))).toBe('23-11-2026 12am');
    expect(formatAppFileDateTime(new Date(2026, 10, 23, 12, 0))).toBe('23-11-2026 12pm');
  });
});
