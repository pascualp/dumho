import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Repartidores } from './pages/Repartidores';
import { Materiales } from './pages/Materiales';
import { Entregas } from './pages/Entregas';
import { Incidencias } from './pages/Incidencias';
import { Informes } from './pages/Informes';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/repartidores" element={<Repartidores />} />
          <Route path="/materiales" element={<Materiales />} />
          <Route path="/entregas" element={<Entregas />} />
          <Route path="/incidencias" element={<Incidencias />} />
          <Route path="/informes" element={<Informes />} />
          <Route path="*" element={<div className="p-8"><h1 className="text-2xl font-bold">En Construcción</h1><p className="text-slate-500 mt-2">Esta sección será implementada pronto acorde a las especificaciones solicitadas.</p></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
