import { useState } from 'react';
import { addDoc, collection, getDocs, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Upload, Trash2 } from 'lucide-react';

export function ImportDataButton() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const initialData = [
    // RESERVAS
    { name: 'Jaume Rigo', zona: 'RESERVAS', gear: { Casco: '-', Chubasquero: '-', Chaqueta: '-', Guantes: '-', Riñonera: '-' } },
    { name: 'Julian Carrillo', zona: 'RESERVAS', gear: { Casco: 'SI', Chubasquero: 'SI', Chaqueta: 'SI', Guantes: 'SI', Riñonera: '-' } },
    { name: 'Gustavo Macias Mino', zona: 'RESERVAS', gear: { Casco: 'SI', Chubasquero: 'SI', Chaqueta: 'SI', Guantes: 'SI', Riñonera: '-' } },
    { name: 'Jan Ribas', zona: 'RESERVAS', gear: { Casco: 'SI', Chubasquero: 'SI', Chaqueta: 'PROPIO', Guantes: 'SI', Riñonera: '-' } },
    { name: 'Facundo Porteous', zona: 'RESERVAS', gear: { Casco: 'SI', Chubasquero: '-', Chaqueta: '-', Guantes: '-', Riñonera: '-' } },
    { name: 'Andrés Salazar', zona: 'RESERVAS', gear: { Casco: 'SI', Chubasquero: 'SI', Chaqueta: 'SI', Guantes: 'SI', Riñonera: 'SI' } },
    { name: 'Pedro García', zona: 'RESERVAS', gear: { Casco: '-', Chubasquero: '-', Chaqueta: '-', Guantes: '-', Riñonera: '-' } },
    // CAMPOS
    { name: 'Alejandro Zingariello', zona: 'CAMPOS', gear: { Casco: 'SI', Chubasquero: 'SI', Chaqueta: 'NECESITA', Guantes: 'SI', Riñonera: 'SI' } },
    { name: 'Juan Antonio Parra', zona: 'CAMPOS', gear: { Casco: 'SI', Chubasquero: 'SI', Chaqueta: 'NECESITA', Guantes: 'SI', Riñonera: 'SI' } },
    { name: 'Jesus Buitrago', zona: 'CAMPOS', gear: { Casco: 'SI', Chubasquero: 'SI', Chaqueta: 'SI', Guantes: 'SI', Riñonera: 'SI' } },
    { name: 'Tomeu Bennassar', zona: 'CAMPOS', gear: { Casco: 'SI (SIN VISERA)', Chubasquero: 'SI', Chaqueta: 'NECESITA XL', Guantes: 'NECESITA', Riñonera: 'NECESITA' } },
    { name: 'Enrique Barth', zona: 'CAMPOS', gear: { Casco: 'SI (SIN VISERA)', Chubasquero: 'SI', Chaqueta: '-', Guantes: '-', Riñonera: 'SI' } },
    { name: 'Morad', zona: 'CAMPOS', gear: { Casco: 'SI', Chubasquero: 'NECESITA', Chaqueta: 'NECESITA', Guantes: 'NECESITA', Riñonera: 'SI' } },
    { name: 'Iliass', zona: 'CAMPOS', gear: { Casco: 'SI', Chubasquero: 'SI', Chaqueta: 'NECESITA', Guantes: 'SI', Riñonera: 'SI' } },
    { name: 'Ruben Jimenez', zona: 'CAMPOS', gear: { Casco: 'PROPIO', Chubasquero: 'SI', Chaqueta: '-', Guantes: 'PROPIO', Riñonera: 'SI' } },
    // LLUCMAJOR
    { name: 'Toni Almagro', zona: 'LLUCMAJOR', gear: { Casco: 'SI', Chubasquero: 'SI', Chaqueta: 'SI', Guantes: 'SI', Riñonera: 'SI' } },
    { name: 'Daniel Maimo', zona: 'LLUCMAJOR', gear: { Casco: 'PROPIO', Chubasquero: 'SI', Chaqueta: 'NECESITA XL', Guantes: 'NECESITA', Riñonera: 'SI' } },
    { name: 'Jesús Fernández', zona: 'LLUCMAJOR', gear: { Casco: 'SI', Chubasquero: 'SI', Chaqueta: 'NECESITA XL', Guantes: 'SI', Riñonera: 'SI' } },
    { name: 'Oscar Sanfelix', zona: 'LLUCMAJOR', gear: { Casco: '-', Chubasquero: 'SI', Chaqueta: 'SI', Guantes: '-', Riñonera: 'SI' } },
    { name: 'Rafael Gonzalez', zona: 'LLUCMAJOR', gear: { Casco: '-', Chubasquero: 'SI', Chaqueta: '-', Guantes: '-', Riñonera: 'SI' } },
    // SANTANYÍ
    { name: 'Amadeo', zona: 'SANTANYÍ', gear: { Casco: 'SI', Chubasquero: 'SI', Chaqueta: 'SI', Guantes: 'PROPIO', Riñonera: 'SI' } },
    { name: 'Alex', zona: 'SANTANYÍ', gear: { Casco: 'PROPIO', Chubasquero: 'SI', Chaqueta: 'SI', Guantes: 'NECESITA', Riñonera: 'SI' } },
  ];

  const handleImport = async () => {
    setLoading(true);
    try {
      // 1. Get or create materials
      const materialTypes = ['Casco', 'Chubasquero', 'Chaqueta', 'Guantes', 'Riñonera'];
      const matSnapshot = await getDocs(collection(db, 'materiales'));
      const existingMats = matSnapshot.docs.reduce((acc, doc) => {
        acc[doc.data().nombre_material] = { id: doc.id, ...doc.data() };
        return acc;
      }, {} as Record<string, any>);

      const matLookup: Record<string, any> = {};

      for (const t of materialTypes) {
        if (!existingMats[t]) {
          const newDoc = await addDoc(collection(db, 'materiales'), {
            nombre_material: t,
            categoria: 'Protección',
            requiere_devolucion: 1,
            valor_reposicion: 0,
            stock_total: 100, // Giving some buffer
            stock_disponible: 100,
            stock_asignado: 0,
            estado: 'Disponible',
            fecha_creacion: serverTimestamp(),
            fecha_actualizacion: serverTimestamp()
          });
          matLookup[t] = { id: newDoc.id, stock_disponible: 100, stock_asignado: 0, refs_to_update: 0 };
        } else {
          matLookup[t] = { ...existingMats[t], refs_to_update: 0 };
        }
      }

      // 2. Process Repartidores
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

        // Parse gear to items
        const assignedMaterials: any[] = [];
        const notas: string[] = [];

        Object.entries(item.gear).forEach(([type, value]) => {
          const val = value.toUpperCase();
          if (val && val !== '-') {
             if (val.includes('SI')) {
                let note = '';
                if (val !== 'SI') note = ` (${val})`;
                
                assignedMaterials.push({
                   id_material: matLookup[type].id,
                   nombre_material: type,
                   cantidad: 1,
                   nota: note
                });
                matLookup[type].refs_to_update += 1;
             } else {
                notas.push(`${type}: ${val}`); // PROPIO o NECESITA
             }
          }
        });

        const observacionesFinales = notas.length > 0 ? `Pendiente/Info: ${notas.join(', ')}` : '';

        // Create Entrega to store Gear details
        await addDoc(collection(db, 'entregas'), {
          id_repartidor: repRef.id,
          nombre,
          apellidos,
          estado_entrega: 'Activa',
          entregado_por: 'Sistema Carga Inicial',
          observaciones: observacionesFinales,
          materiales: assignedMaterials,
          fecha_entrega: new Date().toISOString(),
          fecha_creacion: serverTimestamp(),
        });
      }

      // 3. Update Material stock assigned
      for (const t of materialTypes) {
         if (matLookup[t].refs_to_update > 0) {
            await updateDoc(doc(db, 'materiales', matLookup[t].id), {
               stock_asignado: matLookup[t].stock_asignado + matLookup[t].refs_to_update,
               stock_disponible: Math.max(0, matLookup[t].stock_disponible - matLookup[t].refs_to_update),
               fecha_actualizacion: serverTimestamp()
            });
         }
      }

      setDone(true);
    } catch (e) {
      console.error(e);
      alert('Error en importación');
    }
    setLoading(false);
  };

  const handleClean = async () => {
    if (!window.confirm("¿Seguro que deseas BORRAR TODOS LOS DATOS (Repartidores, Materiales, Entregas, Incidencias)? Esto no se puede deshacer.")) return;
    setLoading(true);
    try {
      const collectionsToClean = ['repartidores', 'materiales', 'entregas', 'incidencias'];
      for (const coll of collectionsToClean) {
        const snap = await getDocs(collection(db, coll));
        for (const docSnap of snap.docs) {
          await deleteDoc(doc(db, coll, docSnap.id));
        }
      }
      alert('Base de datos limpiada correctamente.');
    } catch (e) {
      console.error(e);
      alert('Error al limpiar la base de datos');
    }
    setLoading(false);
  };

  if (done) return null;

  return (
    <div className="flex gap-2">
      <button 
        onClick={handleClean}
        disabled={loading}
        className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition"
      >
        <Trash2 className="w-5 h-5" />
        {loading ? 'Borrando...' : 'Limpiar Todo'}
      </button>
      <button 
        onClick={handleImport}
        disabled={loading}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        <Upload className="w-5 h-5" />
        {loading ? 'Importando...' : 'Importar Datos'}
      </button>
    </div>
  );
}
