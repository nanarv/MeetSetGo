import type { CreateMeetingValues } from '../types/meeting';
import { getDatesInRange, isDateKey, MAX_DAYS, todayKey } from './dates';
import { timeToMinutes } from './time';

/** Returns a user-facing problem, or null when the values are valid. */
export const validateMeeting = (values: CreateMeetingValues, today = todayKey()): string | null => {
  if (!values.name.trim()) return 'Enter your name.';
  if (!values.title.trim()) return 'Enter a meeting title.';
  if (!isDateKey(values.startDate) || !isDateKey(values.endDate)) return 'Enter a start date and an end date.';
  if (values.startDate < today) return "The start date can't be in the past.";
  if (values.endDate < values.startDate) return 'The end date must be on or after the start date.';
  if (values.weekdays.length === 0) return 'Pick at least one day of the week.';
  const dayCount = getDatesInRange(values.startDate, values.endDate, values.weekdays).length;
  if (dayCount === 0) return 'No dates in that range fall on the selected days of the week.';
  if (dayCount > MAX_DAYS) {
    return `That range has ${dayCount} days; the most allowed is ${MAX_DAYS}. Shorten the range or deselect some days of the week.`;
  }
  if (timeToMinutes(values.endTime) <= timeToMinutes(values.startTime)) {
    return 'End time must be after start time.';
  }
  return null;
};
