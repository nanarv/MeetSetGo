import { useEffect, useState } from 'react';
import { subscribeToMyMeetings } from '../services/meetingService';
import type { LoadState } from '../types/loadState';
import type { Meeting } from '../types/meeting';

export const useMyMeetings = (userId: string): LoadState<Meeting[]> => {
  const [state, setState] = useState<LoadState<Meeting[]>>({ status: 'loading' });

  useEffect(
    () =>
      subscribeToMyMeetings(
        userId,
        (data) => setState({ status: 'ready', data }),
        (error) => setState({ status: 'error', error }),
      ),
    [userId],
  );

  return state;
};
