import { describe, expect, it } from 'vitest';
import { formatDuration, formatSlot, formatSlotRange, getTimeSlots, TIME_OPTIONS } from './time';

describe('getTimeSlots', () => {
  it('returns 15-minute slots from start up to but not including end', () => {
    expect(getTimeSlots('09:00', '10:00')).toEqual(['0900', '0915', '0930', '0945']);
  });

  it('supports ending at midnight', () => {
    expect(getTimeSlots('23:30', '24:00')).toEqual(['2330', '2345']);
  });

  it('returns nothing when end is not after start', () => {
    expect(getTimeSlots('10:00', '10:00')).toEqual([]);
  });
});

describe('formatSlot', () => {
  it.each([
    ['0000', '12:00 AM'],
    ['0930', '9:30 AM'],
    ['1200', '12:00 PM'],
    ['1745', '5:45 PM'],
  ])('formats %s as %s', (slot, label) => {
    expect(formatSlot(slot)).toBe(label);
  });
});

describe('formatSlotRange', () => {
  it('shows the 15-minute span', () => {
    expect(formatSlotRange('1145')).toBe('11:45 AM – 12:00 PM');
  });
});

describe('formatDuration', () => {
  it.each([
    [15, '15 min'],
    [60, '1 hr'],
    [90, '1 hr 30 min'],
  ])('formats %i minutes as %s', (minutes, label) => {
    expect(formatDuration(minutes)).toBe(label);
  });
});

describe('TIME_OPTIONS', () => {
  it('covers the whole day in quarter hours', () => {
    expect(TIME_OPTIONS[0]).toBe('00:00');
    expect(TIME_OPTIONS.at(-1)).toBe('24:00');
    expect(TIME_OPTIONS).toHaveLength(97);
  });
});
