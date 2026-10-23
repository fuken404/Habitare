import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '../constants/config';

export type UserRole = 'superadmin' | 'administracion' | 'recepcion' | 'seguridad' | 'residente';

export interface AuthUser {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: UserRole;
  tenantId: string;
  unidadId?: string;
  numeroUnidad?: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: async (user, accessToken, refreshToken) => {
    await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    set({ user, accessToken, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  },

  loadStoredToken: async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!token) {
      set({ isLoading: false });
    }
    return token;
  },
}));
