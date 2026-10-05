import { useState, type KeyboardEvent, type PointerEvent } from 'react';
import { useGridNavigation } from '../hooks/useGridNavigation';
import type { Availability, CellState, Day } from '../types/meeting';
import {
  applyPen,
  cellBorderClass,
  getRectangleKeys,
  resolveStrokePen,
  type CellPosition,
  type Pen,
} from '../utilities/grid';
import { formatSlot, slotKey } from '../utilities/time';
import { TimeGrid } from './TimeGrid';

interface AvailabilityGridProps {
  days: Day[];
  slots: string[];
  availability: Availability;
  pen: Pen;
  onCommit: (availability: Availability) => void;
}

interface Stroke {
  start: CellPosition;
  end: CellPosition;
  pen: Pen;
}

const STATE_CLASSES: Record<CellState | 'empty', string> = {
  available: 'bg-emerald-500',
  notPreferred: 'bg-amber-300',
  empty: 'bg-white hover:bg-gray-100',
};

const STATE_LABELS: Record<CellState | 'empty', string> = {
  available: 'Available',
  notPreferred: 'Not preferred',
  empty: 'Not available',
};

const positionOf = (element: Element | null): CellPosition | null => {
  const cell = element?.closest<HTMLElement>('[data-day-index]');
  if (!cell) return null;
  return { dayIndex: Number(cell.dataset.dayIndex), slotIndex: Number(cell.dataset.slotIndex) };
};

const samePosition = (a: CellPosition, b: CellPosition) =>
  a.dayIndex === b.dayIndex && a.slotIndex === b.slotIndex;

export const AvailabilityGrid = ({ days, slots, availability, pen, onCommit }: AvailabilityGridProps) => {
  const { gridRef, active, setActive, handleArrowKey, cellProps } = useGridNavigation(
    days.length,
    slots.length,
  );
  const [stroke, setStroke] = useState<Stroke | null>(null);

  const keyAt = (position: CellPosition) => slotKey(days[position.dayIndex], slots[position.slotIndex]);

  const shown = stroke
    ? applyPen(availability, getRectangleKeys(days, slots, stroke.start, stroke.end), stroke.pen)
    : availability;

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const start = positionOf(event.target as Element);
    if (!start) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setActive(start);
    setStroke({ start, end: start, pen: resolveStrokePen(pen, availability[keyAt(start)]) });
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!stroke) return;
    // Pointer capture keeps events on the grid, so find the cell under the pointer.
    const element = document.elementFromPoint(event.clientX, event.clientY);
    if (!element || !gridRef.current?.contains(element)) return;
    const end = positionOf(element);
    if (end && !samePosition(end, stroke.end)) setStroke({ ...stroke, end });
  };

  const handlePointerUp = () => {
    if (!stroke) return;
    onCommit(shown);
    setStroke(null);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (handleArrowKey(event)) return;
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    const key = keyAt(active);
    onCommit(applyPen(availability, [key], resolveStrokePen(pen, availability[key])));
  };

  return (
    <TimeGrid
      ref={gridRef}
      days={days}
      slots={slots}
      aria-label="Your availability"
      className="touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => setStroke(null)}
      onKeyDown={handleKeyDown}
      renderCell={(position, key, slot) => {
        const state = shown[key] ?? 'empty';
        return (
          <div
            key={key}
            role="gridcell"
            aria-label={`${days[position.dayIndex]} ${formatSlot(slot)}, ${STATE_LABELS[state]}`}
            onFocus={() => setActive(position)}
            className={`h-4 flex-1 cursor-pointer border-r border-r-gray-200 focus:relative focus:z-10 focus:outline-2 focus:outline-blue-600 ${cellBorderClass(slot)} ${STATE_CLASSES[state]}`}
            {...cellProps(position)}
          />
        );
      }}
    />
  );
};
