'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/app/firebase/config';
import Navbar from '@/app/components/navbar'

function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/admin/sign-in');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100"><p>Loading...</p></div>;
  }

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push('/admin/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <header className="flex items-center justify-between mb-8 lg:hidden">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button onClick={() => setIsMenuOpen(true)} className="text-gray-800">
            <span className="material-icons">menu</span>
          </button>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {[
              { label: 'Citas pendientes', value: 'XX', bg: 'bg-teal-100', text: 'text-teal-800' },
              { label: 'Cotizaciones pendientes', value: 'XX', bg: 'bg-yellow-100', text: 'text-yellow-800' },
            ].map(({ label, value, bg, text }) => (
              <div key={label} className={`p-4 rounded-lg shadow-md ${bg}`}>
                <h2 className={`text-lg font-semibold ${text}`}>{label}</h2>
                <p className={`text-3xl font-bold ${text}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t pt-6 text-center">
            <p className="text-gray-500">Espacio para calendario</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
