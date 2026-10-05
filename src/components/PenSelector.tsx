import type { Pen } from '../utilities/grid';

interface PenSelectorProps {
  pen: Pen;
  onChange: (pen: Pen) => void;
}

const PENS: { value: Pen; label: string; swatch: string }[] = [
  { value: 'available', label: 'Available', swatch: 'bg-emerald-500' },
  { value: 'notPreferred', label: 'Not preferred', swatch: 'bg-amber-300' },
  { value: 'erase', label: 'Erase', swatch: 'bg-white' },
];

export const PenSelector = ({ pen, onChange }: PenSelectorProps) => (
  <fieldset className="flex flex-wrap items-center gap-2">
    <legend className="sr-only">Pen</legend>
    {PENS.map(({ value, label, swatch }) => (
      <label
        key={value}
        className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-300 px-3 py-1 text-sm has-checked:border-gray-900 has-checked:bg-gray-900 has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-blue-600"
      >
        <input
          type="radio"
          name="pen"
          value={value}
          checked={pen === value}
          onChange={() => onChange(value)}
          className="sr-only"
        />
        <span aria-hidden="true" className={`inline-block h-3 w-3 rounded-sm border border-gray-400 ${swatch}`} />
        {label}
      </label>
    ))}
  </fieldset>
);
