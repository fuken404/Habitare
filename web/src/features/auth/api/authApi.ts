import { apiClient } from '@/core/api/client';
import type { TokenPair, User } from '@/types/models';

export const authApi = {
  login: async (email: string, password: string): Promise<TokenPair> => {
    const form = new URLSearchParams({ username: email, password });
    const { data } = await apiClient.post<TokenPair>('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },
};
