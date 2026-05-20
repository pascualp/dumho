import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Repartidores } from './pages/Repartidores';
import { Materiales } from './pages/Materiales';
import { Entregas } from './pages/Entregas';
import { Incidencias } from './pages/Incidencias';
import { Informes } from './pages/Informes';
import { Manual } from './pages/Manual';

export default function App() {
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          let role = 'Encargado';
          let nombre = user.displayName || user.email?.split('@')[0] || 'Usuario';
          
          if (userDoc.exists()) {
            role = userDoc.data().rol || 'Encargado';
            nombre = userDoc.data().nombre || nombre;
          }

          setUser({
            id_usuario: user.uid,
            email: user.email || '',
            nombre,
            rol: role as any
          });
        } catch (err) {
          console.error("Error fetching user role", err);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [setUser]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Cargando...</div>;
  }

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
          <Route path="/manual" element={<Manual />} />
          <Route path="*" element={<div className="p-8"><h1 className="text-2xl font-bold">En Construcción</h1><p className="text-slate-500 mt-2">Esta sección será implementada pronto acorde a las especificaciones solicitadas.</p></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
