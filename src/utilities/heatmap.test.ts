import { describe, expect, it } from 'vitest';
import type { Participant } from '../types/meeting';
import { attendeeCount, heatLevel, isEveryoneAvailable, summarizeCell } from './heatmap';

const participants: Participant[] = [
  { id: 'a', name: 'Alex', availability: { 'Mon-0900': 'available', 'Mon-0915': 'available' } },
  { id: 's', name: 'Sam', availability: { 'Mon-0900': 'notPreferred', 'Mon-0915': 'available' } },
  { id: 'p', name: 'Priya', availability: { 'Mon-0915': 'available' } },
];

describe('summarizeCell', () => {
  it('groups names by state, treating missing cells as unavailable', () => {
    expect(summarizeCell(participants, 'Mon-0900')).toEqual({
      available: ['Alex'],
      notPreferred: ['Sam'],
      unavailable: ['Priya'],
    });
  });

  it('counts both available and not preferred as attending', () => {
    expect(attendeeCount(summarizeCell(participants, 'Mon-0900'))).toBe(2);
  });
});

describe('isEveryoneAvailable', () => {
  it('is true only when every respondent is Available', () => {
    expect(isEveryoneAvailable(summarizeCell(participants, 'Mon-0915'))).toBe(true);
    expect(isEveryoneAvailable(summarizeCell(participants, 'Mon-0900'))).toBe(false);
  });

  it('is false with no respondents', () => {
    expect(isEveryoneAvailable(summarizeCell([], 'Mon-0900'))).toBe(false);
  });
});

describe('heatLevel', () => {
  it('scales from 0 (nobody) to 5 (everyone)', () => {
    expect(heatLevel(0, 4)).toBe(0);
    expect(heatLevel(1, 4)).toBe(2);
    expect(heatLevel(4, 4)).toBe(5);
    expect(heatLevel(0, 0)).toBe(0);
  });
});
