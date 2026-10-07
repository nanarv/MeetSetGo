import { Link } from 'react-router';
import { useMyMeetings } from '../hooks/useMyMeetings';
import { describeDays, formatDayLong } from '../utilities/dates';
import { formatTime } from '../utilities/time';
import { StatusMessage } from './StatusMessage';

interface MyMeetingsListProps {
  userId: string;
}

export const MyMeetingsList = ({ userId }: MyMeetingsListProps) => {
  const meetings = useMyMeetings(userId);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">Your meetings</h2>
      {meetings.status === 'loading' && <StatusMessage>Loading your meetings…</StatusMessage>}
      {meetings.status === 'error' && (
        <StatusMessage tone="error">Couldn't load your meetings: {meetings.error.message}</StatusMessage>
      )}
      {meetings.status === 'ready' && meetings.data.length === 0 && (
        <StatusMessage>No meetings yet. Meetings you create or join in this browser show up here.</StatusMessage>
      )}
      {meetings.status === 'ready' && meetings.data.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {meetings.data.map((meeting) => (
            <li key={meeting.id}>
              <Link
                to={`/m/${meeting.id}`}
                className="block rounded border border-gray-200 p-4 hover:border-gray-400"
              >
                <span className="block font-semibold">{meeting.title}</span>
                <span className="block text-sm text-gray-600">
                  {describeDays(meeting)} · {formatTime(meeting.startTime)}–{formatTime(meeting.endTime)}
                </span>
                {meeting.chosenTime && (
                  <span className="block text-sm font-medium text-emerald-700">
                    ✅ {formatDayLong(meeting.chosenTime.date)}, {formatTime(meeting.chosenTime.startTime)}
                  </span>
                )}
                <span className="block text-sm text-gray-600">
                  {meeting.participantIds.length} responded
                  {meeting.creatorId === userId && ' · you organize'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
