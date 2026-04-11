import { useState } from 'react';
import { Box, Chip } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { StatusChip } from '@/shared/components/StatusChip';
import { SearchBar } from '@/shared/components/SearchBar';
import { superadminApi } from '../api/superadminApi';
import type { Tenant } from '@/types/models';

const planColor: Record<string, 'default' | 'info' | 'warning'> = {
  basic: 'default',
  pro: 'info',
  enterprise: 'warning',
};

export function TenantsPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => superadminApi.listTenants(),
  });

  const q = search.toLowerCase();
  const rows = (data?.items ?? []).filter((t) =>
    !q ||
    [t.name, t.nit, t.city].some((f) => f?.toLowerCase().includes(q)),
  );

  const columns: Column<Tenant>[] = [
    { key: 'name', label: 'Conjunto' },
    { key: 'nit', label: 'NIT', render: (t) => t.nit ?? '—' },
    { key: 'city', label: 'Ciudad', render: (t) => t.city ?? '—' },
    {
      key: 'plan',
      label: 'Plan',
      render: (t) => (
        <Chip label={t.plan} color={planColor[t.plan]} size="small" sx={{ textTransform: 'capitalize' }} />
      ),
    },
    {
      key: 'is_active',
      label: 'Estado',
      render: (t) => <StatusChip status={t.is_active ? 'active' : 'inactive'} />,
    },
    {
      key: 'created_at',
      label: 'Creado',
      render: (t) => dayjs(t.created_at).format('DD/MM/YYYY'),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Conjuntos residenciales"
        subtitle="Gestión de todos los tenants de Habitare"
        actions={[{ label: 'Nuevo conjunto', startIcon: <Add /> }]}
      />
      <Box mb={2}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre, NIT o ciudad..."
          width={280}
        />
      </Box>
      <DataTable
        columns={columns}
        rows={rows}
        loading={isLoading}
        getRowKey={(t) => t.id}
      />
    </Box>
  );
}
