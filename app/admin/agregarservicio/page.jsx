'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/app/firebase/config'; // Importa la configuración de Firebase
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import Navbar from '@/app/components/navbar'
import Swal from 'sweetalert2';
import withAuth from '@/app/hoc/withAuth';


function AgregarServicio() {
  const router = useRouter();
  const serviciosCollection = collection(db, "servicios");
  // Estados locales para los valores del formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [rangoPrecios, setRangoPrecios] = useState('');
  const [imagenes, setImagenes] = useState([]); // Archivos seleccionados
  const [previews, setPreviews] = useState([]); // URLs para las miniaturas
  const [subiendo, setSubiendo] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Menú de la sidebar

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImagenes((prev) => [...prev, ...files]);

    // Generar vistas previas para las imágenes seleccionadas
    const filePreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...filePreviews]);
  };

  const eliminarImagen = (index) => {
    setImagenes((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const subirImagenesACloudinary = async () => {
    const enlaces = [];

    for (let imagen of imagenes) {
      const formData = new FormData();
      formData.append("file", imagen);
      formData.append("upload_preset", "susticorpcloudinary"); // Reemplaza con tu Upload Preset
      formData.append("folder", `servicios/${nombre}`); // Carpeta en Cloudinary

      const response = await fetch("https://api.cloudinary.com/v1_1/dqigc5zir/image/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error al subir la imagen: ${imagen.name}`);
      }

      const data = await response.json();
      enlaces.push(data.secure_url); // Agregar la URL segura
    }

    return enlaces;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validar campos
    if (!nombre || !descripcion || !rangoPrecios || imagenes.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, completa todos los campos del formulario e incluye al menos una imagen.',
      });
      return;
    }
  
    setSubiendo(true);
  
    try {
      // Subir imágenes a Cloudinary y obtener sus URLs
      const enlacesImagenes = await subirImagenesACloudinary();
  
      // Crear un documento en la colección "servicios"
      const servicioRef = await addDoc(serviciosCollection, {
        nombre,
        descripcion,
        rangoPrecios,
        creadoEn: new Date(),
      });
  
      // Crear una subcolección para las imágenes
      const imagenesCollection = collection(servicioRef, "imagenes");
      for (let url of enlacesImagenes) {
        await setDoc(doc(imagenesCollection), { url });
      }
  
      // Mostrar alerta de éxito
      Swal.fire({
        icon: 'success',
        title: 'Servicio agregado',
        text: 'El servicio se ha agregado correctamente.',
        confirmButtonText: 'Aceptar',
      }).then(() => {
        router.push('/admin/modificarservicio'); 
      });
    } catch (error) {
      console.error("Error al agregar el servicio: ", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al agregar el servicio. Por favor, inténtalo de nuevo.',
      });
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <header className="flex items-center justify-between mb-8 lg:hidden">
          <h1 className="text-2xl font-bold">Agregar Servicio</h1>
          <button onClick={() => setIsMenuOpen(true)} className="text-gray-800">
            <span className="material-icons">menu</span>
          </button>
        </header>

        {/* Botones Volver y Agregar Cita */}
        <div className="flex justify-between mb-4">
          <button
            className="bg-teal-800 text-white px-4 py-2 rounded"
            onClick={() => router.push('/admin/dashboard')}
          >
            Volver
          </button>
        </div>

        {/* Formulario para agregar servicio */}
        <div className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-lg p-8 mt-10">
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
                    <div key={index} className="relative w-24 h-24 border rounded-lg overflow-hidden">
                      <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => eliminarImagen(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                      >
                        ×
                      </button>
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
    </div>
  );
}

export default withAuth(AgregarServicio);
