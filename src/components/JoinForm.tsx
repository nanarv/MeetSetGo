import { useState, type FormEvent } from 'react';
import { errorMessage } from '../utilities/errors';

interface JoinFormProps {
  onJoin: (name: string) => Promise<void>;
}

export const JoinForm = ({ onJoin }: JoinFormProps) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Enter your name to add your availability.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onJoin(trimmed);
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded border border-gray-200 p-4">
      <h2 className="font-semibold">Add your availability</h2>
      <label htmlFor="join-name" className="text-sm">
        Your name
      </label>
      <div className="flex gap-2">
        <input
          id="join-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          className="flex-1 rounded border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-gray-900 px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {submitting ? 'Joining…' : 'Join'}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </form>
  );
};
