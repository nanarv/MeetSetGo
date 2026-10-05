import { Link, Outlet } from 'react-router';
import { AuthGate } from './AuthGate';

export const Layout = () => (
  <div className="min-h-screen">
    <header className="border-b border-gray-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold">
          MeetSetGo
        </Link>
        <Link to="/new" className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white">
          New meeting
        </Link>
      </div>
    </header>
    <main className="mx-auto max-w-6xl px-4 py-6">
      <AuthGate>
        <Outlet />
      </AuthGate>
    </main>
  </div>
);
