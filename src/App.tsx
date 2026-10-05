import { BrowserRouter, Route, Routes } from 'react-router';
import { AuthProvider } from './components/AuthProvider';
import { CreateMeetingPage } from './components/CreateMeetingPage';
import { HomePage } from './components/HomePage';
import { Layout } from './components/Layout';
import { MeetingPage } from './components/MeetingPage';
import { StatusMessage } from './components/StatusMessage';

export const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="new" element={<CreateMeetingPage />} />
          <Route path="m/:meetingId" element={<MeetingPage />} />
          <Route path="*" element={<StatusMessage>Page not found.</StatusMessage>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
