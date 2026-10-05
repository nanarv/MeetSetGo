import { FirebaseError } from 'firebase/app';
import { onAuthStateChanged, signInAnonymously, type Unsubscribe } from 'firebase/auth';
import type { AppUser } from '../types/user';
import { auth } from './firebase';

export const subscribeToAuth = (
  onUser: (user: AppUser | null) => void,
  onError: (error: Error) => void,
): Unsubscribe => onAuthStateChanged(auth, (user) => onUser(user ? { uid: user.uid } : null), onError);

export const signInAsGuest = async (): Promise<void> => {
  try {
    await signInAnonymously(auth);
  } catch (error) {
    if (
      error instanceof FirebaseError &&
      (error.code === 'auth/operation-not-allowed' || error.code === 'auth/admin-restricted-operation')
    ) {
      throw new Error(
        'Guest sign-in is turned off. Enable Anonymous sign-in in the Firebase console (Authentication → Sign-in method).',
        { cause: error },
      );
    }
    throw error;
  }
};
