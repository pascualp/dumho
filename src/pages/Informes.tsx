import { Download, FileText, Mail } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function Informes() {
  const reports = [
    { id: 'global', name: 'Informe general del sistema', desc: 'Resumen completo de materiales, repartidores, entregas e incidencias.', collection: 'global' },
    { id: 'materiales', name: 'Informe general de materiales', desc: 'Inventario, stock disponible y valor asignado.', collection: 'materiales' },
    { id: 'repartidores', name: 'Informe por repartidor', desc: 'Material asignado y pendiente por repartidor.', collection: 'repartidores' },
    { id: 'entregas', name: 'Informe de entregas', desc: 'Historial completo de entregas y firmas.', collection: 'entregas' },
    { id: 'incidencias', name: 'Informe de incidencias', desc: 'Control de pérdidas, daños y dinero de cambio.', collection: 'incidencias' },
  ];

  const FORMATTERS: Record<string, { title: string, columns: { key: string, label: string, format?: (val: any, doc: any) => string }[] }> = {
    materiales: {
      title: 'Inventario de Materiales',
      columns: [
        { key: 'nombre_material', label: 'Material' },
        { key: 'categoria', label: 'Categoría' },
        { key: 'stock_disponible', label: 'Stock Disponible' },
        { key: 'stock_asignado', label: 'Stock Asignado' },
        { key: 'valor_reposicion', label: 'Valor Reposición (€)', format: (v) => v ? `€${Number(v).toFixed(2)}` : '€0.00' }
      ]
    },
    repartidores: {
      title: 'Listado de Repartidores',
      columns: [
        { key: 'nombre', label: 'Nombre Completo', format: (_, doc) => `${doc.nombre || ''} ${doc.apellidos || ''}`.trim() },
        { key: 'dni_nie', label: 'DNI / NIE' },
        { key: 'telefono', label: 'Teléfono' },
        { key: 'zona', label: 'Zona/Ruta' },
        { key: 'estado', label: 'Estado' }
      ]
    },
    entregas: {
      title: 'Registro de Entregas',
      columns: [
        { key: 'fecha_entrega', label: 'Fecha', format: (v) => v ? new Date(v).toLocaleDateString() : 'N/A' },
        { key: 'estado_entrega', label: 'Estado' },
        { key: 'entregado_por', label: 'Registrado por' },
        { key: 'materiales', label: 'Materiales Entregados', format: (v, doc) => {
          const mats = Array.isArray(v) ? v.map((m: any) => `${m.cantidad}x ${m.nombre_material}${m.nota ? m.nota : ''}`).join(', ') : '';
          const obs = doc.observaciones ? `[Obs: ${doc.observaciones}]` : '';
          return [mats, obs].filter(Boolean).join(' | ') || 'Ninguno';
        }}
      ]
    },
    incidencias: {
      title: 'Registro de Incidencias',
      columns: [
        { key: 'fecha_incidencia', label: 'Fecha', format: (v) => v ? new Date(v).toLocaleDateString() : 'N/A' },
        { key: 'tipo_incidencia', label: 'Tipo de Incidencia' },
        { key: 'estado_incidencia', label: 'Estado' },
        { key: 'descripcion', label: 'Descripción' }
      ]
    }
  };

  const getFormattedData = (coll: string, docs: any[]) => {
    const formatter = FORMATTERS[coll];
    if (!formatter) {
      // Fallback a columnas dinámicas si no hay formateador (ej. para colecciones nuevas)
      const headersSet = new Set<string>();
      docs.forEach(doc => Object.keys(doc).forEach(key => headersSet.add(key)));
      const headers = Array.from(headersSet).filter(h => h !== 'firma' && h !== 'firma_receptor'); // excluir firmas largas
      
      const rows = docs.map(doc => headers.map(header => {
        const val = doc[header];
        if (val === null || val === undefined) return '';
        if (typeof val === 'object' && val.seconds) return new Date(val.seconds * 1000).toLocaleDateString();
        if (Array.isArray(val)) return `[${val.length} items]`;
        return String(val);
      }));
      return { title: coll.toUpperCase(), headers, rows };
    }

    const headers = formatter.columns.map(c => c.label);
    const rows = docs.map(doc => formatter.columns.map(col => {
      const val = doc[col.key];
      if (col.format) return col.format(val, doc);
      if (val === null || val === undefined) return '';
      if (typeof val === 'object' && val.seconds) return new Date(val.seconds * 1000).toLocaleDateString();
      if (Array.isArray(val)) return `[${val.length} items]`;
      return String(val);
    }));

    return { title: formatter.title, headers, rows };
  };

  const generatePDFBlob = async (reportName: string, collectionName: string) => {
    const docPdf = new jsPDF('landscape');
    const collectionsToExport = collectionName === 'global' 
        ? ['materiales', 'repartidores', 'entregas', 'incidencias'] 
        : [collectionName];

    let isFirstPage = true;
    let hasData = false;

    // Precargar datos si es necesario (ej. para mapear IDs a nombres - opcional, por ahora usamos datos básicos)

    for (const coll of collectionsToExport) {
      const snapshot = await getDocs(collection(db, coll));
      if (snapshot.empty) continue;
      
      hasData = true;
      if (!isFirstPage) docPdf.addPage('landscape');
      isFirstPage = false;
      
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const { title, headers, rows } = getFormattedData(coll, docs);

      // Cabecera del documento
      docPdf.setFontSize(16);
      docPdf.setTextColor(15, 23, 42); // slate-900
      docPdf.text(`Dumoh - ${reportName}`, 14, 15);
      
      docPdf.setFontSize(12);
      docPdf.setTextColor(100, 116, 139); // slate-500
      docPdf.text(title, 14, 22);
      
      autoTable(docPdf, {
        head: [headers],
        body: rows,
        startY: 28,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontStyle: 'bold' }, // slate-100 bg, slate-600 text
        alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
      });
    }

    if (!hasData) {
      throw new Error('No hay datos para exportar.');
    }

    return docPdf.output('blob');
  };

  const handleExportPDF = async (reportName: string, collectionName: string) => {
    try {
      const pdfBlob = await generatePDFBlob(reportName, collectionName);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${collectionName}_report_${new Date().getTime()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error generando PDF.');
    }
  };

  const handleShare = async (reportName: string, collectionName: string) => {
    try {
      const pdfBlob = await generatePDFBlob(reportName, collectionName);
      const file = new File([pdfBlob], `${collectionName}_report_${new Date().getTime()}.pdf`, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Dumoh - ${reportName}`,
          text: `Hola,\n\nAdjunto el ${reportName} descargado desde Dumoh.`,
        });
      } else {
        // Fallback
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        link.click();
        URL.revokeObjectURL(url);
        
        const subject = encodeURIComponent(`Dumoh - ${reportName}`);
        const body = encodeURIComponent(`Hola,\n\nAdjunto a este correo encontrarás el ${reportName} descargado desde el sistema Dumoh.\n\n[Por favor, recuerde adjuntar el archivo PDF descargado a este correo antes de enviarlo]\n\nSaludos.`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error al intentar compartir el documento.');
    }
  };

  const handleExportCSV = async (collectionName: string) => {
    try {
      const collectionsToExport = collectionName === 'global' 
          ? ['materiales', 'repartidores', 'entregas', 'incidencias'] 
          : [collectionName];

      let csvRows: string[] = [];
      let hasData = false;

      for (const coll of collectionsToExport) {
        const snapshot = await getDocs(collection(db, coll));
        if (snapshot.empty) continue;
        
        hasData = true;
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const { title, headers, rows } = getFormattedData(coll, docs);
        
        if (collectionName === 'global') csvRows.push(`--- TABLA: ${title.toUpperCase()} ---`);
        csvRows.push(headers.map(h => `"${h}"`).join(',')); // Header row
        
        rows.forEach(row => {
          const csvRow = row.map((val: any) => {
            if (val === null || val === undefined) return '""';
            let stringVal = String(val);
            stringVal = stringVal.replace(/"/g, '""');
            return `"${stringVal}"`;
          });
          csvRows.push(csvRow.join(','));
        });
        csvRows.push(''); // Empty line between tables
      }

      if (!hasData) {
        alert('No hay datos para exportar.');
        return;
      }
      
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${collectionName}_report_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
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
              <div className="flex flex-wrap gap-2">
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
                   onClick={() => handleShare(r.name, r.collection)}
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
