import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  updateMapos: (amount: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  updateMapos: (amount) => set((state) => ({
    user: state.user ? { ...state.user, mapos: state.user.mapos + amount } : null
  })),
}));
