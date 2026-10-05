import { useParams } from 'react-router';
import { useCurrentUser } from '../hooks/useAuth';
import { useMeeting } from '../hooks/useMeeting';
import { useParticipants } from '../hooks/useParticipants';
import { MeetingView } from './MeetingView';
import { StatusMessage } from './StatusMessage';

export const MeetingPage = () => {
  const { meetingId = '' } = useParams();
  // Keyed so subscriptions and local state reset when navigating between meetings.
  return <MeetingLoader key={meetingId} meetingId={meetingId} />;
};

const MeetingLoader = ({ meetingId }: { meetingId: string }) => {
  const user = useCurrentUser();
  const meeting = useMeeting(meetingId);
  const participants = useParticipants(meetingId);

  if (meeting.status === 'error') {
    return <StatusMessage tone="error">Couldn't load this meeting: {meeting.error.message}</StatusMessage>;
  }
  if (participants.status === 'error') {
    return <StatusMessage tone="error">Couldn't load responses: {participants.error.message}</StatusMessage>;
  }
  if (meeting.status === 'loading' || participants.status === 'loading') {
    return <StatusMessage>Loading meeting…</StatusMessage>;
  }
  if (!meeting.data) {
    return <StatusMessage>This meeting doesn't exist or was deleted.</StatusMessage>;
  }
  return <MeetingView meeting={meeting.data} participants={participants.data} userId={user.uid} />;
};
