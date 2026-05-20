import { Download, FileText, Mail } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function Informes() {
  const reports = [
    { id: 'materiales', name: 'Informe general de materiales', desc: 'Inventario, stock disponible y valor asignado.', collection: 'materiales' },
    { id: 'repartidores', name: 'Informe por repartidor', desc: 'Material asignado y pendiente por repartidor.', collection: 'repartidores' },
    { id: 'entregas', name: 'Informe de entregas', desc: 'Historial completo de entregas y firmas.', collection: 'entregas' },
    { id: 'incidencias', name: 'Informe de incidencias', desc: 'Control de pérdidas, daños y dinero de cambio.', collection: 'incidencias' },
  ];

  const handleExportPDF = async (reportName: string, collectionName: string) => {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      if (snapshot.empty) {
        alert('No hay datos para exportar.');
        return;
      }
      
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const headersSet = new Set<string>();
      docs.forEach(doc => Object.keys(doc).forEach(key => headersSet.add(key)));
      const headers = Array.from(headersSet);

      const rows = docs.map(doc => headers.map(header => {
        const val = doc[header];
        if (val === null || val === undefined) return '';
        if (typeof val === 'object' && val.seconds) {
           return new Date(val.seconds * 1000).toLocaleDateString();
        }
        return String(val);
      }));

      const docPdf = new jsPDF('landscape');
      docPdf.text(`Dumoh - ${reportName}`, 14, 15);
      
      autoTable(docPdf, {
        head: [headers],
        body: rows,
        startY: 20,
        styles: { fontSize: 8, cellPadding: 2 },
      });

      docPdf.save(`${collectionName}_report_${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Error generando PDF.');
    }
  };

  const handleEmail = (reportName: string) => {
    const subject = encodeURIComponent(`Dumoh - ${reportName}`);
    const body = encodeURIComponent(`Hola,\n\nAdjunto a este correo encontrarás el ${reportName} descargado desde el sistema Dumoh.\n\n[Por favor, recuerde adjuntar el archivo PDF o CSV descargado a este correo antes de enviarlo]\n\nSaludos.`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleExportCSV = async (collectionName: string) => {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      if (snapshot.empty) {
        alert('No hay datos para exportar.');
        return;
      }
      
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Get all unique keys for headers
      const headersSet = new Set<string>();
      docs.forEach(doc => {
        Object.keys(doc).forEach(key => headersSet.add(key));
      });
      const headers = Array.from(headersSet);
      
      // Create CSV content
      const csvRows = [];
      csvRows.push(headers.join(',')); // Header row
      
      docs.forEach(doc => {
        const row = headers.map(header => {
          const val = doc[header];
          // Basic formatting
          if (val === null || val === undefined) return '""';
          if (typeof val === 'object' && val.seconds) {
            // Firestore timestamp
            return `"${new Date(val.seconds * 1000).toISOString()}"`;
          }
          let stringVal = String(val);
          // Escape quotes
          stringVal = stringVal.replace(/"/g, '""');
          return `"${stringVal}"`;
        });
        csvRows.push(row.join(','));
      });
      
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${collectionName}_report_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('Error exportando datos.');
    }
  };

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
                <button 
                  onClick={() => handleExportPDF(r.name, r.collection)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                >
                  <Download className="w-3 h-3" /> PDF
                </button>
                <button 
                   onClick={() => handleExportCSV(r.collection)}
                   className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  <Download className="w-3 h-3" /> CSV
                </button>
                <button 
                   onClick={() => handleEmail(r.name)}
                   className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors ml-auto"
                >
                  <Mail className="w-3 h-3" /> Enviar Mail
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
