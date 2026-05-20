import { useEffect, useState } from 'react';
import { Package, Plus, X } from 'lucide-react';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function Materiales() {
  const [materiales, setMateriales] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre_material: '',
    categoria: 'Protección',
    requiere_devolucion: 1,
    valor_reposicion: 0,
    stock_total: 0
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'materiales'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id_material: doc.id,
        ...doc.data()
      }));
      setMateriales(data);
    });
    return () => unsub();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'materiales'), {
        ...formData,
        stock_disponible: formData.stock_total,
        stock_asignado: 0,
        estado: 'Disponible',
        fecha_creacion: serverTimestamp(),
        fecha_actualizacion: serverTimestamp(),
      });
      setIsModalOpen(false);
      setFormData({
        nombre_material: '',
        categoria: 'Protección',
        requiere_devolucion: 1,
        valor_reposicion: 0,
        stock_total: 0
      });
    } catch (err) {
      console.error(err);
      alert('Error guardando el material');
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Materiales</h1>
          <p className="text-slate-500 max-w-sm">Inventario y control de stock.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900 text-white w-full sm:w-auto justify-center px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" /> Nuevo Material
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500">
              <th className="p-4">Material</th>
              <th className="p-4">Categoría</th>
              <th className="p-4">Stock Disp.</th>
              <th className="p-4">Stock Asignado</th>
              <th className="p-4">Valor Reposición</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {materiales.map(m => (
              <tr key={m.id_material} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-400" />
                  {m.nombre_material}
                </td>
                <td className="p-4 text-slate-600">{m.categoria}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${m.stock_disponible > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {m.stock_disponible}
                  </span>
                </td>
                <td className="p-4 text-slate-600">{m.stock_asignado}</td>
                <td className="p-4 text-slate-600">€{m.valor_reposicion.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">Registrar Material</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input 
                  type="text" 
                  value={formData.nombre_material}
                  onChange={e => setFormData({...formData, nombre_material: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                <select 
                  value={formData.categoria}
                  onChange={e => setFormData({...formData, categoria: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option>Protección</option>
                  <option>Tecnología</option>
                  <option>Uniforme</option>
                  <option>Dinero</option>
                  <option>Accesorios</option>
                  <option>Otros</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Valor Reposición (€)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={formData.valor_reposicion}
                    onChange={e => setFormData({...formData, valor_reposicion: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock Inicial</label>
                  <input 
                    type="number" 
                    value={formData.stock_total}
                    onChange={e => setFormData({...formData, stock_total: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    required 
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input 
                    type="checkbox" 
                    checked={formData.requiere_devolucion === 1}
                    onChange={e => setFormData({...formData, requiere_devolucion: e.target.checked ? 1 : 0})}
                    className="rounded border-slate-300"
                  />
                  Requiere Devolución
                </label>
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
                  Guardar Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

