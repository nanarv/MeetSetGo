import { useState, type FormEvent } from 'react';
import { DAYS, type CreateMeetingValues, type MeetingDetails, type Weekday } from '../types/meeting';
import { addDays, MAX_DAYS, todayKey } from '../utilities/dates';
import { errorMessage } from '../utilities/errors';
import { formatTime, TIME_OPTIONS } from '../utilities/time';
import { validateMeeting } from '../utilities/validation';
import { MeetingDetailsFields } from './MeetingDetailsFields';

interface CreateMeetingFormProps {
  onSubmit: (values: CreateMeetingValues) => Promise<void>;
}

const INITIAL_DETAILS: MeetingDetails = { title: '', description: '', location: '', durationMinutes: 60 };

export const CreateMeetingForm = ({ onSubmit }: CreateMeetingFormProps) => {
  const [name, setName] = useState('');
  const [details, setDetails] = useState(INITIAL_DETAILS);
  const [today] = useState(todayKey);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(() => addDays(today, MAX_DAYS - 1));
  const [weekdays, setWeekdays] = useState<Weekday[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toggleWeekday = (day: Weekday) => {
    setWeekdays(DAYS.filter((d) => (d === day ? !weekdays.includes(d) : weekdays.includes(d))));
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    // Keep the range valid when the start moves past the end.
    if (value && endDate && value > endDate) setEndDate(value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values: CreateMeetingValues = {
      ...details,
      title: details.title.trim(),
      location: details.location.trim(),
      description: details.description.trim(),
      name: name.trim(),
      startDate,
      endDate,
      weekdays,
      startTime,
      endTime,
    };
    const problem = validateMeeting(values);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="creator-name" className="text-sm font-medium">
          Your name
        </label>
        <input
          id="creator-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>

      <MeetingDetailsFields value={details} onChange={setDetails} />

      <div className="grid gap-4 sm:grid-cols-2">
        <DateField id="start-date" label="Start date" value={startDate} min={today} onChange={handleStartDateChange} />
        <DateField id="end-date" label="End date" value={endDate} min={startDate || today} onChange={setEndDate} />
      </div>

      <fieldset className="flex flex-col gap-1">
        <legend className="mb-1 text-sm font-medium">
          Include these days of the week <span className="font-normal text-gray-500">(at most {MAX_DAYS} dates)</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <label
              key={day}
              className="cursor-pointer rounded border border-gray-300 px-3 py-1 text-sm has-checked:border-emerald-600 has-checked:bg-emerald-600 has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-blue-600"
            >
              <input
                type="checkbox"
                checked={weekdays.includes(day)}
                onChange={() => toggleWeekday(day)}
                className="sr-only"
              />
              {day}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <TimeSelect id="start-time" label="No earlier than" value={startTime} onChange={setStartTime} />
        <TimeSelect id="end-time" label="No later than" value={endTime} onChange={setEndTime} />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded bg-gray-900 px-5 py-2 font-medium text-white disabled:opacity-50"
      >
        {submitting ? 'Creating…' : 'Create meeting'}
      </button>
    </form>
  );
};

interface DateFieldProps {
  id: string;
  label: string;
  value: string;
  min: string;
  onChange: (value: string) => void;
}

/** Type a date (e.g. 10/06/2026) or click the box to pick one from a calendar. */
const DateField = ({ id, label, value, min, onChange }: DateFieldProps) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="text-sm font-medium">
      {label}
    </label>
    <input
      id={id}
      type="date"
      value={value}
      min={min}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => {
        try {
          e.currentTarget.showPicker();
        } catch {
          // Not supported, or the browser declined; typing still works.
        }
      }}
      className="w-full rounded border border-gray-300 px-3 py-2"
    />
  </div>
);

interface TimeSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const TimeSelect = ({ id, label, value, onChange }: TimeSelectProps) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="text-sm font-medium">
      {label}
    </label>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded border border-gray-300 px-3 py-2"
    >
      {TIME_OPTIONS.map((time) => (
        <option key={time} value={time}>
          {time === '24:00' ? '12:00 AM (midnight)' : formatTime(time)}
        </option>
      ))}
    </select>
  </div>
);
