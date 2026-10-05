import { describe, expect, it } from 'vitest';
import { applyPen, getRectangleKeys, resolveStrokePen } from './grid';

const days = ['Mon', 'Tue', 'Wed'] as const;
const slots = ['0900', '0915', '0930'];

describe('getRectangleKeys', () => {
  it('fills the rectangle between two corners', () => {
    expect(
      getRectangleKeys([...days], slots, { dayIndex: 0, slotIndex: 0 }, { dayIndex: 1, slotIndex: 1 }),
    ).toEqual(['Mon-0900', 'Mon-0915', 'Tue-0900', 'Tue-0915']);
  });

  it('works when dragging up and to the left', () => {
    expect(
      getRectangleKeys([...days], slots, { dayIndex: 2, slotIndex: 2 }, { dayIndex: 1, slotIndex: 1 }),
    ).toEqual(['Tue-0915', 'Tue-0930', 'Wed-0915', 'Wed-0930']);
  });
});

describe('applyPen', () => {
  it('paints cells without mutating the original', () => {
    const original = { 'Mon-0900': 'notPreferred' as const };
    const next = applyPen(original, ['Mon-0900', 'Mon-0915'], 'available');
    expect(next).toEqual({ 'Mon-0900': 'available', 'Mon-0915': 'available' });
    expect(original).toEqual({ 'Mon-0900': 'notPreferred' });
  });

  it('erases by removing keys', () => {
    expect(applyPen({ 'Mon-0900': 'available' }, ['Mon-0900'], 'erase')).toEqual({});
  });
});

describe('resolveStrokePen', () => {
  it('erases when the stroke starts on a cell with the same color', () => {
    expect(resolveStrokePen('available', 'available')).toBe('erase');
  });

  it('paints over a different color', () => {
    expect(resolveStrokePen('available', 'notPreferred')).toBe('available');
    expect(resolveStrokePen('notPreferred', undefined)).toBe('notPreferred');
  });
});
