import type { DateKey, Participant } from '../types/meeting';
import { SLOT_MINUTES, slotKey, slotToTime } from './time';

export interface Attendee {
  name: string;
  /** How many of the window's 15-minute slots this person can make. */
  slots: number;
  minutes: number;
  /** True when at least one of their slots is marked "not preferred". */
  hasNotPreferred: boolean;
}

export interface TimeCandidate {
  /** Stable id, e.g. "2026-10-06-0900". */
  key: string;
  date: DateKey;
  dayIndex: number;
  startSlotIndex: number;
  slotCount: number;
  /** "HH:MM" */
  startTime: string;
  /** Can make every slot of the window. */
  full: Attendee[];
  /** Can make at least one slot, but not all of them. */
  partial: Attendee[];
  /** Can't make any of it. */
  unavailable: string[];
  /** People who can make at least part of the meeting (full + partial). */
  attendeeCount: number;
  notPreferredSlots: number;
  coverageSlots: number;
}

const evaluateWindow = (
  participants: Participant[],
  keys: string[],
  base: Pick<TimeCandidate, 'key' | 'date' | 'dayIndex' | 'startSlotIndex' | 'slotCount' | 'startTime'>,
): TimeCandidate | null => {
  const full: Attendee[] = [];
  const partial: Attendee[] = [];
  const unavailable: string[] = [];
  let notPreferredSlots = 0;
  let coverageSlots = 0;

  for (const { name, availability } of participants) {
    let slots = 0;
    let notPreferred = 0;
    for (const key of keys) {
      const state = availability[key];
      if (state === 'available') slots++;
      else if (state === 'notPreferred') {
        slots++;
        notPreferred++;
      }
    }
    if (slots === 0) {
      unavailable.push(name);
      continue;
    }
    const attendee: Attendee = { name, slots, minutes: slots * SLOT_MINUTES, hasNotPreferred: notPreferred > 0 };
    (slots === keys.length ? full : partial).push(attendee);
    notPreferredSlots += notPreferred;
    coverageSlots += slots;
  }

  const attendeeCount = full.length + partial.length;
  if (attendeeCount === 0) return null;
  return { ...base, full, partial, unavailable, attendeeCount, notPreferredSlots, coverageSlots };
};

/**
 * Ranking, best first:
 * 1. most people who can make at least part of the meeting,
 * 2. most people who can make all of it,
 * 3. fewest "not preferred" slots,
 * 4. most total slots attended (so partial attendees get as much of it as possible),
 * 5. earliest.
 */
const compareCandidates = (a: TimeCandidate, b: TimeCandidate): number =>
  b.attendeeCount - a.attendeeCount ||
  b.full.length - a.full.length ||
  a.notPreferredSlots - b.notPreferredSlots ||
  b.coverageSlots - a.coverageSlots ||
  a.dayIndex - b.dayIndex ||
  a.startSlotIndex - b.startSlotIndex;

const overlaps = (a: TimeCandidate, b: TimeCandidate): boolean =>
  a.dayIndex === b.dayIndex &&
  a.startSlotIndex < b.startSlotIndex + b.slotCount &&
  b.startSlotIndex < a.startSlotIndex + a.slotCount;

/** The best `limit` non-overlapping windows of the meeting's length. */
export const findTopTimes = (
  days: DateKey[],
  slots: string[],
  participants: Participant[],
  durationMinutes: number,
  limit: number,
): TimeCandidate[] => {
  const slotCount = Math.max(1, Math.ceil(durationMinutes / SLOT_MINUTES));
  const candidates: TimeCandidate[] = [];

  days.forEach((date, dayIndex) => {
    for (let startSlotIndex = 0; startSlotIndex + slotCount <= slots.length; startSlotIndex++) {
      const windowSlots = slots.slice(startSlotIndex, startSlotIndex + slotCount);
      const candidate = evaluateWindow(
        participants,
        windowSlots.map((slot) => slotKey(date, slot)),
        {
          key: slotKey(date, windowSlots[0]),
          date,
          dayIndex,
          startSlotIndex,
          slotCount,
          startTime: slotToTime(windowSlots[0]),
        },
      );
      if (candidate) candidates.push(candidate);
    }
  });

  candidates.sort(compareCandidates);

  const picked: TimeCandidate[] = [];
  for (const candidate of candidates) {
    if (picked.length >= limit) break;
    if (!picked.some((chosen) => overlaps(candidate, chosen))) picked.push(candidate);
  }
  return picked;
};
