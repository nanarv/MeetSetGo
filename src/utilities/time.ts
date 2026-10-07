import type { DateKey } from '../types/meeting';

export const SLOT_MINUTES = 15;

/** Every quarter hour from 00:00 to 24:00, for start/end time pickers. */
export const TIME_OPTIONS = Array.from({ length: (24 * 60) / SLOT_MINUTES + 1 }, (_, i) =>
  minutesToTime(i * SLOT_MINUTES),
);

export const DURATION_OPTIONS = Array.from({ length: 12 }, (_, i) => (i + 1) * SLOT_MINUTES);

export function minutesToTime(minutes: number): string {
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
  const mins = String(minutes % 60).padStart(2, '0');
  return `${hours}:${mins}`;
}

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/** 15-minute slot ids ("0900", "0915", …) from start up to, not including, end. */
export const getTimeSlots = (startTime: string, endTime: string): string[] => {
  const slots: string[] = [];
  for (let m = timeToMinutes(startTime); m < timeToMinutes(endTime); m += SLOT_MINUTES) {
    slots.push(minutesToTime(m).replace(':', ''));
  }
  return slots;
};

export const slotKey = (day: DateKey, slot: string): string => `${day}-${slot}`;

/** "0930" → "09:30" */
export const slotToTime = (slot: string): string => `${slot.slice(0, 2)}:${slot.slice(2)}`;

/** "0930" → "9:30 AM" */
export const formatSlot = (slot: string): string => {
  const hours = Number(slot.slice(0, 2));
  const period = hours < 12 || hours === 24 ? 'AM' : 'PM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${slot.slice(2)} ${period}`;
};

/** "09:30" → "9:30 AM" */
export const formatTime = (time: string): string => formatSlot(time.replace(':', ''));

export const formatSlotRange = (slot: string): string => {
  const start = timeToMinutes(`${slot.slice(0, 2)}:${slot.slice(2)}`);
  return `${formatSlot(slot)} – ${formatTime(minutesToTime(start + SLOT_MINUTES))}`;
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  return mins === 0 ? `${hours} hr` : `${hours} hr ${mins} min`;
};

export const detectTimeZone = (): string => Intl.DateTimeFormat().resolvedOptions().timeZone;

/** "America/Chicago" → "Central Daylight Time" (falls back to the IANA id). */
export const timeZoneName = (timeZone: string): string => {
  try {
    const part = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'long' })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName');
    return part?.value ?? timeZone;
  } catch {
    return timeZone;
  }
};
