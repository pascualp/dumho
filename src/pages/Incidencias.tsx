import { useEffect, useState } from 'react';
import { AlertTriangle, Plus, X } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';

export function Incidencias() {
  const { user } = useAuthStore();
  const [incidencias, setIncidencias] = useState<any[]>([]);
  const [repartidores, setRepartidores] = useState<any[]>([]);
  const [materiales, setMateriales] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    id_repartidor: '',
    id_material: '',
    tipo_incidencia: 'Daño',
    estado_incidencia: 'Abierta',
    observaciones: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'incidencias'), orderBy('fecha_incidencia', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id_incidencia: doc.id,
        ...doc.data()
      }));
      setIncidencias(data);
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
    const unsubMateriales = onSnapshot(collection(db, 'materiales'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMateriales(data);
    });
    return () => {
      unsubRepartidores();
      unsubMateriales();
    }
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const repartidor = repartidores.find(r => r.id === formData.id_repartidor);
      const material = materiales.find(m => m.id === formData.id_material);
      
      await addDoc(collection(db, 'incidencias'), {
        id_repartidor: formData.id_repartidor,
        nombre: repartidor?.nombre || '',
        apellidos: repartidor?.apellidos || '',
        id_material: formData.id_material,
        nombre_material: material?.nombre_material || '',
        tipo_incidencia: formData.tipo_incidencia,
        estado_incidencia: formData.estado_incidencia,
        observaciones: formData.observaciones,
        reportado_por: user?.email || 'admin',
        fecha_incidencia: new Date().toISOString(),
        fecha_creacion: serverTimestamp(),
      });
      setIsModalOpen(false);
      setFormData({
        id_repartidor: '',
        id_material: '',
        tipo_incidencia: 'Daño',
        estado_incidencia: 'Abierta',
        observaciones: ''
      });
    } catch (err) {
      console.error(err);
      alert('Error creando incidencia');
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Incidencias</h1>
          <p className="text-slate-500 max-w-sm">Gestión de problemas con materiales (pérdidas, daños, etc.).</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900 text-white w-full sm:w-auto justify-center px-4 py-2 rounded-lg hover:bg-slate-800"
        >
          <Plus className="w-5 h-5" /> Nueva Incidencia
        </button>
      </div>

      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse whitespace-nowrap">
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
                <td className="p-4 text-slate-900 font-medium">{i.fecha_incidencia ? new Date(i.fecha_incidencia).toLocaleDateString() : 'N/A'}</td>
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

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {incidencias.map(i => (
          <div key={i.id_incidencia} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{i.tipo_incidencia}</p>
                  <p className="text-xs text-slate-500">{i.fecha_incidencia ? new Date(i.fecha_incidencia).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${
                i.estado_incidencia === 'Abierta' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
                {i.estado_incidencia}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <span className="block text-xs text-slate-500 mb-1">Repartidor</span>
                <span className="text-sm font-medium text-slate-700 truncate block">
                  {i.nombre ? `${i.nombre} ${i.apellidos}` : 'N/A'}
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <span className="block text-xs text-slate-500 mb-1">Material</span>
                <span className="text-sm font-medium text-slate-700 truncate block">
                  {i.nombre_material || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        ))}
        {incidencias.length === 0 && (
          <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200 flex flex-col items-center">
            <AlertTriangle className="w-8 h-8 text-slate-300 mb-2" />
            No hay incidencias registradas.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-xl font-bold text-slate-900">Registrar Incidencia</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Repartidor (Opcional)</label>
                <select 
                  value={formData.id_repartidor}
                  onChange={e => setFormData({...formData, id_repartidor: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Ninguno / No aplica</option>
                  {repartidores.map(r => (
                    <option key={r.id} value={r.id}>{r.nombre} {r.apellidos}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Material Afectado (Opcional)</label>
                <select 
                  value={formData.id_material}
                  onChange={e => setFormData({...formData, id_material: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Ninguno / No aplica</option>
                  {materiales.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre_material} (Disp: {m.stock_disponible})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Incidencia</label>
                <select 
                  value={formData.tipo_incidencia}
                  onChange={e => setFormData({...formData, tipo_incidencia: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Daño">Daño</option>
                  <option value="Pérdida">Pérdida</option>
                  <option value="Robo">Robo</option>
                  <option value="Fallo de sistema">Fallo de sistema</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                <select 
                  value={formData.estado_incidencia}
                  onChange={e => setFormData({...formData, estado_incidencia: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Abierta">Abierta</option>
                  <option value="Cerrada">Cerrada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
                <textarea 
                  value={formData.observaciones}
                  onChange={e => setFormData({...formData, observaciones: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]" 
                  placeholder="Detalles sobre la incidencia..."
                  required
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
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
