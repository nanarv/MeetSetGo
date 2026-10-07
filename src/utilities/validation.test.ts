import { describe, expect, it } from 'vitest';
import type { CreateMeetingValues } from '../types/meeting';
import { validateMeeting } from './validation';

const TODAY = '2026-01-05'; // a Monday

const valid: CreateMeetingValues = {
  name: 'Alex',
  title: 'Standup',
  description: '',
  location: '',
  durationMinutes: 30,
  startDate: TODAY,
  endDate: '2026-01-11',
  weekdays: ['Mon'],
  startTime: '09:00',
  endTime: '10:00',
};

describe('validateMeeting', () => {
  it('accepts valid values', () => {
    expect(validateMeeting(valid, TODAY)).toBeNull();
  });

  it.each([
    [{ name: ' ' }, 'Enter your name.'],
    [{ title: '' }, 'Enter a meeting title.'],
    [{ startDate: '' }, 'Enter a start date and an end date.'],
    [{ startDate: '2026-01-04' }, "The start date can't be in the past."],
    [{ endDate: '2026-01-04' }, 'The end date must be on or after the start date.'],
    [{ weekdays: [] }, 'Pick at least one day of the week.'],
    [{ endDate: TODAY, weekdays: ['Tue'] }, 'No dates in that range fall on the selected days of the week.'],
    [{ endTime: '09:00' }, 'End time must be after start time.'],
  ] as [Partial<CreateMeetingValues>, string][])('rejects %o', (change, message) => {
    expect(validateMeeting({ ...valid, ...change }, TODAY)).toBe(message);
  });
});
