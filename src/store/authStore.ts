import { create } from 'zustand';

interface User {
  id_usuario: string;
  nombre: string;
  email: string;
  rol: 'Administrador' | 'Encargado' | 'Repartidor' | 'Supervisor';
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
