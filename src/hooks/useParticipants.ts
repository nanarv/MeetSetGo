import { useEffect, useState } from 'react';
import { subscribeToParticipants } from '../services/meetingService';
import type { LoadState } from '../types/loadState';
import type { Participant } from '../types/meeting';

export const useParticipants = (meetingId: string): LoadState<Participant[]> => {
  const [state, setState] = useState<LoadState<Participant[]>>({ status: 'loading' });

  useEffect(
    () =>
      subscribeToParticipants(
        meetingId,
        (data) => setState({ status: 'ready', data }),
        (error) => setState({ status: 'error', error }),
      ),
    [meetingId],
  );

  return state;
};
