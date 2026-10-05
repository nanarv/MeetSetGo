import { createContext, useContext } from 'react';
import type { AppUser } from '../types/user';

export interface AuthState {
  user: AppUser | null;
  error: Error | null;
}

export const AuthContext = createContext<AuthState>({ user: null, error: null });

export const useAuth = (): AuthState => useContext(AuthContext);

/** For screens rendered behind AuthGate, where a user is guaranteed. */
export const useCurrentUser = (): AppUser => {
  const { user } = useAuth();
  if (!user) throw new Error('useCurrentUser must be used inside AuthGate');
  return user;
};
