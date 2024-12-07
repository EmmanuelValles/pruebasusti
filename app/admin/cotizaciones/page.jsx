'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/app/firebase/config';
import { collection, getDocs, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import Navbar from '@/app/components/navbar';
import withAuth from '@/app/hoc/withAuth';

function Cotizaciones() {
  const [servicios, setServicios] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [filteredCotizaciones, setFilteredCotizaciones] = useState([]);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [costoEstimado, setCostoEstimado] = useState('');

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
    const fetchCotizaciones = async () => {
      let cotizacionesQuery;
      if (servicioSeleccionado && servicioSeleccionado !== 'todos') {
        const cotizacionesRef = collection(db, 'servicios', servicioSeleccionado, 'cotizaciones');
        cotizacionesQuery = cotizacionesRef;
      } else {
        cotizacionesQuery = collection(db, 'servicios');
      }

      const unsubscribe = onSnapshot(cotizacionesQuery, (snapshot) => {
        const cotizacionesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCotizaciones(cotizacionesList);
      });

      return () => unsubscribe();
    };

    fetchCotizaciones();
  }, [servicioSeleccionado]);

  useEffect(() => {
    const filtered = cotizaciones.filter((cotizacion) => {
      const matchesEstado = estadoSeleccionado ? cotizacion.estado === estadoSeleccionado : true;
      const matchesSearch = searchTerm ? cotizacion.telefono?.toString().includes(searchTerm) : true;
      return matchesEstado && matchesSearch;
    });
    setFilteredCotizaciones(filtered);
  }, [estadoSeleccionado, cotizaciones, searchTerm]);

  const agregarEstimado = async () => {
    if (!costoEstimado || isNaN(costoEstimado)) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, ingresa un costo válido.',
        icon: 'error',
      });
      return;
    }

    try {
      const cotizacionDocRef = doc(
        db,
        'servicios',
        servicioSeleccionado,
        'cotizaciones',
        cotizacionSeleccionada.id
      );
      await updateDoc(cotizacionDocRef, { costoEstimado });

      Swal.fire({
        title: 'Éxito',
        text: 'El costo estimado ha sido agregado.',
        icon: 'success',
      });
      setIsModalOpen(false);
      setCostoEstimado('');
    } catch (error) {
      console.error('Error al agregar el costo estimado:', error);
      Swal.fire({
        title: 'Error',
        text: 'Hubo un error al agregar el costo estimado.',
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
          <h1 className="text-2xl font-bold">Cotizaciones</h1>
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
            onClick={() => router.push('/admin/agregarcotizacion')}
          >
            Agregar cotización
          </button>
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center mb-4 space-x-4">
          <div className="flex-1">
            <label htmlFor="servicios" className="block text-black font-semibold mb-2">
              Filtrar por servicio:
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
              Buscar por número de teléfono:
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

        {/* Cotizaciones List */}
        <div className="flex">
          <div className="w-1/3 text-gray-600 bg-white rounded-lg shadow p-4 mr-4">
            {filteredCotizaciones.map((cotizacion) => (
              <div
                key={cotizacion.id}
                className={`p-2 mb-2 cursor-pointer rounded ${
                  cotizacionSeleccionada?.id === cotizacion.id
                    ? 'bg-teal-100'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setCotizacionSeleccionada(cotizacion)}
              >
                <p>{cotizacion.fecha} {cotizacion.hora}</p>
                <p>{cotizacion.clienteNombre}</p>
                <p><strong>Número:</strong> {cotizacion.telefono}</p>
              </div>
            ))}
          </div>

          <div className="flex-1 bg-white rounded-lg shadow p-4">
            {cotizacionSeleccionada ? (
              <>
                <h2 className="font-bold text-black text-lg mb-4">Información:</h2>
                <p className="text-gray-600"><strong>Cliente:</strong> {cotizacionSeleccionada.clienteNombre}</p>
                <p className="text-gray-600"><strong>Teléfono:</strong> {cotizacionSeleccionada.telefono}</p>
                <p className="text-gray-600"><strong>Correo:</strong> {cotizacionSeleccionada.correo}</p>
                <p className="text-gray-600"><strong>Fecha de solicitud:</strong> {cotizacionSeleccionada.fechaSolicitud}</p>
                <p className="text-gray-600"><strong>Descripcion:</strong> {cotizacionSeleccionada.descripcion}</p>
                <p className="text-gray-600"><strong>Estado:</strong> {cotizacionSeleccionada.estado}</p>
                <p className="text-gray-600"><strong>Costo Estimado:</strong> {cotizacionSeleccionada.costoEstimado || 'No especificado'}</p>

                {/* Actions */}
                <div className="mt-4 flex space-x-4">
                  <button
                    className="bg-teal-800 text-white px-4 py-2 rounded"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Agregar estimado
                  </button>
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded"
                    onClick={() => cancelarCotizacion(cotizacionSeleccionada.id)}
                  >
                    Cancelar Cotización
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-600">Selecciona una cotización para ver detalles</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-black text-lg font-bold mb-4">Agregar costo estimado</h2>
            <input
              type="number"
              placeholder="Ingresa el costo estimado"
              value={costoEstimado}
              onChange={(e) => setCostoEstimado(e.target.value)}
              className="w-full text-gray-600 p-2 border rounded mb-4"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={agregarEstimado}
                className="bg-teal-800 text-white px-4 py-2 rounded"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(Cotizaciones);
