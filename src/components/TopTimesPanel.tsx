import { useMemo, useState } from 'react';
import type { ChosenTime, Meeting, Participant } from '../types/meeting';
import { formatDayLong } from '../utilities/dates';
import { findTopTimes, type Attendee, type TimeCandidate } from '../utilities/topTimes';
import { formatDuration, formatTime, minutesToTime, timeToMinutes } from '../utilities/time';

interface TopTimesPanelProps {
  meeting: Meeting;
  participants: Participant[];
  slots: string[];
  isCreator: boolean;
  /** Called as the pointer or focus moves over a time; null when it leaves. */
  onHighlight: (candidate: TimeCandidate | null) => void;
  onPick: (chosen: ChosenTime) => void;
}

const LIMIT_OPTIONS = [3, 5, 10];

const endTimeOf = (candidate: TimeCandidate, durationMinutes: number): string =>
  minutesToTime(timeToMinutes(candidate.startTime) + durationMinutes);

export const TopTimesPanel = ({ meeting, participants, slots, isCreator, onHighlight, onPick }: TopTimesPanelProps) => {
  const [limit, setLimit] = useState(3);

  const candidates = useMemo(
    () => findTopTimes(meeting.days, slots, participants, meeting.durationMinutes, limit),
    [meeting.days, meeting.durationMinutes, slots, participants, limit],
  );
  const total = participants.length;
  const chosenKey = meeting.chosenTime && `${meeting.chosenTime.date}-${meeting.chosenTime.startTime.replace(':', '')}`;

  return (
    <section className="flex flex-col gap-3" aria-labelledby="top-times-heading">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="top-times-heading" className="text-lg font-semibold">
          Best times for a {formatDuration(meeting.durationMinutes)} meeting
        </h2>
        <label className="flex items-center gap-2 text-sm">
          Show top
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="rounded border border-gray-300 px-2 py-1"
          >
            {LIMIT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="text-sm text-gray-600">
        Ranked by how many people can make at least part of the meeting, then by who can make all of it, then by
        preference.{isCreator ? ' Pick the one that works.' : ' The organizer picks the final time.'}
      </p>

      {candidates.length === 0 ? (
        <p className="text-sm text-gray-500">No one has marked any availability yet.</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {candidates.map((candidate, index) => {
            const isChosen = candidate.key === chosenKey;
            return (
              <li
                key={candidate.key}
                onMouseEnter={() => onHighlight(candidate)}
                onMouseLeave={() => onHighlight(null)}
                onFocus={() => onHighlight(candidate)}
                onBlur={() => onHighlight(null)}
                onClick={() => onHighlight(candidate)}
                className={`rounded border p-3 ${isChosen ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}
              >
                <details open={index === 0}>
                  <summary className="flex cursor-pointer flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-semibold">
                      #{index + 1} {formatDayLong(candidate.date)}, {formatTime(candidate.startTime)}–
                      {formatTime(endTimeOf(candidate, meeting.durationMinutes))}
                    </span>
                    <span className="text-sm text-gray-700">
                      {candidate.attendeeCount} of {total} can attend
                      {candidate.full.length !== candidate.attendeeCount && ` · ${candidate.full.length} for all of it`}
                    </span>
                    {isChosen && <span className="text-sm font-medium text-emerald-700">✅ Chosen</span>}
                  </summary>

                  <div className="mt-2 flex flex-col gap-1 text-sm">
                    <PeopleLine label="✅ Whole meeting" people={candidate.full} />
                    <PeopleLine label="🕒 Part of it" people={candidate.partial} showMinutes />
                    <p>
                      <span className="font-medium">❌ Can't make it:</span>{' '}
                      {candidate.unavailable.length > 0 ? candidate.unavailable.join(', ') : '—'}
                    </p>
                    {isCreator && (
                      <button
                        type="button"
                        disabled={isChosen}
                        onClick={() => onPick({ date: candidate.date, startTime: candidate.startTime })}
                        className="mt-2 self-start rounded bg-gray-900 px-4 py-1.5 font-medium text-white disabled:opacity-50"
                      >
                        {isChosen ? 'Chosen' : 'Pick this time'}
                      </button>
                    )}
                  </div>
                </details>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};

const PeopleLine = ({ label, people, showMinutes = false }: { label: string; people: Attendee[]; showMinutes?: boolean }) => (
  <p>
    <span className="font-medium">{label}:</span>{' '}
    {people.length > 0
      ? people
          .map(({ name, minutes, hasNotPreferred }) => {
            const detail = [showMinutes && `${minutes} min`, hasNotPreferred && 'not preferred'].filter(Boolean).join(', ');
            return detail ? `${name} (${detail})` : name;
          })
          .join(', ')
      : '—'}
  </p>
);
