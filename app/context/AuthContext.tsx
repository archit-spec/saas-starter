// app/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { createUserDocument } from '../actions/firestore';
import { setAuthCookie, removeAuthCookie } from '../lib/cookies';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setUser(user);
          // Get the ID token and set it in the cookie
          const token = await user.getIdToken();
          await setAuthCookie(token);
        } else {
          setUser(null);
          await removeAuthCookie();
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const { user } = result;
      
      // Create or update user document in Firestore
      await createUserDocument(user.uid, user.email || '');
      
      // Set auth cookie
      const token = await user.getIdToken();
      await setAuthCookie(token);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      await removeAuthCookie();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);