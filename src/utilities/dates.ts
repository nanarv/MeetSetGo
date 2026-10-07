import { DAYS, type DateKey, type NewMeeting, type Weekday } from '../types/meeting';

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;
/** Hard stop for range expansion so a mistyped year can't loop for ages. */
const MAX_EXPANSION = 366;

/** Most selectable dates a meeting can have; wider grids stop being usable on screen. */
export const MAX_DAYS = 14;

export const isDateKey = (value: string): boolean => DATE_KEY.test(value);

const toUtcDate = (key: DateKey): Date => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const toKey = (date: Date): DateKey => date.toISOString().slice(0, 10);

export const addDays = (key: DateKey, count: number): DateKey => toKey(new Date(toUtcDate(key).getTime() + count * DAY_MS));

/** Today's date on this device, as a date key. */
export const todayKey = (): DateKey => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

export const weekdayOf = (key: DateKey): Weekday => DAYS[(toUtcDate(key).getUTCDay() + 6) % 7];

/** Every date from start to end (inclusive) that falls on one of the weekdays. */
export const getDatesInRange = (start: DateKey, end: DateKey, weekdays: readonly Weekday[]): DateKey[] => {
  if (!isDateKey(start) || !isDateKey(end) || end < start) return [];
  const dates: DateKey[] = [];
  for (let key = start, i = 0; key <= end && i < MAX_EXPANSION; key = addDays(key, 1), i++) {
    if (weekdays.includes(weekdayOf(key))) dates.push(key);
  }
  return dates;
};

/** False for meetings created before date ranges existed (their days are weekday names). */
export const isDatedMeeting = (days: readonly string[]): boolean => days.length > 0 && days.every(isDateKey);

const format = (options: Intl.DateTimeFormatOptions, key: DateKey): string =>
  new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(toUtcDate(key));

/** "Tue, Oct 6" — falls back to the raw value for legacy weekday names. */
export const formatDayLong = (key: DateKey): string =>
  isDateKey(key) ? format({ weekday: 'short', month: 'short', day: 'numeric' }, key) : key;

/** Two-line grid column header: "Tue" over "10/6". */
export const dayHeaderParts = (key: DateKey): { weekday: string; date: string } => {
  if (!isDateKey(key)) return { weekday: key, date: '' };
  const [, month, day] = key.split('-').map(Number);
  return { weekday: format({ weekday: 'short' }, key), date: `${month}/${day}` };
};

/** "Oct 6 – Oct 14, 2026 (Mon, Tue, Wed, Thu, Fri)". Legacy meetings list their weekday names. */
export const describeDays = ({ days, startDate, endDate, weekdays }: Pick<NewMeeting, 'days' | 'startDate' | 'endDate' | 'weekdays'>): string => {
  if (!isDatedMeeting(days) || !isDateKey(startDate) || !isDateKey(endDate)) return days.join(', ');
  const monthDay = (key: DateKey) => format({ month: 'short', day: 'numeric' }, key);
  const year = format({ year: 'numeric' }, endDate);
  const range =
    startDate === endDate ? `${monthDay(endDate)}, ${year}` : `${monthDay(startDate)} – ${monthDay(endDate)}, ${year}`;
  return weekdays.length > 0 && weekdays.length < DAYS.length ? `${range} (${weekdays.join(', ')})` : range;
};
