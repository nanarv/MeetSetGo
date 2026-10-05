import { useEffect, useState } from 'react';
import { subscribeToMeeting } from '../services/meetingService';
import type { LoadState } from '../types/loadState';
import type { Meeting } from '../types/meeting';

/** Live meeting document; `data` is null when the meeting does not exist. */
export const useMeeting = (meetingId: string): LoadState<Meeting | null> => {
  const [state, setState] = useState<LoadState<Meeting | null>>({ status: 'loading' });

  useEffect(
    () =>
      subscribeToMeeting(
        meetingId,
        (data) => setState({ status: 'ready', data }),
        (error) => setState({ status: 'error', error }),
      ),
    [meetingId],
  );

  return state;
};
