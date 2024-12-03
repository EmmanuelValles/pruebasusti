'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/app/firebase/config';

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
      <div className={`fixed inset-0 z-20 bg-teal-900 text-white p-6 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-64`}>
        <div className="flex items-center justify-between mb-8 lg:hidden">
          <h1 className="text-lg font-bold">Susticorp</h1>
          <button onClick={() => setIsMenuOpen(false)} className="text-white">
            <span className="material-icons">close</span>
          </button>
        </div>
        <div className="flex flex-col items-center mb-10">
          <img src="https://res.cloudinary.com/dqigc5zir/image/upload/v1733178017/nplcp7t5yc0czt7pctwc.png" alt="Susticorp Logo" className="w-16 h-16 mb-4" />
          <h1 className="text-lg font-semibold">Susticorp</h1>
        </div>
        <ul className="space-y-4">
          {[
            { label: 'Citas', path: '/admin/citas' },
            { label: 'Cotizaciones', path: '/admin/cotizaciones' },
            { label: 'Añadir servicio', path: '/admin/agregarservicio'},
            { label: 'Modificar servicio', path: '/admin/modificarservicio'},
          ].map(({ label, path, icon }) => (
            <li key={path}>
              <button onClick={() => router.push(path)} className="flex items-center space-x-2 hover:text-teal-400">
                <span className="material-icons">{icon}</span>
                <span>{label}</span>
              </button>
            </li>
          ))}
          <li>
            <button onClick={handleSignOut} className="flex items-center space-x-2 hover:text-teal-400">
              <span>Cerrar sesión</span>
            </button>
          </li>
        </ul>
      </div>

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
