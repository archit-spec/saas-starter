'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User registered:', userCredential.user);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to register');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6">Register</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <Button type="submit" className="w-full">Register</Button>
        </form>
        <Link href="/auth/login" className="block mt-4 text-center text-sm">
          Already have an account? Login
        </Link>
      </div>
    </div>
  );
}