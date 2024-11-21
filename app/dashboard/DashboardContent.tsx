// app/components/dashboard/DashboardContent.tsx
import { Card } from '@/components/ui/card';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function DashboardContent() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
      installed react-chartjs-2@5.2.0
      installed chart.js@4.4.6
      installed @types/chart.js@2.9.41
      
      5 packages installed [2.27s]
      
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button 
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
        {/* Add your dashboard components here */}
      </div>
    </div>
  );
}
