import type { CreateMeetingValues } from '../types/meeting';
import { timeToMinutes } from './time';

/** Returns a user-facing problem, or null when the values are valid. */
export const validateMeeting = (values: CreateMeetingValues): string | null => {
  if (!values.name.trim()) return 'Enter your name.';
  if (!values.title.trim()) return 'Enter a meeting title.';
  if (values.days.length === 0) return 'Pick at least one day.';
  if (timeToMinutes(values.endTime) <= timeToMinutes(values.startTime)) {
    return 'End time must be after start time.';
  }
  return null;
};
