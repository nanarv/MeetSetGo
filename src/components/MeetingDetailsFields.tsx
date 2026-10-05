import type { MeetingDetails } from '../types/meeting';
import { DURATION_OPTIONS, formatDuration } from '../utilities/time';

interface MeetingDetailsFieldsProps {
  value: MeetingDetails;
  onChange: (value: MeetingDetails) => void;
}

const INPUT_CLASS = 'w-full rounded border border-gray-300 px-3 py-2';

/** Title, duration, location and description — shared by create and edit forms. */
export const MeetingDetailsFields = ({ value, onChange }: MeetingDetailsFieldsProps) => (
  <>
    <div className="flex flex-col gap-1">
      <label htmlFor="meeting-title" className="text-sm font-medium">
        Meeting title
      </label>
      <input
        id="meeting-title"
        value={value.title}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
        className={INPUT_CLASS}
      />
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1">
        <label htmlFor="meeting-duration" className="text-sm font-medium">
          Meeting length
        </label>
        <select
          id="meeting-duration"
          value={value.durationMinutes}
          onChange={(e) => onChange({ ...value, durationMinutes: Number(e.target.value) })}
          className={INPUT_CLASS}
        >
          {DURATION_OPTIONS.map((minutes) => (
            <option key={minutes} value={minutes}>
              {formatDuration(minutes)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="meeting-location" className="text-sm font-medium">
          Location <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <input
          id="meeting-location"
          value={value.location}
          onChange={(e) => onChange({ ...value, location: e.target.value })}
          className={INPUT_CLASS}
        />
      </div>
    </div>
    <div className="flex flex-col gap-1">
      <label htmlFor="meeting-description" className="text-sm font-medium">
        Description <span className="font-normal text-gray-500">(optional)</span>
      </label>
      <textarea
        id="meeting-description"
        value={value.description}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
        rows={3}
        className={INPUT_CLASS}
      />
    </div>
  </>
);
