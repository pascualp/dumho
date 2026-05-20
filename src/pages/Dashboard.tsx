import { useEffect, useState } from 'react';
import { Users, Package, AlertTriangle, FileText } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ImportDataButton } from '../components/ImportDataButton';

interface DashboardMetrics {
  repsActivos: number;
  matsAsignados: number;
  matsDisponibles: number;
  entregasActivas: number;
  incidenciasAbiertas: number;
  valorAsignado: number;
}

export function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    let currentMetrics = {
      repsActivos: 0,
      matsAsignados: 0,
      matsDisponibles: 0,
      entregasActivas: 0,
      incidenciasAbiertas: 0,
      valorAsignado: 0
    };

    const unsubs = [
      onSnapshot(collection(db, 'repartidores'), snap => {
        currentMetrics.repsActivos = snap.docs.filter(d => d.data().estado === 'Activo').length;
        setMetrics({...currentMetrics});
      }),
      onSnapshot(collection(db, 'materiales'), snap => {
        currentMetrics.matsAsignados = snap.docs.reduce((acc, d) => acc + (d.data().stock_asignado || 0), 0);
        currentMetrics.matsDisponibles = snap.docs.reduce((acc, d) => acc + (d.data().stock_disponible || 0), 0);
        currentMetrics.valorAsignado = snap.docs.reduce((acc, d) => acc + ((d.data().stock_asignado || 0) * (d.data().valor_reposicion || 0)), 0);
        setMetrics({...currentMetrics});
      }),
      onSnapshot(collection(db, 'entregas'), snap => {
        currentMetrics.entregasActivas = snap.docs.filter(d => d.data().estado_entrega === 'Activa').length;
        setMetrics({...currentMetrics});
      }),
      onSnapshot(collection(db, 'incidencias'), snap => {
        currentMetrics.incidenciasAbiertas = snap.docs.filter(d => d.data().estado_incidencia === 'Abierta').length;
        setMetrics({...currentMetrics});
      })
    ];

    return () => unsubs.forEach(fn => fn());
  }, []);

  if (!metrics) return <div className="p-8">Cargando dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Resumen del estado del material y entregas activas.</p>
        </div>
        <ImportDataButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard 
          title="Repartidores Activos" 
          value={metrics.repsActivos} 
          icon={<Users className="w-6 h-6 text-blue-600" />} 
        />
        <DashboardCard 
          title="Stock Asignado" 
          value={metrics.matsAsignados} 
          icon={<Package className="w-6 h-6 text-indigo-600" />} 
        />
        <DashboardCard 
          title="Stock Disponible" 
          value={metrics.matsDisponibles} 
          icon={<Package className="w-6 h-6 text-green-600" />} 
        />
        <DashboardCard 
          title="Entregas Activas" 
          value={metrics.entregasActivas} 
          icon={<FileText className="w-6 h-6 text-purple-600" />} 
        />
        <DashboardCard 
          title="Incidencias Abiertas" 
          value={metrics.incidenciasAbiertas} 
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />} 
          critical={metrics.incidenciasAbiertas > 0}
        />
        <DashboardCard 
          title="Valor Total Asignado" 
          value={`€${metrics.valorAsignado.toFixed(2)}`} 
          icon={<span className="text-2xl text-emerald-600 font-bold">€</span>} 
        />
      </div>
    </div>
  );
}

function DashboardCard({ title, value, icon, critical = false }: { title: string, value: string | number, icon: React.ReactNode, critical?: boolean }) {
  return (
    <div className={`p-5 sm:p-6 bg-white rounded-xl shadow-sm border ${critical ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${critical ? 'bg-red-100' : 'bg-slate-50'}`}>
          {icon}
        </div>
        <div>
          <p className={`text-sm font-medium ${critical ? 'text-red-700' : 'text-slate-500'}`}>{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
