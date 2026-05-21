import { useEffect, useState } from 'react';
import { Users, Plus, X, Edit2, User } from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function Repartidores() {
  const [reps, setReps] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterZona, setFilterZona] = useState<string>('Todas');
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    dni_nie: '',
    telefono: '',
    email: '',
    zona: ''
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'repartidores'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id_repartidor: doc.id,
        ...doc.data()
      }));
      setReps(data);
    });
    return () => unsub();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ nombre: '', apellidos: '', dni_nie: '', telefono: '', email: '', zona: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (rep: any) => {
    setEditingId(rep.id_repartidor);
    setFormData({
      nombre: rep.nombre || '',
      apellidos: rep.apellidos || '',
      dni_nie: rep.dni_nie || '',
      telefono: rep.telefono || '',
      email: rep.email || '',
      zona: rep.zona || ''
    });
    setIsModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'repartidores', editingId), {
          ...formData,
          fecha_actualizacion: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'repartidores'), {
          ...formData,
          estado: 'Activo',
          fecha_creacion: serverTimestamp(),
          fecha_actualizacion: serverTimestamp(),
        });
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({
        nombre: '', apellidos: '', dni_nie: '', telefono: '', email: '', zona: ''
      });
    } catch (err) {
      console.error(err);
      alert('Error guardando el repartidor');
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Repartidores</h1>
          <p className="text-slate-500 max-w-sm">Gestión de personal de reparto.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-slate-900 text-white w-full sm:w-auto justify-center px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" /> Nuevo Repartidor
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
            {Array.from(new Set(reps.map(r => r.zona).filter(Boolean))).sort().map(z => (
              <option key={String(z)} value={String(z)}>{String(z)}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
              <th className="p-4">Nombre</th>
              <th className="p-4">DNI/NIE</th>
              <th className="p-4">Zona</th>
              <th className="p-4">Estado</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {reps
              .filter(r => filterZona === 'Todas' || r.zona === filterZona)
              .sort((a, b) => (a.zona || '').localeCompare(b.zona || '') || (a.nombre || '').localeCompare(b.nombre || ''))
              .map(r => (
              <tr key={r.id_repartidor} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium text-slate-900 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 shadow-sm" title={r.nombre}>
                    <User className="w-4 h-4 text-slate-500" fill="currentColor" />
                  </span>
                  {r.nombre} {r.apellidos}
                </td>
                <td className="p-4 text-slate-600">{r.dni_nie}</td>
                <td className="p-4 text-slate-600">{r.zona}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                    {r.estado}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => openEditModal(r)} className="text-slate-400 hover:text-blue-600 transition-colors p-2">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {reps.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No hay repartidores registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {reps
          .filter(r => filterZona === 'Todas' || r.zona === filterZona)
          .sort((a, b) => (a.zona || '').localeCompare(b.zona || '') || (a.nombre || '').localeCompare(b.nombre || ''))
          .map(r => (
          <div key={r.id_repartidor} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                  <User className="w-5 h-5 text-slate-500" fill="currentColor" />
                </span>
                <div>
                  <p className="font-medium text-slate-900">{r.nombre} {r.apellidos}</p>
                  <p className="text-xs text-slate-500">{r.dni_nie}</p>
                </div>
              </div>
              <button onClick={() => openEditModal(r)} className="text-slate-400 hover:text-blue-600 transition-colors p-2 shrink-0">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-100">
              <div className="text-sm text-slate-600">
                <span className="font-medium">Zona:</span> {r.zona || 'N/A'}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                {r.estado}
              </span>
            </div>
          </div>
        ))}
        {reps.length === 0 && (
          <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            No hay repartidores registrados.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? 'Editar Repartidor' : 'Registrar Repartidor'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <form id="repartidor-form" onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                    <input 
                      type="text" 
                      value={formData.nombre}
                      onChange={e => setFormData({...formData, nombre: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Apellidos</label>
                    <input 
                      type="text" 
                      value={formData.apellidos}
                      onChange={e => setFormData({...formData, apellidos: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">DNI/NIE</label>
                  <input 
                    type="text" 
                    value={formData.dni_nie}
                    onChange={e => setFormData({...formData, dni_nie: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                  <input 
                    type="tel" 
                    value={formData.telefono}
                    onChange={e => setFormData({...formData, telefono: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Zona / Ruta</label>
                  <input 
                    type="text" 
                    value={formData.zona}
                    onChange={e => setFormData({...formData, zona: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
              </form>
            </div>
            <div className="flex justify-end gap-3 p-6 pt-4 border-t border-slate-100 bg-white shrink-0">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                form="repartidor-form"
                className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                Guardar Repartidor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
