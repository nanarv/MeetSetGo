import { useState, type FormEvent } from 'react';
import type { MeetingDetails } from '../types/meeting';
import { errorMessage } from '../utilities/errors';
import { MeetingDetailsFields } from './MeetingDetailsFields';

interface EditMeetingFormProps {
  initial: MeetingDetails;
  onSave: (details: MeetingDetails) => Promise<void>;
  onCancel: () => void;
}

export const EditMeetingForm = ({ initial, onSave, onCancel }: EditMeetingFormProps) => {
  const [details, setDetails] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!details.title.trim()) {
      setError('Enter a meeting title.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSave({
        ...details,
        title: details.title.trim(),
        location: details.location.trim(),
        description: details.description.trim(),
      });
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 rounded border border-gray-200 p-4">
      <p className="text-sm text-gray-600">Days and times can't be changed after a meeting is created.</p>
      <MeetingDetailsFields value={details} onChange={setDetails} />
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-gray-900 px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} className="rounded border border-gray-300 px-4 py-2">
          Cancel
        </button>
      </div>
    </form>
  );
};
