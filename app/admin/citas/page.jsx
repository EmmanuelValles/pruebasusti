'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/app/firebase/config'; // Importa la configuración de Firebase
import { collection, query, getDocs, onSnapshot, doc, updateDoc } from 'firebase/firestore';

function Citas() {
  const [servicios, setServicios] = useState([]);
  const [citas, setCitas] = useState([]);
  const [filteredCitas, setFilteredCitas] = useState([]);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const router = useRouter();

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

  useEffect(() => {
    const fetchCitas = async () => {
      let citasQuery;
      if (servicioSeleccionado && servicioSeleccionado !== 'todos') {
        const citasRef = collection(db, 'servicios', servicioSeleccionado, 'citas');
        citasQuery = citasRef;
      } else {
        citasQuery = collection(db, 'servicios');
      }

      const unsubscribe = onSnapshot(citasQuery, (snapshot) => {
        const citasList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCitas(citasList);
      });

      return () => unsubscribe();
    };

    fetchCitas();
  }, [servicioSeleccionado]);

  useEffect(() => {
    const filtered = estadoSeleccionado
      ? citas.filter((cita) => cita.estado === estadoSeleccionado)
      : citas;
    setFilteredCitas(filtered);
  }, [estadoSeleccionado, citas]);

  const cambiarEstado = async (id) => {
  const confirmation = window.confirm('¿Estás seguro de marcar la cita como Atendida?');
  if (!confirmation) return;

  try {
    // Determine correct document reference
    let citaDocRef;

    if (servicioSeleccionado && servicioSeleccionado !== 'todos') {
      // If citas are nested under a specific service
      citaDocRef = doc(db, 'servicios', servicioSeleccionado, 'citas', id);
    } else {
      // If citas are in a top-level collection
      citaDocRef = doc(db, 'citas', id);
    }

    console.log('Updating document at:', citaDocRef.path);

    // Update Firestore document
    await updateDoc(citaDocRef, { estado: 'Atendida' });

    alert('La cita ha sido marcada como Atendida.');
  } catch (error) {
    console.error('Error al cambiar el estado de la cita:', error);
    alert('Hubo un error al cambiar el estado de la cita.');
  }
};


  const cancelarCita = async (id) => {
    const confirmation = window.confirm('¿Estás seguro de cancelar la cita?');
    if (!confirmation) return;
  
    try {
      // Determine correct document reference
      let citaDocRef;
  
      if (servicioSeleccionado && servicioSeleccionado !== 'todos') {
        // If citas are nested under a specific service
        citaDocRef = doc(db, 'servicios', servicioSeleccionado, 'citas', id);
      } else {
        // If citas are in a top-level collection
        citaDocRef = doc(db, 'citas', id);
      }
  
      console.log('Updating document at:', citaDocRef.path);
  
      // Update Firestore document
      await updateDoc(citaDocRef, { estado: 'Cancelada' });
  
      alert('La cita ha sido cancelada.');
    } catch (error) {
      console.error('Error al cancelar la cita:', error);
      alert('Hubo un error al cancelar la cita.');
    }
  };
  

  const handleVolver = () => {
    router.push('/admin/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-0 z-20 bg-teal-900 text-white p-6 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-64`}>
        <div className="flex items-center justify-between mb-8 lg:hidden">
          <h1 className="text-lg font-bold">Susticorp</h1>
          <button onClick={() => setIsMenuOpen(false)} className="text-white">
            <span className="material-icons">close</span>
          </button>
        </div>
        <ul className="space-y-4">
          {[{ label: 'Citas', path: '/admin/citas' }, { label: 'Cotizaciones', path: '/admin/cotizaciones' }, { label: 'Añadir servicio', path: '/admin/agregarservicio' }, { label: 'Modificar servicio', path: '/admin/modificarservicio' }].map(({ label, path }) => (
            <li key={path}>
              <button onClick={() => router.push(path)} className="flex items-center space-x-2 hover:text-teal-400">
                <span>{label}</span>
              </button>
            </li>
          ))}
          <li>
            <button onClick={() => handleVolver()} className="flex items-center space-x-2 hover:text-teal-400">
              <span>Cerrar sesión</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <button className="bg-teal-800 text-white px-4 py-2 rounded" onClick={handleVolver}>
            Volver
          </button>
          <button className="bg-teal-800 text-white px-4 py-2 rounded" onClick={() => router.push('/admin/agregarcita')}>
            Agregar cita
          </button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div>
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

          <div>
            <label htmlFor="estado" className="block text-black font-semibold mb-2">
              Filtrar por estado:
            </label>
            <select
              id="estado"
              className="w-full p-2 text-gray-600 border rounded"
              value={estadoSeleccionado}
              onChange={(e) => setEstadoSeleccionado(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Cancelada">Cancelada</option>
              <option value="Atendida">Atendida</option>
            </select>
          </div>
        </div>

        <div className="flex">
          <div className="w-1/3 text-gray-600 bg-white rounded-lg shadow p-4 mr-4">
            {filteredCitas.map((cita) => (
              <div
                key={cita.id}
                className={`p-2 mb-2 cursor-pointer rounded ${citaSeleccionada?.id === cita.id ? 'bg-teal-100' : 'hover:bg-gray-100'}`}
                onClick={() => setCitaSeleccionada(cita)}
              >
                <p>{cita.fecha} {cita.hora}</p>
                <p>{cita.clienteNombre}</p>
              </div>
            ))}
          </div>

          <div className="flex-1 bg-white rounded-lg shadow p-4">
            {citaSeleccionada ? (
              <>
                <h2 className="font-bold text-black text-lg mb-4">Información:</h2>
                <p className="text-gray-600"><strong>Fecha:</strong> {citaSeleccionada.fecha}</p>
                <p className="text-gray-600"><strong>Estado:</strong> {citaSeleccionada.estado}</p>
                <p className="text-gray-600"><strong>Nombre del cliente:</strong> {citaSeleccionada.clienteNombre}</p>
                <p className="text-gray-600"><strong>Teléfono:</strong> {citaSeleccionada.telefono}</p>
                <p className="text-gray-600"><strong>Correo:</strong> {citaSeleccionada.correo}</p>
                <p className="text-gray-600"><strong>Dirección:</strong> {citaSeleccionada.direccion}</p>

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
