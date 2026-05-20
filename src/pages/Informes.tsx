import { Download, FileText } from 'lucide-react';

export function Informes() {
  const reports = [
    { id: 'general', name: 'Informe general de materiales', desc: 'Inventario, stock disponible y valor asignado.' },
    { id: 'repartidores', name: 'Informe por repartidor', desc: 'Material asignado y pendiente por repartidor.' },
    { id: 'entregas', name: 'Informe de entregas', desc: 'Historial completo de entregas y firmas.' },
    { id: 'devoluciones', name: 'Informe de devoluciones', desc: 'Historial de devoluciones y diferencias.' },
    { id: 'incidencias', name: 'Informe de incidencias', desc: 'Control de pérdidas, daños y dinero de cambio.' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Informes y Documentos</h1>
        <p className="text-slate-500">Descarga de informes en formato PDF, Excel y CSV.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map(r => (
          <div key={r.id} className="p-6 bg-white border border-slate-200 rounded-xl flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">{r.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{r.desc}</p>
              <div className="flex gap-2">
                <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors">
                  <Download className="w-3 h-3" /> PDF
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors">
                  <Download className="w-3 h-3" /> Excel
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors">
                  <Download className="w-3 h-3" /> CSV
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
