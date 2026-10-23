import { Drawer, Box, Typography, Avatar, CircularProgress, IconButton, Divider } from '@mui/material';
import { Close, Phone, Email, Badge, Home } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/client';
import dayjs from 'dayjs';

interface UsuarioDetalle {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  tipo_documento: string;
  n_documento: string;
  is_activo: boolean;
  fecha_ultimo_acceso: string | null;
  created_at: string;
}

interface UserDetailDrawerProps {
  userId: string | null;
  unidadLabel?: string | null;
  onClose: () => void;
  children?: React.ReactNode;
}

function initials(nombre: string, apellido: string) {
  return `${nombre[0] ?? ''}${apellido[0] ?? ''}`.toUpperCase();
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null }) {
  if (!value) return null;
  return (
    <Box display="flex" alignItems="center" gap={1.25}>
      <Box sx={{ color: '#94A3B8', display: 'flex', alignItems: 'center' }}>{icon}</Box>
      <Box>
        <Typography fontSize={10.5} color="#94A3B8" fontWeight={600} textTransform="uppercase" letterSpacing="0.05em">
          {label}
        </Typography>
        <Typography fontSize={13.5} color="#0F172A" fontWeight={500}>{value}</Typography>
      </Box>
    </Box>
  );
}

export function UserDetailDrawer({ userId, unidadLabel, onClose, children }: UserDetailDrawerProps) {
  const { data: user, isLoading, isError } = useQuery<UsuarioDetalle>({
    queryKey: ['usuario-detalle', userId],
    queryFn: () => apiClient.get<UsuarioDetalle>(`/usuarios/${userId}`).then(r => r.data),
    enabled: !!userId,
    staleTime: 5 * 60_000,
  });

  const nombreCompleto = user ? `${user.nombre} ${user.apellido}` : '';
  const ini = user ? initials(user.nombre, user.apellido) : '?';

  return (
    <Drawer
      anchor="right"
      open={!!userId}
      onClose={onClose}
      PaperProps={{
        sx: { width: 400, display: 'flex', flexDirection: 'column',
          bgcolor: '#F8FAFC', borderLeft: '1px solid #E2E8F0' },
      }}
    >
      {/* Header */}
      <Box sx={{ px: 3, py: 2.5, bgcolor: 'white', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
        <Box display="flex" alignItems="flex-start" gap={1}>
          <Box flex={1}>
            <Typography fontSize={11} color="#94A3B8" fontWeight={700}
              textTransform="uppercase" letterSpacing="0.08em" mb={0.5}>
              Perfil del residente
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={22} sx={{ color: '#0F172A' }} />
          </Box>
        ) : isError ? (
          <Typography fontSize={13} color="#DC2626" mt={1}>No se pudo cargar la información del usuario.</Typography>
        ) : user ? (
          <>
            <Box display="flex" alignItems="center" gap={2} mt={1}>
              <Avatar sx={{ width: 48, height: 48, bgcolor: '#0F172A', fontSize: 16, fontWeight: 700 }}>
                {ini}
              </Avatar>
              <Box>
                <Typography fontSize={15.5} fontWeight={700} color="#0F172A">{nombreCompleto}</Typography>
                <Box display="flex" alignItems="center" gap={0.75} mt={0.25}>
                  <Box sx={{
                    width: 6, height: 6, borderRadius: '50%',
                    bgcolor: user.is_activo ? '#22C55E' : '#94A3B8',
                  }} />
                  <Typography fontSize={12} color={user.is_activo ? '#15803D' : '#64748B'} fontWeight={600}>
                    {user.is_activo ? 'Activo' : 'Inactivo'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box display="flex" flexDirection="column" gap={1.5} mt={2.5}>
              <InfoRow icon={<Email sx={{ fontSize: 14 }} />} label="Email" value={user.email} />
              <InfoRow icon={<Phone sx={{ fontSize: 14 }} />} label="Teléfono" value={user.telefono} />
              <InfoRow icon={<Badge sx={{ fontSize: 14 }} />} label="Documento"
                value={`${user.tipo_documento.toUpperCase()} ${user.n_documento}`} />
              {unidadLabel && (
                <InfoRow icon={<Home sx={{ fontSize: 14 }} />} label="Unidad" value={unidadLabel} />
              )}
            </Box>

            {user.fecha_ultimo_acceso && (
              <Typography fontSize={11} color="#94A3B8" mt={2}>
                Último acceso: {dayjs(user.fecha_ultimo_acceso).format('DD/MM/YY · hh:mm A')}
              </Typography>
            )}
          </>
        ) : null}
      </Box>

      {/* Historial (children) */}
      {children && (
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <Box sx={{ px: 3, py: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            <Typography fontSize={11} color="#94A3B8" fontWeight={700}
              textTransform="uppercase" letterSpacing="0.08em">
              Historial
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ px: 3, py: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {children}
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
