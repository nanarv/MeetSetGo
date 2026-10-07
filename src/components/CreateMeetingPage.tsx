import { useNavigate } from 'react-router';
import { useCurrentUser } from '../hooks/useAuth';
import { createMeeting } from '../services/meetingService';
import type { CreateMeetingValues } from '../types/meeting';
import { getDatesInRange } from '../utilities/dates';
import { detectTimeZone, timeZoneName } from '../utilities/time';
import { CreateMeetingForm } from './CreateMeetingForm';

export const CreateMeetingPage = () => {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const timeZone = detectTimeZone();

  const handleSubmit = async ({ name, ...meeting }: CreateMeetingValues) => {
    const days = getDatesInRange(meeting.startDate, meeting.endDate, meeting.weekdays);
    const id = await createMeeting({ ...meeting, days, timeZone }, { uid: user.uid, name });
    await navigate(`/m/${id}`);
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-bold">New meeting</h1>
      <p className="text-sm text-gray-600">Times are in {timeZoneName(timeZone)}.</p>
      <CreateMeetingForm onSubmit={handleSubmit} />
    </div>
  );
};
