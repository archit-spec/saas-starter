'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SubscriptionContextType {
  isPremium: boolean;
  loading: boolean;
  updateSubscriptionStatus: (status: boolean) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isPremium: false,
  loading: true,
  updateSubscriptionStatus: async () => {},
});

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setIsPremium(false);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        setIsPremium(userData?.isPremium || false);
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [user]);

  const updateSubscriptionStatus = async (status: boolean) => {
    if (!user) return;

    try {
      await setDoc(doc(db, 'users', user.uid), {
        isPremium: status,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      
      setIsPremium(status);
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  };

  return (
    <SubscriptionContext.Provider value={{ isPremium, loading, updateSubscriptionStatus }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext);
