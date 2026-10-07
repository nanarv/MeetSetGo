export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export type Weekday = (typeof DAYS)[number];

/**
 * A calendar date as "YYYY-MM-DD". Meetings created before date ranges existed
 * hold weekday names ("Mon") here instead; see `isDatedMeeting`.
 */
export type DateKey = string;

/** Kept so components that still import `Day` compile; it is now a date key. */
export type Day = DateKey;

export type CellState = 'available' | 'notPreferred';

/** Keyed by slot key such as "2026-10-06-0900". Missing keys mean Not Available. */
export type Availability = Record<string, CellState>;

export interface MeetingDetails {
  title: string;
  description: string;
  location: string;
  durationMinutes: number;
}

export interface NewMeeting extends MeetingDetails {
  /** Every selectable date (the range already filtered by `weekdays`). */
  days: DateKey[];
  startDate: DateKey;
  endDate: DateKey;
  /** The weekday filter used when building `days`. */
  weekdays: Weekday[];
  startTime: string;
  endTime: string;
  timeZone: string;
}

/** The time the organizer picked. The end is `startTime` + the meeting's duration. */
export interface ChosenTime {
  date: DateKey;
  /** "HH:MM", 24-hour, in the meeting's time zone. */
  startTime: string;
}

export interface Meeting extends NewMeeting {
  id: string;
  creatorId: string;
  participantIds: string[];
  chosenTime: ChosenTime | null;
  createdAt: Date | null;
}

export interface Participant {
  id: string;
  name: string;
  availability: Availability;
}

/** What the create form collects: the creator's name plus the new meeting, minus time zone and `days`. */
export interface CreateMeetingValues extends MeetingDetails {
  name: string;
  startDate: DateKey;
  endDate: DateKey;
  weekdays: Weekday[];
  startTime: string;
  endTime: string;
}