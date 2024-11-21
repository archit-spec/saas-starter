
// app/dashboard/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { auth } from '../lib/firebase';
import DashboardProcessor from '../dashboard/DashboardProcessor';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  if (!user) return null;

  return <DashboardProcessor />;
}
