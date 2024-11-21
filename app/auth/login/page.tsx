// app/auth/login/page.tsx
'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc'; // Install with: bun add react-icons

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Google login error:', error);
      switch (error.code) {
        case 'auth/popup-blocked':
          setError('Please enable popups for this website');
          break;
        case 'auth/popup-closed-by-user':
          setError('Sign in was cancelled');
          break;
        case 'auth/cancelled-popup-request':
          setError('Only one popup request allowed at a time');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your connection');
          break;
        default:
          setError('Failed to login with Google. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Logged in:', userCredential.user);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      switch (error.code) {
        case 'auth/network-request-failed':
          setError('Network error. Please check your internet connection.');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password.');
          break;
        default:
          setError(error.message || 'Failed to login. Please try again.');
      }
    } finally {
      setLoading(false);
    }

    // ... your existing email login code
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <Button 
          type="button" 
          variant="outline" 
          className="w-full mb-4"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <FcGoogle className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
              disabled={loading}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login with Email'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link 
            href="/auth/register" 
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Don't have an account? Register
          </Link>
        </div>
      </div>
    </div>
  );
}