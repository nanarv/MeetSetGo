import type { ChosenTime, Meeting } from '../types/meeting';
import { timeToMinutes } from './time';

const pad = (value: number, length = 2) => String(value).padStart(length, '0');

/** Milliseconds the zone is ahead of UTC at the given instant. */
const zoneOffsetMs = (utcMs: number, timeZone: string): number => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(utcMs));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second')) - utcMs;
};

/** The UTC instant at which the wall clock in `timeZone` reads `date` + `minutes` after midnight. */
export const zonedToUtcMs = (date: string, minutes: number, timeZone: string): number => {
  const [year, month, day] = date.split('-').map(Number);
  const wallAsUtc = Date.UTC(year, month - 1, day, 0, minutes);
  // Second pass settles the offset when the result lands on the other side of a DST change.
  const first = wallAsUtc - zoneOffsetMs(wallAsUtc, timeZone);
  return wallAsUtc - zoneOffsetMs(first, timeZone);
};

const formatUtc = (ms: number): string => {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
};

const escapeText = (text: string): string =>
  text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Folds a content line to 75 octets, continuing with a leading space (RFC 5545 §3.1). */
const fold = (line: string): string => {
  const encoder = new TextEncoder();
  const lines: string[] = [];
  let current = '';
  let bytes = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    if (bytes + size > 75) {
      lines.push(current);
      current = ' ';
      bytes = 1;
    }
    current += char;
    bytes += size;
  }
  lines.push(current);
  return lines.join('\r\n');
};

export interface IcsOptions {
  /** Link back to the meeting page. */
  url: string;
  /** Domain for the event UID, e.g. window.location.hostname. */
  uidDomain: string;
  now?: Date;
}

/** An iCalendar file with one event, in UTC so every calendar app agrees on the time. */
export const buildIcs = (meeting: Meeting, chosen: ChosenTime, { url, uidDomain, now = new Date() }: IcsOptions): string => {
  const startMinutes = timeToMinutes(chosen.startTime);
  const start = zonedToUtcMs(chosen.date, startMinutes, meeting.timeZone);
  const end = zonedToUtcMs(chosen.date, startMinutes + meeting.durationMinutes, meeting.timeZone);
  const description = [meeting.description, `Meeting page: ${url}`].filter(Boolean).join('\n\n');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Meeting Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${meeting.id}@${uidDomain}`,
    `DTSTAMP:${formatUtc(now.getTime())}`,
    `DTSTART:${formatUtc(start)}`,
    `DTEND:${formatUtc(end)}`,
    `SUMMARY:${escapeText(meeting.title)}`,
    ...(meeting.location ? [`LOCATION:${escapeText(meeting.location)}`] : []),
    `DESCRIPTION:${escapeText(description)}`,
    `URL:${url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return `${lines.map(fold).join('\r\n')}\r\n`;
};

export const icsFileName = (title: string): string => {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug || 'meeting'}.ics`;
};
