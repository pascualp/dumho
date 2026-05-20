import { Outlet, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Package, Users, Home, ClipboardList, AlertTriangle, LogOut, FileText, Menu, X, HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

export function Layout() {
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await signOut(auth);
    logout();
    navigate('/login');
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/repartidores', icon: Users, label: 'Repartidores' },
    { to: '/materiales', icon: Package, label: 'Materiales' },
    { to: '/entregas', icon: ClipboardList, label: 'Entregas & Devoluciones' },
    { to: '/incidencias', icon: AlertTriangle, label: 'Incidencias' },
    { to: '/informes', icon: FileText, label: 'Informes' },
    { to: '/manual', icon: HelpCircle, label: 'Ayuda (Manual)' },
  ];

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-slate-50 text-slate-900 overflow-hidden">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-slate-900 text-white flex items-center justify-between p-4 flex-shrink-0 relative z-50 shadow-md">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Dumoh</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -mr-2 text-slate-300 hover:text-white" aria-label="Menu">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex absolute md:static inset-0 z-40 bg-slate-900 text-white flex-col w-full md:w-64 pt-16 md:pt-0 pb-safe`}>
        <div className="hidden md:block p-6">
          <h1 className="text-2xl font-bold tracking-tight">Dumoh</h1>
          <p className="text-slate-400 text-sm">Gestión de Materiales</p>
        </div>
        <nav className="flex-1 px-4 py-8 md:py-0 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="mb-4">
            <p className="text-sm font-medium">{user.nombre}</p>
            <p className="text-xs text-slate-400">{user.rol}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-3 md:py-2 text-sm text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-50 relative z-10 w-full">
        <Outlet />
      </main>
    </div>
  );
}
