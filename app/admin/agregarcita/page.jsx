'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/app/firebase/config'; 
import { collection, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import Swal from 'sweetalert2'; // Importamos SweetAlert
import Navbar from '@/app/components/navbar';
import withAuth from '@/app/hoc/withAuth';

function AgregarCita() {
  const [servicios, setServicios] = useState([]); // Lista de servicios disponibles
  const [formData, setFormData] = useState({
    clienteNombre: '',
    fecha: '', // Campo de fecha
    hora: '',
    servicio: '', // ID del servicio
    telefono: '',
    correo: '',
    direccion: '',
  });
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  // Cargar servicios desde Firestore
  useEffect(() => {
    const fetchServicios = async () => {
      const serviciosRef = collection(db, 'servicios');
      const serviciosSnapshot = await getDocs(serviciosRef);
      const serviciosList = serviciosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServicios(serviciosList);
    };

    fetchServicios();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Agregar cita a Firestore
  // Agregar cita a Firestore con validaciones
const agregarCita = async () => {
  const { clienteNombre, fecha, hora, servicio, telefono, correo, direccion } = formData;

  // Validar que todos los campos estén completos
  if (!clienteNombre || !fecha || !hora || !servicio || !telefono || !correo || !direccion) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Por favor, completa todos los campos.',
    });
    return;
  }

  // Validar formato de correo electrónico
  const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!correoRegex.test(correo)) {
    Swal.fire({
      icon: 'error',
      title: 'Correo inválido',
      text: 'Por favor, ingresa una dirección de correo válida.',
    });
    return;
  }

  // Validar longitud del número de teléfono
  if (telefono.length !== 10 || !/^\d+$/.test(telefono)) {
    Swal.fire({
      icon: 'error',
      title: 'Teléfono inválido',
      text: 'El número de teléfono debe contener exactamente 10 dígitos.',
    });
    return;
  }

  try {
    // Primero, obtener el nombre del servicio a partir de su ID
    const servicioRef = doc(db, 'servicios', servicio);
    const servicioSnapshot = await getDoc(servicioRef);

    if (!servicioSnapshot.exists()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Servicio no encontrado.',
      });
      return;
    }

    const nombreServicio = servicioSnapshot.data().nombre;

    // Luego, guardar la cita con el nombre del servicio
    const citasCollectionRef = collection(servicioRef, 'citas'); // Subcolección "citas"

    await addDoc(citasCollectionRef, {
      clienteNombre,
      fecha,
      hora,
      servicio: nombreServicio, // Guardamos el nombre del servicio
      estado: 'Pendiente', // Se guarda automáticamente como "Pendiente"
      telefono,
      correo,
      direccion,
    });

    Swal.fire({
      icon: 'success',
      title: 'Cita agregada',
      text: 'La cita se agregó correctamente.',
      confirmButtonText: 'Aceptar',
    }).then(() => {
      router.push('/admin/citas'); // Redirigir a la página de citas
    });
  } catch (error) {
    console.error('Error al agregar la cita:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error al agregar la cita.',
    });
  }
};


  return (
    <div className="flex min-h-screen bg-gray-100">
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      {/* Sidebar */}
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 lg:hidden">
          <h1 className="text-2xl font-bold text-black">Agregar cita</h1>
          <button onClick={() => setIsMenuOpen(true)} className="text-gray-800">
            <span className="material-icons">menu</span>
          </button>
        </header>

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-bold text-gray-600 text-lg mb-4">Información de la cita:</h2>

          <div className="grid grid-cols-1 gap-4">
            {/* Nombre del cliente */}
            <div>
              <label className="block text-gray-600 font-semibold mb-2">Nombre del cliente:</label>
              <input
                type="text"
                name="clienteNombre"
                value={formData.clienteNombre}
                onChange={handleChange}
                className="w-full text-gray-600 p-2 border rounded"
              />
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-gray-600 font-semibold mb-2">Fecha:</label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className="w-full p-2 text-gray-600 border rounded"
              />
            </div>

            {/* Hora */}
            <div>
              <label className="block text-gray-600 font-semibold mb-2">Hora:</label>
              <input
                type="time"
                name="hora"
                value={formData.hora}
                onChange={handleChange}
                className="w-full p-2 text-gray-600 border rounded"
              />
            </div>

            {/* Servicio */}
            <div>
              <label className="block text-gray-600 font-semibold mb-2">Servicio:</label>
              <select
                name="servicio"
                value={formData.servicio}
                onChange={handleChange}
                className="w-full p-2 text-gray-600 border rounded"
              >
                <option value="">Selecciona</option>
                {servicios.map((servicio) => (
                  <option key={servicio.id} value={servicio.id}>
                    {servicio.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-gray-600 font-semibold mb-2">Teléfono:</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full p-2 border text-gray-600 rounded"
              />
            </div>

            {/* Correo */}
            <div>
              <label className="block text-gray-600 font-semibold mb-2">Correo:</label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                className="w-full p-2 text-gray-600 border rounded"
              />
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-gray-600 font-semibold mb-2">Dirección:</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="w-full p-2 text-gray-600 border rounded"
              />
            </div>
          </div>

          {/* Botón para agregar cita */}
          <div className="mt-6">
            <button
              className="bg-teal-800 text-white px-4 py-2 rounded w-full"
              onClick={agregarCita}
            >
              Agregar cita
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(AgregarCita);
