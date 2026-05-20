import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Upload } from 'lucide-react';

export function ImportDataButton() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const initialData = [
    // RESERVAS
    { name: 'Jaume Rigo', zona: 'RESERVAS', gear: 'Casco: -, Chubasquero: -, Chaqueta: -, Guantes: -, Riñonera: -' },
    { name: 'Julian Carrillo', zona: 'RESERVAS', gear: 'Casco: SI, Chubasquero: SI, Chaqueta: SI, Guantes: SI, Riñonera: -' },
    { name: 'Gustavo Macias Mino', zona: 'RESERVAS', gear: 'Casco: SI, Chubasquero: SI, Chaqueta: SI, Guantes: SI, Riñonera: -' },
    { name: 'Jan Ribas', zona: 'RESERVAS', gear: 'Casco: SI, Chubasquero: SI, Chaqueta: PROPIO, Guantes: SI, Riñonera: -' },
    { name: 'Facundo Porteous', zona: 'RESERVAS', gear: 'Casco: SI, Chubasquero: -, Chaqueta: -, Guantes: -, Riñonera: -' },
    { name: 'Andrés Salazar', zona: 'RESERVAS', gear: 'Casco: SI, Chubasquero: SI, Chaqueta: SI, Guantes: SI, Riñonera: SI' },
    { name: 'Pedro García', zona: 'RESERVAS', gear: 'Casco: -, Chubasquero: -, Chaqueta: -, Guantes: -, Riñonera: -' },
    // CAMPOS
    { name: 'Alejandro Zingariello', zona: 'CAMPOS', gear: 'Casco: SI, Chubasquero: SI, Chaqueta: NECESITA, Guantes: SI, Riñonera: SI' },
    { name: 'Juan Antonio Parra', zona: 'CAMPOS', gear: 'Casco: SI, Chubasquero: SI, Chaqueta: NECESITA, Guantes: SI, Riñonera: SI' },
    { name: 'Jesus Buitrago', zona: 'CAMPOS', gear: 'Casco: SI, Chubasquero: SI, Chaqueta: SI, Guantes: SI, Riñonera: SI' },
    { name: 'Tomeu Bennassar', zona: 'CAMPOS', gear: 'Casco: SI (SIN VISERA), Chubasquero: SI, Chaqueta: NECESITA XL, Guantes: NECESITA, Riñonera: NECESITA' },
    { name: 'Enrique Barth', zona: 'CAMPOS', gear: 'Casco: SI (SIN VISERA), Chubasquero: SI, Chaqueta: -, Guantes: -, Riñonera: SI' },
    { name: 'Morad', zona: 'CAMPOS', gear: 'Casco: SI, Chubasquero: NECESITA, Chaqueta: NECESITA, Guantes: NECESITA, Riñonera: SI' },
    { name: 'Iliass', zona: 'CAMPOS', gear: 'Casco: SI, Chubasquero: SI, Chaqueta: NECESITA, Guantes: SI, Riñonera: SI' },
    { name: 'Ruben Jimenez', zona: 'CAMPOS', gear: 'Casco: PROPIO, Chubasquero: SI, Chaqueta: -, Guantes: PROPIO, Riñonera: SI' },
    // LLUCMAJOR
    { name: 'Toni Almagro', zona: 'LLUCMAJOR', gear: 'Casco: SI, Chubasquero: SI, Chaqueta: SI, Guantes: SI, Riñonera: SI' },
    { name: 'Daniel Maimo', zona: 'LLUCMAJOR', gear: 'Casco: PROPIO, Chubasquero: SI, Chaqueta: NECESITA XL, Guantes: NECESITA, Riñonera: SI' },
    { name: 'Jesús Fernández', zona: 'LLUCMAJOR', gear: 'Casco: SI, Chubasquero: SI, Chaqueta: NECESITA XL, Guantes: SI, Riñonera: SI' },
    { name: 'Oscar Sanfelix', zona: 'LLUCMAJOR', gear: 'Casco: -, Chubasquero: SI, Chaqueta: SI, Guantes: -, Riñonera: SI' },
    { name: 'Rafael Gonzalez', zona: 'LLUCMAJOR', gear: 'Casco: -, Chubasquero: SI, Chaqueta: -, Guantes: -, Riñonera: SI' },
    // SANTANYÍ
    { name: 'Amadeo', zona: 'SANTANYÍ', gear: 'Casco: SI, Chubasquero: SI, Chaqueta: SI, Guantes: PROPIO, Riñonera: SI' },
    { name: 'Alex', zona: 'SANTANYÍ', gear: 'Casco: PROPIO, Chubasquero: SI, Chaqueta: SI, Guantes: NECESITA, Riñonera: SI' },
  ];

  const handleImport = async () => {
    setLoading(true);
    try {
      for (const item of initialData) {
        const parts = item.name.split(' ');
        const nombre = parts[0];
        const apellidos = parts.slice(1).join(' ');

        // Create Repartidor
        const repRef = await addDoc(collection(db, 'repartidores'), {
          nombre,
          apellidos,
          zona: item.zona,
          dni_nie: '-',
          telefono: '-',
          email: '',
          estado: 'Activo',
          fecha_creacion: serverTimestamp(),
          fecha_actualizacion: serverTimestamp(),
        });

        // Create Entrega to store Gear details
        await addDoc(collection(db, 'entregas'), {
          id_repartidor: repRef.id,
          nombre,
          apellidos,
          estado_entrega: 'Activa',
          entregado_por: 'Sistema Carga Inicial',
          observaciones: `Datos de equipamiento inicial:\n${item.gear}`,
          fecha_entrega: new Date().toISOString(),
          fecha_creacion: serverTimestamp(),
        });
      }
      setDone(true);
    } catch (e) {
      console.error(e);
      alert('Error en importación');
    }
    setLoading(false);
  };

  if (done) return null;

  return (
    <button 
      onClick={handleImport}
      disabled={loading}
      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
    >
      <Upload className="w-5 h-5" />
      {loading ? 'Importando...' : 'Importar Datos (Lista enviada)'}
    </button>
  );
}
