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
        setUser(currentUser); // Guardar al usuario autenticado
      } else {
        router.push('/admin/sign-in'); // Redirigir al login si no hay usuario
      }
    });

    return () => unsubscribe(); // Limpiar el listener cuando se desmonta el componente
  }, [router]);

  if (!user) {
    return <p>Cargando...</p>; // Mostrar algo mientras se verifica la autenticación
  }
  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push('/admin/sign-in'); // Redirigir al login después de cerrar sesión
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Implementar manejo de errores personalizado (opcional)
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-300">
      {/* Sidebar */}
      <div className={`fixed inset-0 z-20 bg-teal-900 text-white p-6 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-64 lg:bg-white lg:text-black`}>
        <div className="flex items-center justify-between mb-8 lg:hidden">
          <h1 className="text-lg font-bold">Susticorp</h1>
          <button onClick={() => setIsMenuOpen(false)} className="text-white lg:hidden">
            <span className="material-icons">close</span>
          </button>
        </div>
        <div className="flex flex-col items-center mb-10">
          <img src="https://firebasestorage.googleapis.com/v0/b/susticorpbd.firebasestorage.app/o/susticorp%2Flogos%2Flogo.png?alt=media&token=86254d1a-b77f-4299-be55-41ab6af00615" alt="Susticorp Logo" className="w-16 h-16 mb-2" />
          <h1 className="text-lg font-semibold lg:text-black">Susticorp</h1>
        </div>
        <ul>
          <li className="mb-4">
            <button onClick={() => router.push('/admin/citas')} className="font-medium hover:text-teal-400">Citas</button>
          </li>
          <li className="mb-4">
            <button onClick={() => router.push('/admin/cotizaciones')} className="font-medium hover:text-teal-400">Cotizaciones</button>
          </li>
          <li className="mb-4">
            <button onClick={() => router.push('/admin/agregarservicio')} className="font-medium hover:text-teal-400">Añadir servicio</button>
          </li>
          <li className="mb-4">
            <button onClick={() => router.push('/admin/modificarservicio')} className="font-medium hover:text-teal-400">Modificar servicio</button>
          </li>
          <li>
            <button onClick={handleSignOut} className="font-medium hover:text-teal-400">Cerrar sesión</button>
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

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between mb-4">
            <div className="text-center">
              <h2 className="font-semibold text-black text-lg">Citas pendientes:</h2>
              <p className="text-2xl text-gray-500 font-bold">XX</p>
            </div>
            <div className="text-center">
              <h2 className="font-semibold text-black text-lg">Cotizaciones pendientes:</h2>
              <p className="text-2xl text-gray-500 font-bold">XX</p>
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            <p className="text-center text-gray-500">Espacio para calendario</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
