import { useState, type FormEvent } from 'react';
import { DAYS, type CreateMeetingValues, type Day, type MeetingDetails } from '../types/meeting';
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
  const [days, setDays] = useState<Day[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toggleDay = (day: Day) => {
    setDays(DAYS.filter((d) => (d === day ? !days.includes(d) : days.includes(d))));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values: CreateMeetingValues = {
      ...details,
      title: details.title.trim(),
      location: details.location.trim(),
      description: details.description.trim(),
      name: name.trim(),
      days,
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

      <fieldset className="flex flex-col gap-1">
        <legend className="mb-1 text-sm font-medium">Days of the week</legend>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((day) => (
            <label
              key={day}
              className="cursor-pointer rounded border border-gray-300 px-3 py-1 text-sm has-checked:border-emerald-600 has-checked:bg-emerald-600 has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-blue-600"
            >
              <input
                type="checkbox"
                checked={days.includes(day)}
                onChange={() => toggleDay(day)}
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
