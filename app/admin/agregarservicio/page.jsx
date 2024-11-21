'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, storage } from '@/app/firebase/config'; // Importa la configuración de Firebase
import { addDoc, collection } from 'firebase/firestore';
import { auth } from '@/app/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function AgregarServicio() {
  const router = useRouter();
  const serviciosCollection = collection(db, "servicios");
  const [user, setUser] = useState(null);
  // Estados locales para los valores del formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [rangoPrecios, setRangoPrecios] = useState('');
  const [imagenes, setImagenes] = useState([]); // Archivos seleccionados
  const [previews, setPreviews] = useState([]); // URLs para las miniaturas
  const [subiendo, setSubiendo] = useState(false);

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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImagenes(files);

    // Generar vistas previas para las imágenes seleccionadas
    const filePreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews(filePreviews);
  };

  const subirImagenes = async () => {
    const enlaces = [];

    for (let imagen of imagenes) {
      const imagenRef = ref(storage, `servicios/${nombre}/${imagen.name}`);
      await uploadBytes(imagenRef, imagen); // Sube la imagen
      const url = await getDownloadURL(imagenRef); // Obtén el enlace público
      enlaces.push(url); // Guarda el enlace
    }

    return enlaces;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubiendo(true);

    try {
      const enlacesImagenes = await subirImagenes(); // Subir imágenes y obtener enlaces

      // Agrega el documento a la colección "servicios" en Firestore
      await addDoc(serviciosCollection, {
        nombre,
        descripcion,
        rangoPrecios,
        imagenes: enlacesImagenes, // Guarda los enlaces de las imágenes
        creadoEn: new Date(),
      });

      console.log("Servicio agregado correctamente");
      // Redirecciona o limpia el formulario
      router.push('/admin/dashboard'); // Redirecciona a la página principal o a donde prefieras
    } catch (error) {
      console.error("Error al agregar el servicio: ", error);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-300">
      <div className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-lg p-8 mt-10">
        <header className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="bg-teal-900 text-white py-1 px-3 rounded-lg font-bold"
          >
            Volver
          </button>
          <h1 className="text-xl text-black font-bold">Agregar servicio</h1>
          <div className="w-8"></div> {/* Placeholder para balancear el diseño */}
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-lg text-black font-semibold">Información:</h2>
          </div>

          <div className="flex flex-col space-y-4">
            <label className="text-gray-600 font-semibold">
              Nombre:
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ingrese el nombre del servicio"
                className="border rounded-lg w-full p-2 mt-1"
                required
              />
            </label>

            <label className="text-gray-600 font-semibold">
              Descripción:
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describa el servicio"
                className="border rounded-lg w-full p-2 mt-1"
                rows="4"
                required
              />
            </label>

            <label className="text-gray-600 font-semibold">
              Rango de precios:
              <input
                type="text"
                value={rangoPrecios}
                onChange={(e) => setRangoPrecios(e.target.value)}
                placeholder="Ingrese el rango de precios"
                className="border rounded-lg w-full p-2 mt-1"
                required
              />
            </label>

            <label className="text-gray-600 font-semibold">
              Imágenes:
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="border rounded-lg w-full p-2 mt-1"
                accept="image/*"
              />
            </label>

            {/* Vista previa de las imágenes */}
            {previews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {previews.map((preview, index) => (
                  <div key={index} className="w-24 h-24 border rounded-lg overflow-hidden">
                    <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className={`w-full ${subiendo ? 'bg-gray-400' : 'bg-teal-900'} text-white py-2 rounded-lg font-bold mt-6`}
            disabled={subiendo}
          >
            {subiendo ? 'Subiendo...' : 'Agregar servicio'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AgregarServicio;
