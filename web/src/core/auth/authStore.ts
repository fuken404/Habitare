import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/models';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  updateUser: (patch: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      updateUser: (patch) => set(s => ({ user: s.user ? { ...s.user, ...patch } : s.user })),
      logout: () => set({ user: null, accessToken: null }),
    }),
    { name: 'habitare-auth' },
  ),
);
