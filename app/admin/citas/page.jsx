'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/app/firebase/config'; // Importa la configuración de Firebase
import { collection, query, getDocs, onSnapshot } from 'firebase/firestore';

function Citas() {
  const [servicios, setServicios] = useState([]); // Lista de servicios
  const [citas, setCitas] = useState([]); // Lista de citas filtradas
  const [citaSeleccionada, setCitaSeleccionada] = useState(null); // Cita activa
  const [servicioSeleccionado, setServicioSeleccionado] = useState(''); // Filtro de servicio

  const router = useRouter();

  // Obtener lista de servicios al cargar la página
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

  // Obtener citas según el servicio seleccionado
  useEffect(() => {
    const fetchCitas = async () => {
      let citasQuery;
      if (servicioSeleccionado && servicioSeleccionado !== 'todos') {
        // Obtener citas solo de un servicio específico
        const citasRef = collection(db, 'servicios', servicioSeleccionado, 'citas');
        citasQuery = citasRef;
      } else {
        // Obtener todas las citas de todos los servicios
        citasQuery = collection(db, 'servicios');
      }

      const unsubscribe = onSnapshot(citasQuery, (snapshot) => {
        const citasList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCitas(citasList);
      });

      return () => unsubscribe(); // Limpiar la suscripción
    };

    fetchCitas();
  }, [servicioSeleccionado]);

  // Cambiar estado de la cita
  const cambiarEstado = (id) => {
    console.log('Cambiando estado de la cita:', id);
  };

  // Cancelar cita
  const cancelarCita = (id) => {
    console.log('Cancelando cita:', id);
  };

  // Manejo de volver a la página principal
  const handleVolver = () => {
    router.push('/admin/dashboard'); // Ruta para regresar a la página principal
  };

  return (
    <div className="flex min-h-screen bg-gray-300">
      {/* Sidebar */}
      <div className="fixed inset-0 z-20 bg-teal-900 text-white p-6 transform translate-x-0 lg:relative lg:translate-x-0 lg:w-64 lg:bg-white lg:text-black">
        <div className="flex items-center justify-between mb-8 lg:hidden">
          <h1 className="text-lg text-black font-bold">Susticorp</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl text-black font-bold">Citas</h1>
          {/* Botón de agregar cita */}
          <button
            className="bg-teal-800 text-white px-4 py-2 rounded"
            onClick={() => router.push('/admin/agregarcita')}
          >
            Agregar cita
          </button>
        </header>

        {/* Botón Volver */}
        <div className="mb-4">
          <button
            className="bg-teal-800 text-white px-4 py-2 rounded"
            onClick={handleVolver}
          >
            Volver
          </button>
        </div>

        {/* Dropdown para filtrar servicios */}
        <div className="mb-4">
          <label htmlFor="servicios" className="block text-black font-semibold mb-2">
            Próximas citas:
          </label>
          <select
            id="servicios"
            className="w-full p-2 text-gray-600 border rounded"
            value={servicioSeleccionado}
            onChange={(e) => setServicioSeleccionado(e.target.value)}
          >
            <option value="todos">Todos los servicios</option>
            {servicios.map((servicio) => (
              <option key={servicio.id} value={servicio.id}>
                {servicio.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex">
          {/* Lista de citas */}
          <div className="w-1/3 text-gray-600 bg-white rounded-lg shadow p-4 mr-4">
            {citas.map((cita) => (
              <div
                key={cita.id}
                className={`p-2 mb-2 cursor-pointer rounded ${citaSeleccionada?.id === cita.id ? 'bg-teal-100' : 'hover:bg-gray-100'}`}
                onClick={() => setCitaSeleccionada(cita)}
              >
                <p>{cita.fecha} {cita.hora}</p>
              </div>
            ))}
          </div>

          {/* Detalles de la cita seleccionada */}
          <div className="flex-1 bg-white rounded-lg shadow p-4">
            {citaSeleccionada ? (
              <>
                <h2 className="font-bold text-black text-lg mb-4">Información:</h2>
                <p className='text-gray-600'><strong>Fecha:</strong> {citaSeleccionada.fecha}</p>
                <p className='text-gray-600'><strong>Hora:</strong> {citaSeleccionada.hora}</p>
                <p className='text-gray-600'><strong>Servicio:</strong> {citaSeleccionada.servicio}</p>
                <p className='text-gray-600'><strong>Estado:</strong> {citaSeleccionada.estado}</p>
                <p className='text-gray-600'><strong>Nombre del cliente:</strong> {citaSeleccionada.clienteNombre}</p>
                <p className='text-gray-600'><strong>Teléfono:</strong> {citaSeleccionada.telefono}</p>
                <p className='text-gray-600'><strong>Correo:</strong> {citaSeleccionada.correo}</p>
                <p className='text-gray-600'><strong>Dirección:</strong> {citaSeleccionada.direccion}</p>

                <div className="mt-4 flex justify-between">
                  <button
                    className="bg-teal-800 text-white px-4 py-2 rounded"
                    onClick={() => cambiarEstado(citaSeleccionada.id)}
                  >
                    Cambiar Estado
                  </button>
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded"
                    onClick={() => cancelarCita(citaSeleccionada.id)}
                  >
                    Cancelar cita
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-500">Selecciona una cita para ver los detalles</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Citas;
