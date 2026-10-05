import { useRef, useState, type KeyboardEvent } from 'react';
import type { CellPosition } from '../utilities/grid';

const MOVES: Record<string, CellPosition> = {
  ArrowUp: { dayIndex: 0, slotIndex: -1 },
  ArrowDown: { dayIndex: 0, slotIndex: 1 },
  ArrowLeft: { dayIndex: -1, slotIndex: 0 },
  ArrowRight: { dayIndex: 1, slotIndex: 0 },
};

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);

/** Roving tabindex for a days × slots grid: one tab stop, arrow keys move focus. */
export const useGridNavigation = (dayCount: number, slotCount: number) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<CellPosition>({ dayIndex: 0, slotIndex: 0 });

  const focusCell = (position: CellPosition) => {
    setActive(position);
    gridRef.current
      ?.querySelector<HTMLElement>(
        `[data-day-index="${position.dayIndex}"][data-slot-index="${position.slotIndex}"]`,
      )
      ?.focus();
  };

  /** Returns true when the key was an arrow key and focus moved. */
  const handleArrowKey = (event: KeyboardEvent): boolean => {
    const move = MOVES[event.key];
    if (!move) return false;
    event.preventDefault();
    focusCell({
      dayIndex: clamp(active.dayIndex + move.dayIndex, dayCount - 1),
      slotIndex: clamp(active.slotIndex + move.slotIndex, slotCount - 1),
    });
    return true;
  };

  const cellProps = (position: CellPosition) => ({
    tabIndex: position.dayIndex === active.dayIndex && position.slotIndex === active.slotIndex ? 0 : -1,
    'data-day-index': position.dayIndex,
    'data-slot-index': position.slotIndex,
  });

  return { gridRef, active, setActive, handleArrowKey, cellProps };
};
