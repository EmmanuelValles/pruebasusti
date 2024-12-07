'use client';
import { useRouter } from 'next/navigation';
import { auth } from '@/app/firebase/config';

const Navbar = ({ isMenuOpen, setIsMenuOpen }) => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push('/admin/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleLogoClick = () => {
    router.push('/admin/dashboard');
  };

  return (
    <div className={`fixed inset-0 z-20 bg-teal-900 text-white p-6 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-64`}>
      <div className="flex items-center justify-between mb-8 lg:hidden">
        <h1 className="text-lg font-bold">Susticorp</h1>
        <button onClick={() => setIsMenuOpen(false)} className="text-white">
          <span className="material-icons">close</span>
        </button>
      </div>
      <div className="flex flex-col items-center mb-10">
        <img
          src="https://res.cloudinary.com/dqigc5zir/image/upload/v1733178017/nplcp7t5yc0czt7pctwc.png"
          alt="Susticorp Logo"
          className="w-16 h-16 mb-4 cursor-pointer"
          onClick={handleLogoClick}
        />
        <h1 className="text-lg font-semibold">Susticorp</h1>
      </div>
      <ul className="space-y-4">
        {[
          { label: 'Citas', path: '/admin/citas' },
          { label: 'Cotizaciones', path: '/admin/cotizaciones' },
          { label: 'Añadir servicio', path: '/admin/agregarservicio' },
          { label: 'Modificar servicio', path: '/admin/modificarservicio' },
          { label: 'Agregar usuario', path: '/admin/sign-up' },
        ].map(({ label, path }) => (
          <li key={path}>
            <button onClick={() => router.push(path)} className="flex items-center space-x-2 hover:text-teal-400">
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
  );
};

export default Navbar;
