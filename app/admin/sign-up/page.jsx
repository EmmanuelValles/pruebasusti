'use client'
import{ useState } from 'react';
import{useCreateUserWithEmailAndPassword}from 'react-firebase-hooks/auth';
import {auth} from "@/app/firebase/config";
import withAuth from '@/app/hoc/withAuth';


function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [CreateUserWithEmailAndPassword]= useCreateUserWithEmailAndPassword(auth);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    // Add signup logic here
    try{
        const res = CreateUserWithEmailAndPassword(email, password);
        console.log({res});
        setEmail('');
        setPassword('');
    }catch(e){
        console.error(e);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-300">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-black text-center mb-4">Crea una cuenta</h2>
        <p className="text-center mb-6 text-gray-600">Por favor, ingresa tus datos</p>
        
        <form onSubmit={handleSubmit}>
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
            Correo electrónico
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            className="w-full p-2 border border-gray-300 rounded mb-4 text-slate-950 focus:outline-none focus:border-teal-500"
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
            onChange={handlePasswordChange}
            className="w-full p-2 border border-gray-300 rounded mb-6 text-slate-950 focus:outline-none focus:border-teal-500"
            placeholder="Ingresa tu contraseña"
            required
          />

          <button
            type="submit"
            className="w-full p-2 bg-teal-600 text-white font-semibold rounded hover:bg-teal-700 transition duration-200"
          >
            Crear cuenta
          </button>
        </form>
      </div>
    </div>
  );
}

export default withAuth(SignUp);
