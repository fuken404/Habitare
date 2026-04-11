import { apiClient } from '@/core/api/client';
import type { Tenant } from '@/types/models';
import type { PaginatedResponse } from '@/types/api';

export interface TenantPayload {
  name: string;
  nit?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  plan: 'basic' | 'pro' | 'enterprise';
}

export const superadminApi = {
  listTenants: async (params: { page?: number } = {}): Promise<PaginatedResponse<Tenant>> => {
    const { data } = await apiClient.get<PaginatedResponse<Tenant>>('/superadmin/tenants', { params });
    return data;
  },

  createTenant: async (payload: TenantPayload): Promise<Tenant> => {
    const { data } = await apiClient.post<Tenant>('/superadmin/tenants', payload);
    return data;
  },

  updateTenant: async (id: string, payload: Partial<TenantPayload>): Promise<Tenant> => {
    const { data } = await apiClient.patch<Tenant>(`/superadmin/tenants/${id}`, payload);
    return data;
  },

  deactivateTenant: async (id: string): Promise<void> => {
    await apiClient.delete(`/superadmin/tenants/${id}`);
  },
};
