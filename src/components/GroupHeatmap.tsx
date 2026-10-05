import { useState, type KeyboardEvent } from 'react';
import { useGridNavigation } from '../hooks/useGridNavigation';
import type { Day, Participant } from '../types/meeting';
import { cellBorderClass, type CellPosition } from '../utilities/grid';
import { attendeeCount, heatLevel, isEveryoneAvailable, summarizeCell } from '../utilities/heatmap';
import { formatSlot, formatSlotRange, slotKey } from '../utilities/time';
import { TimeGrid } from './TimeGrid';

interface GroupHeatmapProps {
  days: Day[];
  slots: string[];
  participants: Participant[];
}

// Index = heatLevel (0 = nobody, 5 = everyone can make it).
const HEAT_CLASSES = [
  'bg-white',
  'bg-emerald-100',
  'bg-emerald-200',
  'bg-emerald-300',
  'bg-emerald-400',
  'bg-emerald-600',
];

const EVERYONE_CLASS = 'relative z-[1] outline-2 -outline-offset-2 outline-amber-400';

export const GroupHeatmap = ({ days, slots, participants }: GroupHeatmapProps) => {
  const { gridRef, setActive, handleArrowKey, cellProps } = useGridNavigation(days.length, slots.length);
  const [inspected, setInspected] = useState<CellPosition | null>(null);
  const total = participants.length;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    handleArrowKey(event);
  };

  const inspectedKey = inspected && slotKey(days[inspected.dayIndex], slots[inspected.slotIndex]);
  const summary = inspectedKey ? summarizeCell(participants, inspectedKey) : null;

  return (
    <div className="flex flex-col gap-3">
      <TimeGrid
        ref={gridRef}
        days={days}
        slots={slots}
        aria-label="Group availability"
        onKeyDown={handleKeyDown}
        onPointerLeave={() => setInspected(null)}
        renderCell={(position, key, slot) => {
          const cell = summarizeCell(participants, key);
          const count = attendeeCount(cell);
          const everyone = isEveryoneAvailable(cell);
          return (
            <div
              key={key}
              role="gridcell"
              aria-label={`${days[position.dayIndex]} ${formatSlot(slot)}: ${count} of ${total} can attend${everyone ? ', everyone available' : ''}`}
              onPointerEnter={() => setInspected(position)}
              onFocus={() => {
                setActive(position);
                setInspected(position);
              }}
              className={`h-4 flex-1 border-r border-r-gray-200 focus:relative focus:z-10 focus:outline-2 focus:outline-blue-600 ${cellBorderClass(slot)} ${HEAT_CLASSES[heatLevel(count, total)]} ${everyone ? EVERYONE_CLASS : ''}`}
              {...cellProps(position)}
            />
          );
        }}
      />

      <HeatmapLegend total={total} />

      <section aria-live="polite" className="min-h-28 rounded border border-gray-200 p-3 text-sm">
        {inspected && summary ? (
          <>
            <h3 className="font-semibold">
              {days[inspected.dayIndex]} {formatSlotRange(slots[inspected.slotIndex])}
            </h3>
            <p className="mb-1 text-gray-600">
              {attendeeCount(summary)} of {total} can attend
            </p>
            <NameLine label="✅ Available" names={summary.available} />
            <NameLine label="🟨 Not preferred" names={summary.notPreferred} />
            <NameLine label="❌ Can't make it" names={summary.unavailable} />
          </>
        ) : (
          <p className="text-gray-500">Hover over or focus a time to see who can make it.</p>
        )}
      </section>
    </div>
  );
};

const NameLine = ({ label, names }: { label: string; names: string[] }) => (
  <p>
    <span className="font-medium">{label}:</span> {names.length > 0 ? names.join(', ') : '—'}
  </p>
);

const HeatmapLegend = ({ total }: { total: number }) => (
  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
    <span className="flex items-center gap-1">
      0/{total}
      {HEAT_CLASSES.map((cls) => (
        <span key={cls} aria-hidden="true" className={`inline-block h-3 w-4 border border-gray-200 ${cls}`} />
      ))}
      {total}/{total} can attend
    </span>
    <span className="flex items-center gap-1">
      <span aria-hidden="true" className="inline-block h-3 w-4 bg-white outline-2 -outline-offset-2 outline-amber-400" />
      Everyone available
    </span>
  </div>
);
