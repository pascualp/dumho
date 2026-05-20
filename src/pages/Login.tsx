import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password).catch(async (e) => {
        if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found') {
           // Auto-register for easy demoing
           const { createUserWithEmailAndPassword } = await import('firebase/auth');
           return createUserWithEmailAndPassword(auth, email, password);
        }
        throw e;
      });
      // Fetch role from Firestore
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let role = 'Encargado';
      let nombre = userCredential.user.displayName || email.split('@')[0];
      
      if (userDoc.exists()) {
        role = userDoc.data().rol || 'Encargado';
        nombre = userDoc.data().nombre || nombre;
      } else {
        // Auto-create profile for this demo
        await setDoc(userDocRef, {
          nombre,
          email,
          rol: role,
          estado: 'Activo',
          fecha_creacion: Date.now()
        });
      }

      setUser({
        id_usuario: userCredential.user.uid,
        email,
        nombre,
        rol: role as any
      });
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error de autenticación');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dumoh</h1>
          <p className="text-slate-500 mt-2">Gestión Logística</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="admin@dumoh.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-lg hover:bg-slate-800 transition-colors mt-6"
          >
            <LogIn className="w-5 h-5" />
            Entrar al Sistema
          </button>
        </form>
      </div>
    </div>
  );
}
