import { useEffect, useState } from 'react';
import { ClipboardList, Plus, X } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';

export function Entregas() {
  const { user } = useAuthStore();
  const [entregas, setEntregas] = useState<any[]>([]);
  const [repartidores, setRepartidores] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id_repartidor: '',
    estado_entrega: 'Activa',
    observaciones: ''
  });

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

  useEffect(() => {
    const unsubRepartidores = onSnapshot(collection(db, 'repartidores'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRepartidores(data);
    });
    return () => unsubRepartidores();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const repartidor = repartidores.find(r => r.id === formData.id_repartidor);
      
      await addDoc(collection(db, 'entregas'), {
        id_repartidor: formData.id_repartidor,
        nombre: repartidor?.nombre || '',
        apellidos: repartidor?.apellidos || '',
        estado_entrega: formData.estado_entrega,
        observaciones: formData.observaciones,
        entregado_por: user?.email || 'admin',
        fecha_entrega: new Date().toISOString(),
        fecha_creacion: serverTimestamp(),
      });
      setIsModalOpen(false);
      setFormData({
        id_repartidor: '',
        estado_entrega: 'Activa',
        observaciones: ''
      });
    } catch (err) {
      console.error(err);
      alert('Error creando entrega');
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Entregas y Devoluciones</h1>
          <p className="text-slate-500 max-w-sm">Gestión de asignación y recuperación de equipos.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900 text-white w-full sm:w-auto justify-center px-4 py-2 rounded-lg hover:bg-slate-800"
        >
          <Plus className="w-5 h-5" /> Nueva Entrega
        </button>
      </div>

      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse whitespace-nowrap">
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

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {entregas.map(e => (
          <div key={e.id_entrega} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{e.nombre} {e.apellidos}</p>
                  <p className="text-xs text-slate-500">{new Date(e.fecha_entrega).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${
                e.estado_entrega === 'Activa' ? 'bg-blue-100 text-blue-700' : 
                e.estado_entrega === 'Cerrada' ? 'bg-green-100 text-green-700' : 
                e.estado_entrega === 'Con incidencia' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {e.estado_entrega}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-100">
              <div className="text-sm text-slate-600">
                <span className="font-medium text-slate-500">Resp:</span> {e.entregado_por}
              </div>
            </div>
          </div>
        ))}
        {entregas.length === 0 && (
          <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200 flex flex-col items-center">
            <ClipboardList className="w-8 h-8 text-slate-300 mb-2" />
            No hay entregas registradas.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-xl font-bold text-slate-900">Registrar Entrega</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Repartidor</label>
                <select 
                  value={formData.id_repartidor}
                  onChange={e => setFormData({...formData, id_repartidor: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="" disabled>Seleccione un repartidor</option>
                  {repartidores.map(r => (
                    <option key={r.id} value={r.id}>{r.nombre} {r.apellidos} - {r.dni_nie}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                <select 
                  value={formData.estado_entrega}
                  onChange={e => setFormData({...formData, estado_entrega: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Activa">Activa</option>
                  <option value="Cerrada">Cerrada</option>
                  <option value="Con incidencia">Con incidencia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
                <textarea 
                  value={formData.observaciones}
                  onChange={e => setFormData({...formData, observaciones: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]" 
                  placeholder="Detalles de la entrega..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Crear Entrega
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
