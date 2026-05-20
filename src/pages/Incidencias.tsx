import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function Incidencias() {
  const [incidencias, setIncidencias] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'incidencias'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id_incidencia: doc.id,
        ...doc.data()
      }));
      setIncidencias(data);
    });
    return () => unsub();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Incidencias</h1>
          <p className="text-slate-500 max-w-sm">Gestión de problemas con materiales (pérdidas, daños, etc.).</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
              <th className="p-4">Fecha</th>
              <th className="p-4">Repartidor</th>
              <th className="p-4">Material</th>
              <th className="p-4">Tipo</th>
              <th className="p-4">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {incidencias.map(i => (
              <tr key={i.id_incidencia} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-slate-900 font-medium">{new Date(i.fecha_incidencia).toLocaleDateString()}</td>
                <td className="p-4 text-slate-600">{i.nombre ? `${i.nombre} ${i.apellidos}` : 'N/A'}</td>
                <td className="p-4 text-slate-600">{i.nombre_material || 'N/A'}</td>
                <td className="p-4 text-slate-600">{i.tipo_incidencia}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    i.estado_incidencia === 'Abierta' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {i.estado_incidencia}
                  </span>
                </td>
              </tr>
            ))}
            {incidencias.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 flex flex-col items-center">
                  <AlertTriangle className="w-8 h-8 text-slate-300 mb-2" />
                  No hay incidencias registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
