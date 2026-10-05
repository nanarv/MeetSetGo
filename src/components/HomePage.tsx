import { Link } from 'react-router';
import { useCurrentUser } from '../hooks/useAuth';
import { MyMeetingsList } from './MyMeetingsList';

export const HomePage = () => {
  const user = useCurrentUser();
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col items-start gap-3">
        <h1 className="text-3xl font-bold">Find a weekly time that works</h1>
        <p className="max-w-prose text-gray-600">
          Create a meeting, share the link, and everyone paints the times they're free. MeetSetGo shows
          when the most people can make it.
        </p>
        <Link to="/new" className="rounded bg-gray-900 px-5 py-2 font-medium text-white">
          Create a meeting
        </Link>
      </section>
      <MyMeetingsList userId={user.uid} />
    </div>
  );
};
