import { useEffect, useState } from 'react';
import { ClipboardList, Plus, X } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { getEmojiForName } from '../lib/emojis';

export function Entregas() {
  const { user } = useAuthStore();
  const [entregas, setEntregas] = useState<any[]>([]);
  const [repartidores, setRepartidores] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterZona, setFilterZona] = useState<string>('Todas');
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

      <div className="flex bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <label className="flex items-center gap-3 text-sm font-medium text-slate-700 w-full sm:w-auto">
          Filtrar por Zona:
          <select 
            value={filterZona} 
            onChange={(e) => setFilterZona(e.target.value)}
            className="flex-1 sm:w-64 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="Todas">Todas las Zonas</option>
            {Array.from(new Set(repartidores.map(r => r.zona).filter(Boolean))).sort().map(z => (
              <option key={String(z)} value={String(z)}>{String(z)}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
              <th className="p-4">Fecha</th>
              <th className="p-4">Repartidor</th>
              <th className="p-4">Zona</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Responsable</th>
              <th className="p-4">Detalles / Materiales</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {entregas
              .filter(e => {
                const rep = repartidores.find(r => r.id === (e.id_repartidor || r.id_repartidor));
                const zona = rep ? rep.zona : e.zona || '';
                return filterZona === 'Todas' || zona === filterZona;
              })
              .map(e => {
                const rep = repartidores.find(r => r.id === (e.id_repartidor || r.id_repartidor));
                const zona = rep ? rep.zona : e.zona || '';
                return (
              <tr key={e.id_entrega} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-slate-900 font-medium">{new Date(e.fecha_entrega).toLocaleDateString()}</td>
                <td className="p-4 text-slate-600 flex items-center gap-2">
                  <span className="text-lg" title={e.nombre}>{getEmojiForName(e.nombre)}</span>
                  {e.nombre} {e.apellidos}
                </td>
                <td className="p-4 text-slate-600">{zona}</td>
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
                <td className="p-4 text-slate-600">
                  <div className="flex flex-col gap-2 max-w-sm">
                    {e.materiales?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 min-w-0">
                        {e.materiales.map((m: any, idx: number) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 shadow-sm truncate">
                            <span className="font-bold mr-1 shrink-0">{m.cantidad}x</span> 
                            <span className="truncate">{m.nombre_material}</span>
                            {m.nota && <span className="ml-1 text-slate-500 italic shrink-0" title={m.nota}>({m.nota})</span>}
                          </span>
                        ))}
                      </div>
                    )}
                    {e.observaciones && (
                      <div className="text-sm text-slate-500 mt-1 whitespace-pre-wrap border-l-2 border-slate-300 pl-3 py-1 bg-slate-50/50 rounded-r-lg">
                        {e.observaciones}
                      </div>
                    )}
                    {!e.materiales?.length && !e.observaciones && '-'}
                  </div>
                </td>
              </tr>
            );
            })}
            {entregas.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 flex flex-col items-center">
                  <ClipboardList className="w-8 h-8 text-slate-300 mb-2" />
                  No hay entregas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {entregas
          .filter(e => {
            const rep = repartidores.find(r => r.id === (e.id_repartidor || r.id_repartidor));
            const zona = rep ? rep.zona : e.zona || '';
            return filterZona === 'Todas' || zona === filterZona;
          })
          .map(e => {
            const rep = repartidores.find(r => r.id === (e.id_repartidor || r.id_repartidor));
            const zona = rep ? rep.zona : e.zona || '';
            return (
          <div key={e.id_entrega} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 text-2xl shadow-sm">
                  {getEmojiForName(e.nombre)}
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
            {(e.observaciones || e.materiales?.length > 0) && (
              <div className="text-sm text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-lg flex flex-col gap-2">
                {e.materiales?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {e.materiales.map((m: any, idx: number) => (
                      <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white text-slate-700 border border-slate-200 shadow-sm">
                        <span className="font-bold mr-1">{m.cantidad}x</span> 
                        {m.nombre_material}
                        {m.nota && <span className="ml-1 text-slate-500">{m.nota}</span>}
                      </span>
                    ))}
                  </div>
                )}
                {e.observaciones && (
                  <div className="text-slate-500 whitespace-pre-wrap mt-1">
                    {e.observaciones}
                  </div>
                )}
              </div>
            )}
          </div>
        )})}
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
