import type { Availability, CellState, Day } from '../types/meeting';
import { slotKey } from './time';

export type Pen = CellState | 'erase';

export interface CellPosition {
  dayIndex: number;
  slotIndex: number;
}

/** Keys of every cell in the rectangle spanned by two corners. */
export const getRectangleKeys = (
  days: Day[],
  slots: string[],
  from: CellPosition,
  to: CellPosition,
): string[] => {
  const keys: string[] = [];
  const [firstDay, lastDay] = [from.dayIndex, to.dayIndex].sort((a, b) => a - b);
  const [firstSlot, lastSlot] = [from.slotIndex, to.slotIndex].sort((a, b) => a - b);
  for (let d = firstDay; d <= lastDay; d++) {
    for (let s = firstSlot; s <= lastSlot; s++) {
      keys.push(slotKey(days[d], slots[s]));
    }
  }
  return keys;
};

export const applyPen = (availability: Availability, keys: string[], pen: Pen): Availability => {
  const next = { ...availability };
  for (const key of keys) {
    if (pen === 'erase') {
      delete next[key];
    } else {
      next[key] = pen;
    }
  }
  return next;
};

/** Starting a stroke on a cell already painted with the current pen erases instead. */
export const resolveStrokePen = (pen: Pen, startState: CellState | undefined): Pen =>
  pen !== 'erase' && startState === pen ? 'erase' : pen;

/** Solid line on the hour, faint line on quarter hours. */
export const cellBorderClass = (slot: string): string =>
  slot.endsWith('00') ? 'border-t border-gray-400' : 'border-t border-gray-100';
