import { describe, expect, it } from 'vitest';
import type { CreateMeetingValues } from '../types/meeting';
import { validateMeeting } from './validation';

const valid: CreateMeetingValues = {
  name: 'Alex',
  title: 'Standup',
  description: '',
  location: '',
  durationMinutes: 30,
  days: ['Mon'],
  startTime: '09:00',
  endTime: '10:00',
};

describe('validateMeeting', () => {
  it('accepts valid values', () => {
    expect(validateMeeting(valid)).toBeNull();
  });

  it.each([
    [{ name: ' ' }, 'Enter your name.'],
    [{ title: '' }, 'Enter a meeting title.'],
    [{ days: [] }, 'Pick at least one day.'],
    [{ endTime: '09:00' }, 'End time must be after start time.'],
  ])('rejects %o', (change, message) => {
    expect(validateMeeting({ ...valid, ...change })).toBe(message);
  });
});
