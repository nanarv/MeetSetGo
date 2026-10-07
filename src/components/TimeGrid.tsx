import type { ComponentProps, ReactNode } from 'react';
import type { DateKey } from '../types/meeting';
import { dayHeaderParts } from '../utilities/dates';
import type { CellPosition } from '../utilities/grid';
import { formatSlot, slotKey } from '../utilities/time';

interface TimeGridProps extends ComponentProps<'div'> {
  days: DateKey[];
  slots: string[];
  renderCell: (position: CellPosition, key: string, slot: string) => ReactNode;
}

/** Days as columns, 15-minute slots as rows. Callers render the gridcells. */
export const TimeGrid = ({ days, slots, renderCell, className = '', ...rest }: TimeGridProps) => (
  <div role="grid" className={`select-none ${className}`} {...rest}>
    <div role="row" className="flex">
      <div role="columnheader" className="w-16 shrink-0">
        <span className="sr-only">Time</span>
      </div>
      {days.map((day) => {
        const { weekday, date } = dayHeaderParts(day);
        return (
          <div key={day} role="columnheader" className="flex-1 pb-1 text-center text-xs font-semibold sm:text-sm">
            <span className="block">{weekday}</span>
            {date && <span className="block text-[11px] font-normal text-gray-500">{date}</span>}
          </div>
        );
      })}
    </div>
    {slots.map((slot, slotIndex) => (
      <div key={slot} role="row" className="flex">
        <div role="rowheader" className="w-16 shrink-0 pr-2 text-right text-[11px] leading-3 text-gray-500">
          {slot.endsWith('00') ? formatSlot(slot) : <span className="sr-only">{formatSlot(slot)}</span>}
        </div>
        {days.map((day, dayIndex) => renderCell({ dayIndex, slotIndex }, slotKey(day, slot), slot))}
      </div>
    ))}
  </div>
);
