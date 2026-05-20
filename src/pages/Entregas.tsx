import { useEffect, useState } from 'react';
import { ClipboardList, Plus } from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function Entregas() {
  const [entregas, setEntregas] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'entregas'), orderBy('fecha_entrega', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id_entrega: doc.id,
        ...doc.data()
      }));
      setEntregas(data);
    });
    return () => unsub();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Entregas y Devoluciones</h1>
          <p className="text-slate-500 max-w-sm">Gestión de asignación y recuperación de equipos.</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-900 text-white w-full sm:w-auto justify-center px-4 py-2 rounded-lg hover:bg-slate-800">
          <Plus className="w-5 h-5" /> Nueva Entrega
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
              <th className="p-4">Fecha</th>
              <th className="p-4">Repartidor</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Responsable</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {entregas.map(e => (
              <tr key={e.id_entrega} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-slate-900 font-medium">{new Date(e.fecha_entrega).toLocaleDateString()}</td>
                <td className="p-4 text-slate-600">{e.nombre} {e.apellidos}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    e.estado_entrega === 'Activa' ? 'bg-blue-100 text-blue-700' : 
                    e.estado_entrega === 'Cerrada' ? 'bg-green-100 text-green-700' : 
                    e.estado_entrega === 'Con incidencia' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {e.estado_entrega}
                  </span>
                </td>
                <td className="p-4 text-slate-600">{e.entregado_por}</td>
              </tr>
            ))}
            {entregas.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500 flex flex-col items-center">
                  <ClipboardList className="w-8 h-8 text-slate-300 mb-2" />
                  No hay entregas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
