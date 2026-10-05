export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export type Day = (typeof DAYS)[number];

export type CellState = 'available' | 'notPreferred';

/** Keyed by slot key such as "Mon-0900". Missing keys mean Not Available. */
export type Availability = Record<string, CellState>;

export interface MeetingDetails {
  title: string;
  description: string;
  location: string;
  durationMinutes: number;
}

export interface NewMeeting extends MeetingDetails {
  days: Day[];
  startTime: string;
  endTime: string;
  timeZone: string;
}

export interface Meeting extends NewMeeting {
  id: string;
  creatorId: string;
  participantIds: string[];
  createdAt: Date | null;
}

export interface Participant {
  id: string;
  name: string;
  availability: Availability;
}

/** What the create form collects: the creator's name plus the new meeting, minus time zone. */
export interface CreateMeetingValues extends MeetingDetails {
  name: string;
  days: Day[];
  startTime: string;
  endTime: string;
}
