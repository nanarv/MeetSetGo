import { useState } from 'react';
import { useNavigate } from 'react-router';
import { deleteMeeting, updateMeetingDetails } from '../services/meetingService';
import type { Meeting, MeetingDetails } from '../types/meeting';
import { describeDays } from '../utilities/dates';
import { errorMessage } from '../utilities/errors';
import { formatDuration, formatTime, timeZoneName } from '../utilities/time';
import { CopyLinkButton } from './CopyLinkButton';
import { EditMeetingForm } from './EditMeetingForm';

interface MeetingHeaderProps {
  meeting: Meeting;
  isCreator: boolean;
}

export const MeetingHeader = ({ meeting, isCreator }: MeetingHeaderProps) => {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const shareUrl = `${window.location.origin}/m/${meeting.id}`;

  const handleSave = async (details: MeetingDetails) => {
    await updateMeetingDetails(meeting.id, details);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${meeting.title}" and everyone's availability? This can't be undone.`)) return;
    try {
      await deleteMeeting(meeting.id);
      await navigate('/');
    } catch (error) {
      setDeleteError(errorMessage(error));
    }
  };

  if (editing) {
    return <EditMeetingForm initial={meeting} onSave={handleSave} onCancel={() => setEditing(false)} />;
  }

  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h1 className="text-2xl font-bold">{meeting.title}</h1>
        {isCreator && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded border border-gray-300 px-3 py-1 text-sm"
            >
              Edit details
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded border border-red-300 px-3 py-1 text-sm text-red-700"
            >
              Delete
            </button>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600">
        {formatDuration(meeting.durationMinutes)} · {describeDays(meeting)} ·{' '}
        {formatTime(meeting.startTime)}–{formatTime(meeting.endTime)} ({timeZoneName(meeting.timeZone)})
        {meeting.location && <> · 📍 {meeting.location}</>}
      </p>
      {meeting.description && <p className="max-w-prose whitespace-pre-line">{meeting.description}</p>}
      <CopyLinkButton url={shareUrl} />
      {deleteError && (
        <p role="alert" className="text-sm text-red-700">
          Couldn't delete: {deleteError}
        </p>
      )}
    </section>
  );
};
