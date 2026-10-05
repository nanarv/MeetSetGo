import type { Participant } from '../types/meeting';

interface RespondentListProps {
  participants: Participant[];
  creatorId: string;
  userId: string;
}

export const RespondentList = ({ participants, creatorId, userId }: RespondentListProps) => (
  <section>
    <h2 className="mb-1 font-semibold">Responded ({participants.length})</h2>
    {participants.length === 0 ? (
      <p className="text-sm text-gray-500">No one has responded yet.</p>
    ) : (
      <ul className="flex flex-wrap gap-2">
        {participants.map(({ id, name }) => (
          <li key={id} className="rounded-full bg-gray-100 px-3 py-1 text-sm">
            ✅ {name}
            {id === userId && <span className="text-gray-500"> (you)</span>}
            {id === creatorId && <span className="text-gray-500"> · organizer</span>}
          </li>
        ))}
      </ul>
    )}
  </section>
);
