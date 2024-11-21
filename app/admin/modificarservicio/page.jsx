'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, storage } from '@/app/firebase/config';
import { collection, doc, getDocs, getDoc, updateDoc } from 'firebase/firestore';
import { auth } from '@/app/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function ModificarServicio() {
  const router = useRouter();
  const serviciosCollection = collection(db, "servicios");
  const [user, setUser] = useState(null);
  const [servicios, setServicios] = useState([]);
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [rangoPrecios, setRangoPrecios] = useState('');
  const [imagenes, setImagenes] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [subiendo, setSubiendo] = useState(false);

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

  useEffect(() => {
    const fetchServicios = async () => {
      const querySnapshot = await getDocs(serviciosCollection);
      const serviciosList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServicios(serviciosList);
    };

    fetchServicios();
  }, []);

  const selectServicio = async (id) => {
    const docRef = doc(db, "servicios", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      setSelectedServicio(id);
      setNombre(data.nombre);
      setDescripcion(data.descripcion);
      setRangoPrecios(data.rangoPrecios);
      setPreviews(data.imagenes || []);
    } else {
      console.error("Servicio no encontrado");
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImagenes(files);

    const filePreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...filePreviews]);
  };

  const subirImagenes = async () => {
    const enlaces = [];

    for (let imagen of imagenes) {
      const imagenRef = ref(storage, `servicios/${nombre}/${imagen.name}`);
      await uploadBytes(imagenRef, imagen);
      const url = await getDownloadURL(imagenRef);
      enlaces.push(url);
    }

    return enlaces;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubiendo(true);

    try {
      const enlacesImagenes = await subirImagenes();
      const docRef = doc(db, "servicios", selectedServicio);

      await updateDoc(docRef, {
        nombre,
        descripcion,
        rangoPrecios,
        imagenes: [...previews, ...enlacesImagenes],
      });

      console.log("Servicio actualizado correctamente");
      router.push('/admin/dashboard');
    } catch (error) {
      console.error("Error al actualizar el servicio: ", error);
    } finally {
      setSubiendo(false);
    }
  };

  if (!user) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="flex min-h-screen bg-gray-300">
      {/* Lista de servicios */}
      <div className="w-1/3 bg-white shadow-lg p-4">
        <header className="flex justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="bg-teal-900 text-white py-1 px-3 rounded-lg font-bold"
          >
            Volver
          </button>
          <h2 className="text-xl text-black font-bold">Servicios</h2>
          <div className="w-8"></div> {/* Espacio para balancear el diseño */}
        </header>
        <ul className="space-y-2">
          {servicios.map(servicio => (
            <li
              key={servicio.id}
              className={`p-2 rounded-lg text-slate-950 cursor-pointer ${selectedServicio === servicio.id ? 'bg-teal-300' : 'hover:bg-teal-100'}`}
              onClick={() => selectServicio(servicio.id)}
            >
              {servicio.nombre}
            </li>
          ))}
        </ul>
      </div>

      {/* Formulario de edición */}
      <div className="w-2/3 bg-white shadow-lg p-8">
        {selectedServicio ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl text-slate-950 font-bold">Modificar servicio</h2>

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

            {previews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {previews.map((preview, index) => (
                  <div key={index} className="w-24 h-24 border rounded-lg overflow-hidden">
                    <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              className={`w-full ${subiendo ? 'bg-gray-400' : 'bg-teal-900'} text-white py-2 rounded-lg font-bold mt-6`}
              disabled={subiendo}
            >
              {subiendo ? 'Actualizando...' : 'Modificar servicio'}
            </button>
          </form>
        ) : (
          <p className="text-slate-950">Seleccione un servicio para modificarlo.</p>
        )}
      </div>
    </div>
  );
}

export default ModificarServicio;
