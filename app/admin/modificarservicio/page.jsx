'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/app/firebase/config';
import { collection, doc, getDocs, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import Navbar from '@/app/components/navbar'
import withAuth from '@/app/hoc/withAuth';

function ModificarServicio() {
  const router = useRouter();
  const serviciosCollection = collection(db, "servicios");
  const [servicios, setServicios] = useState([]);
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [rangoPrecios, setRangoPrecios] = useState('');
  const [imagenes, setImagenes] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [subiendo, setSubiendo] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

      // Obtener las imágenes de la subcolección "imagenes"
      const imagenesSnapshot = await getDocs(collection(docRef, "imagenes"));
      const imagenesList = imagenesSnapshot.docs.map(doc => doc.data().url);
      setPreviews(imagenesList);
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
      const formData = new FormData();
      formData.append('file', imagen);
      formData.append('upload_preset', 'susticorpcloudinary'); // Usar el preset de Cloudinary
      formData.append('cloud_name', 'dqigc5zir'); // Usar el nombre de tu Cloudinary

      const response = await fetch('https://api.cloudinary.com/v1_1/dqigc5zir/image/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      enlaces.push(data.secure_url); // La URL segura que Cloudinary devuelve
    }

    return enlaces;
  };

  const eliminarImagen = async (url) => {
    try {
      // Eliminar de Firestore
      const docRef = doc(db, "servicios", selectedServicio);
      const imagenesCollection = collection(docRef, "imagenes");
      const imagenSnap = await getDocs(imagenesCollection);
      const imagenDoc = imagenSnap.docs.find(doc => doc.data().url === url);
      if (imagenDoc) {
        await deleteDoc(imagenDoc.ref);
      }

      // Actualizar el estado
      setPreviews((prev) => prev.filter((preview) => preview !== url));
    } catch (error) {
      console.error("Error al eliminar la imagen: ", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubiendo(true);
  
    // Validación para asegurarse de que rangoPrecios no esté vacío
    if (!nombre || !descripcion || !rangoPrecios) {
      alert("Todos los campos son obligatorios.");
      setSubiendo(false);
      return;
    }
  
    try {
      const enlacesImagenes = await subirImagenes();
      const docRef = doc(db, "servicios", selectedServicio);
  
      // Actualiza el documento solo si los campos tienen valores válidos
      await updateDoc(docRef, {
        nombre,
        descripcion,
        rangoPrecios: rangoPrecios || "",  // Asegurando que no sea undefined
      });
  
      // Actualizar las imágenes en la subcolección "imagenes"
      const imagenesCollection = collection(docRef, "imagenes");
      enlacesImagenes.forEach(async (url) => {
        await updateDoc(imagenesCollection, { url });
      });
  
      console.log("Servicio actualizado correctamente");
      router.push('/admin/dashboard');
    } catch (error) {
      console.error("Error al actualizar el servicio: ", error);
    } finally {
      setSubiendo(false);
    }
  };
  

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      
      {/* Main Content */}
      <div className="flex-1 p-6 ml-64 lg:ml-0">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 lg:hidden">
          <h1 className="text-2xl font-bold text-black">Modificar servicio</h1>
          <button onClick={() => setIsMenuOpen(true)} className="text-gray-800">
            <span className="material-icons">menu</span>
          </button>
        </header>

        <div className="flex gap-8">
          {/* Service List */}
          <div className="w-1/3">
            <h2 className="text-xl font-semibold text-teal-900 mb-4">Lista de servicios</h2>
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

          {/* Service Form */}
          <div className="w-2/3 bg-white rounded-lg shadow p-6">
            {selectedServicio ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <header className="flex justify-between mb-6">
                  <h2 className="text-xl text-black font-bold">Modificar servicio</h2>
                  <div className="w-8"></div>
                </header>

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

                {/* Mostrar imágenes */}
                {previews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {previews.map((preview, index) => (
                      <div key={index} className="relative w-24 h-24 border rounded-lg overflow-hidden">
                        <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => eliminarImagen(preview)}
                          className="absolute top-0 right-0 text-red-600 font-bold"
                        >
                          X
                        </button>
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
      </div>
    </div>
  );
}

export default withAuth(ModificarServicio);
