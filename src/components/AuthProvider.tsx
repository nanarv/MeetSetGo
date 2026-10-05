import { useEffect, useState, type PropsWithChildren } from 'react';
import { AuthContext, type AuthState } from '../hooks/useAuth';
import { signInAsGuest, subscribeToAuth } from '../services/authService';
import { toError } from '../utilities/errors';

/** Signs every visitor in anonymously so Firestore rules can tell browsers apart. */
export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useState<AuthState>({ user: null, error: null });

  useEffect(() => {
    const signIn = async () => {
      try {
        await signInAsGuest();
      } catch (error) {
        console.error('Anonymous sign-in failed', error);
        setState({ user: null, error: toError(error) });
      }
    };

    return subscribeToAuth(
      (user) => {
        if (user) {
          setState({ user, error: null });
        } else {
          void signIn();
        }
      },
      (error) => setState({ user: null, error }),
    );
  }, []);

  return <AuthContext value={state}>{children}</AuthContext>;
};
