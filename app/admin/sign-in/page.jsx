'use client';
import { useState } from 'react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signInWithEmailAndPassword, user, loading, signInError] = useSignInWithEmailAndPassword(auth);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await signInWithEmailAndPassword(email, password);

    if (res && auth.currentUser) {
      router.push('/admin/dashboard'); // Redirigir al dashboard si el login es exitoso
    } else if (signInError) {
      const errorMessages = {
        'auth/wrong-password': 'La contraseña es incorrecta.',
        'auth/user-not-found': 'El usuario no existe.',
        'auth/invalid-credential': 'Las credenciales son inválidas.',
      };
      const message = errorMessages[signInError.code] || 'Ocurrió un error inesperado. Intenta nuevamente.';
      alert(message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-300 relative">
      <div className="absolute top-4 left-4 flex items-center">
        <img
          src="https://firebasestorage.googleapis.com/v0/b/susticorpbd.firebasestorage.app/o/susticorp%2Flogos%2Flogo.png?alt=media&token=86254d1a-b77f-4299-be55-41ab6af00615"
          alt="SUSTICORP Logo"
          className="w-8 h-8 mr-2"
        />
        <span className="font-bold text-xl text-gray-700">SUSTICORP</span>
      </div>

      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-black text-center mb-4">Bienvenido de nuevo</h2>
        <p className="text-center mb-6 text-gray-600">Por favor, ingresa tus datos</p>

        <form onSubmit={handleSubmit}>
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
            Correo electrónico
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 text-slate-950 rounded mb-4 focus:outline-none focus:border-teal-500"
            placeholder="Ingresa tu correo"
            required
          />

          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-slate-950 mb-6 focus:outline-none focus:border-teal-500"
            placeholder="Ingresa tu contraseña"
            required
          />

          <button
            type="submit"
            className="w-full p-2 bg-teal-600 text-white font-semibold rounded hover:bg-teal-700 transition duration-200"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignIn;
