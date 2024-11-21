'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
      <div className="text-center text-white p-8">
        <h1 className="text-5xl font-bold mb-4">Analytics Dashboard</h1>
        <p className="text-xl mb-8">Powerful insights for your business</p>
        <Link href="/auth/login">
          <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  );
}
