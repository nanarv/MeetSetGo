import type { PropsWithChildren } from 'react';
import { useAuth } from '../hooks/useAuth';
import { StatusMessage } from './StatusMessage';

/** Renders children only once the anonymous user is ready. */
export const AuthGate = ({ children }: PropsWithChildren) => {
  const { user, error } = useAuth();
  if (error) return <StatusMessage tone="error">{error.message}</StatusMessage>;
  if (!user) return <StatusMessage>Connecting…</StatusMessage>;
  return children;
};
