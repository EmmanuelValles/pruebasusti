'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/app/firebase/config'; // Importa la configuración de Firebase
import { collection, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import Navbar from '@/app/components/navbar'
import withAuth from '@/app/hoc/withAuth';


function AgregarCotizacion() {
  const [servicios, setServicios] = useState([]); // Lista de servicios disponibles
  const [formData, setFormData] = useState({
    clienteNombre: '',
    correo: '',
    direccion: '',
    estado: 'Pendiente', // Estado inicial de la cotización
    fechaSolicitud: '',
    servicio: '', // ID del servicio
    descripcion: '',
    telefono: '',
    costoEstimado: '', // Nuevo campo de costo estimado
  });
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  // Agregar cotización a Firestore
  const agregarCotizacion = async () => {
    const { clienteNombre, correo, direccion, estatus, fechaSolicitud, servicio, descripcion, telefono, costoEstimado } = formData;

    if (!clienteNombre || !correo || !direccion || !fechaSolicitud || !servicio || !descripcion || !telefono || !costoEstimado) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    try {
      // Primero, obtener el nombre del servicio a partir de su ID
      const servicioRef = doc(db, 'servicios', servicio);
      const servicioSnapshot = await getDoc(servicioRef); // Usamos getDoc()

      if (!servicioSnapshot.exists()) {
        alert('Servicio no encontrado.');
        return;
      }

      const nombreServicio = servicioSnapshot.data().nombre;

      // Luego, guardar la cotización con el nombre del servicio y costo estimado
      const cotizacionesCollectionRef = collection(servicioRef, 'cotizaciones'); // Subcolección "cotizaciones"

      await addDoc(cotizacionesCollectionRef, {
        clienteNombre,
        correo,
        direccion,
        estado,
        fechaSolicitud,
        servicio: nombreServicio, // Guardamos el nombre del servicio
        descripcion,
        telefono,
        costoEstimado, // Guardamos el costo estimado
      });

      alert('Cotización agregada correctamente.');
      router.push('/admin/cotizaciones'); // Redirigir a la página de cotizaciones
    } catch (error) {
      console.error('Error al agregar la cotización:', error);
      alert('Ocurrió un error al agregar la cotización.');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 lg:hidden">
          <h1 className="text-2xl font-bold text-black">Agregar cotización</h1>
          <button onClick={() => setIsMenuOpen(true)} className="text-gray-800">
            <span className="material-icons">menu</span>
          </button>
        </header>

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-bold text-gray-600 text-lg mb-4">Información de la cotización:</h2>

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

            {/* Fecha de solicitud */}
            <div>
              <label className="block text-gray-600 font-semibold mb-2">Fecha de solicitud:</label>
              <input
                type="date"
                name="fechaSolicitud"
                value={formData.fechaSolicitud}
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

            {/* Descripción */}
            <div>
              <label className="block text-gray-600 font-semibold mb-2">Descripción:</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className="w-full p-2 text-gray-600 border rounded"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-gray-600 font-semibold mb-2">Teléfono:</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full p-2 text-gray-600 border rounded"
              />
            </div>

            {/* Costo estimado */}
            <div>
              <label className="block text-gray-600 font-semibold mb-2">Costo estimado:</label>
              <input
                type="text"
                name="costoEstimado"
                value={formData.costoEstimado}
                onChange={handleChange}
                className="w-full p-2 text-gray-600 border rounded"
              />
            </div>
          </div>

          {/* Botón para agregar cotización */}
          <div className="mt-6">
            <button
              className="bg-teal-800 text-white px-4 py-2 rounded w-full"
              onClick={agregarCotizacion}
            >
              Agregar cotización
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(AgregarCotizacion);
