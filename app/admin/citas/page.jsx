'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/app/firebase/config';
import { collection, getDocs, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import Navbar from '@/app/components/navbar';
import withAuth from '@/app/hoc/withAuth';

function Citas() {
  const [servicios, setServicios] = useState([]);
  const [citas, setCitas] = useState([]);
  const [filteredCitas, setFilteredCitas] = useState([]);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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
    const filtered = citas.filter((cita) => {
      const matchesEstado = estadoSeleccionado ? cita.estado === estadoSeleccionado : true;
      const matchesSearch = searchTerm ? cita.telefono?.toString().includes(searchTerm) : true;
      return matchesEstado && matchesSearch;
    });
    setFilteredCitas(filtered);
  }, [estadoSeleccionado, citas, searchTerm]);

  const cambiarEstado = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción marcará la cita como Atendida.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, marcar como Atendida',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      let citaDocRef;

      if (servicioSeleccionado && servicioSeleccionado !== 'todos') {
        citaDocRef = doc(db, 'servicios', servicioSeleccionado, 'citas', id);
      } else {
        citaDocRef = doc(db, 'citas', id);
      }

      await updateDoc(citaDocRef, { estado: 'Atendida' });

      Swal.fire({
        title: 'Éxito',
        text: 'La cita ha sido marcada como Atendida.',
        icon: 'success',
      });
    } catch (error) {
      console.error('Error al cambiar el estado de la cita:', error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un error al cambiar el estado de la cita.',
        icon: 'error',
      });
    }
  };

  const cancelarCita = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción cancelará la cita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar la cita',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      let citaDocRef;

      if (servicioSeleccionado && servicioSeleccionado !== 'todos') {
        citaDocRef = doc(db, 'servicios', servicioSeleccionado, 'citas', id);
      } else {
        citaDocRef = doc(db, 'citas', id);
      }

      await updateDoc(citaDocRef, { estado: 'Cancelada' });

      Swal.fire({
        title: 'Éxito',
        text: 'La cita ha sido cancelada.',
        icon: 'success',
      });
    } catch (error) {
      console.error('Error al cancelar la cita:', error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un error al cancelar la cita.',
        icon: 'error',
      });
    }
  };

  const handleVolver = () => {
    router.push('/admin/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <header className="flex items-center justify-between mb-8 lg:hidden">
          <h1 className="text-2xl font-bold">Citas</h1>
          <button onClick={() => setIsMenuOpen(true)} className="text-gray-800">
            <span className="material-icons">menu</span>
          </button>
        </header>

        {/* Buttons */}
        <div className="flex justify-between mb-4">
          <button className="bg-teal-800 text-white px-4 py-2 rounded" onClick={handleVolver}>
            Volver
          </button>
          <button
            className="bg-teal-800 text-white px-4 py-2 rounded"
            onClick={() => router.push('/admin/agregarcita')}
          >
            Agregar cita
          </button>
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center mb-4 space-x-4">
          <div className="flex-1">
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

          <div className="flex-1">
            <label htmlFor="search" className="block text-black font-semibold mb-2">
              Buscar por número de telefono:
            </label>
            <input
              id="search"
              type="text"
              className="w-full p-2 text-gray-600 border rounded"
              placeholder="Ingresa el número"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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

        {/* Appointments List */}
        <div className="flex">
          <div className="w-1/3 text-gray-600 bg-white rounded-lg shadow p-4 mr-4">
            {filteredCitas.map((cita) => (
              <div
                key={cita.id}
                className={`p-2 mb-2 cursor-pointer rounded ${
                  citaSeleccionada?.id === cita.id ? 'bg-teal-100' : 'hover:bg-gray-100'
                }`}
                onClick={() => setCitaSeleccionada(cita)}
              >
                <p>{cita.fecha} {cita.hora}</p>
                <p>{cita.clienteNombre}</p>
                <p><strong>Número:</strong> {cita.telefono}</p>
              </div>
            ))}
          </div>

          <div className="flex-1 bg-white rounded-lg shadow p-4">
            {citaSeleccionada ? (
              <>
                <h2 className="font-bold text-black text-lg mb-4">Información:</h2>
                <p className="text-gray-600"><strong>Fecha:</strong> {citaSeleccionada.fecha}</p>
                <p className="text-gray-600"><strong>Hora:</strong> {citaSeleccionada.hora}</p>
                <p className="text-gray-600"><strong>Cliente:</strong> {citaSeleccionada.clienteNombre}</p>
                <p className="text-gray-600"><strong>Telefono:</strong> {citaSeleccionada.telefono}</p>
                <p className="text-gray-600"><strong>Correo:</strong> {citaSeleccionada.correo}</p>
                <p className="text-gray-600"><strong>Estado:</strong> {citaSeleccionada.estado}</p>

                {/* Actions */}
                <div className="mt-4 flex space-x-4">
                  <button
                    className="bg-teal-800 text-white px-4 py-2 rounded"
                    onClick={() => cambiarEstado(citaSeleccionada.id)}
                  >
                    Marcar como Atendida
                  </button>
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded"
                    onClick={() => cancelarCita(citaSeleccionada.id)}
                  >
                    Cancelar Cita
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-600">Selecciona una cita para ver detalles</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(Citas);
