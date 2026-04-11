import { useState, useMemo } from 'react';
import {
  Box, Typography, Button, Avatar, Chip, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody, TablePagination,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Alert, Tabs, Tab,
} from '@mui/material';
import { Add, Close, PersonOff } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { SearchBar } from '@/shared/components/SearchBar';
import { usersApi, type CrearStaffPayload, type StaffMember } from '../api/usersApi';

// ─── Visual tokens ────────────────────────────────────────────────────────────
const TH_SX = {
  py: 1.25, px: 3, bgcolor: '#F8FAFC',
  fontSize: 11, fontWeight: 700, color: '#94A3B8',
  textTransform: 'uppercase' as const, letterSpacing: '0.06em',
  borderBottom: '1px solid #E2E8F0',
};
const TD_SX = { py: 1.5, px: 3, fontSize: 13.5, borderColor: '#F1F5F9', color: '#64748B' };
const PAGE_SIZE = 15;

const TIPOS_DOC = [
  { value: 'CC',   label: 'Cédula de Ciudadanía (CC)' },
  { value: 'CE',   label: 'Cédula de Extranjería (CE)' },
  { value: 'PA',   label: 'Pasaporte (PA)' },
  { value: 'TI',   label: 'Tarjeta de Identidad (TI)' },
  { value: 'otro', label: 'Otro' },
];

const ROL_CONFIG: Record<string, { label: string; bgcolor: string; color: string }> = {
  seguridad: { label: 'Seguridad',  bgcolor: '#FEF3C7', color: '#D97706' },
  recepcion: { label: 'Recepción',  bgcolor: '#DBEAFE', color: '#2563EB' },
};

// ─── Dialog crear usuario ─────────────────────────────────────────────────────
function CrearUsuarioDialog({ open, onClose, onCreated }: {
  open: boolean; onClose: () => void; onCreated: () => void;
}) {
  const [form, setForm] = useState<CrearStaffPayload>({
    nombre: '', apellido: '', email: '', tipo_documento: 'CC',
    n_documento: '', telefono: '', password: 'Habitare2024!',
  });
  const [rol, setRol] = useState<'seguridad' | 'recepcion'>('recepcion');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: CrearStaffPayload = {
        ...form,
        telefono: form.telefono?.trim() || undefined,
      };
      const usuario = await usersApi.crear(payload);
      await usersApi.asignar(usuario.id, rol);
    },
    onSuccess: () => { onCreated(); handleClose(); },
    onError:   (err: any) => setError(err?.response?.data?.detail ?? 'Error al crear el usuario'),
  });

  const handleClose = () => {
    setForm({ nombre: '', apellido: '', email: '', tipo_documento: 'CC', n_documento: '', telefono: '', password: 'Habitare2024!' });
    setRol('recepcion');
    setError('');
    onClose();
  };

  const set = (k: keyof CrearStaffPayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const canSubmit = form.nombre.trim() && form.apellido.trim() && form.email.trim()
    && form.n_documento.trim() && form.password.trim();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography fontWeight={700} fontSize={15.5}>Nuevo Usuario</Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: '#94A3B8' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '12px !important' }}>
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
          <TextField label="Nombre *" size="small" value={form.nombre} onChange={set('nombre')}
            InputProps={{ sx: { fontSize: 13.5 } }} InputLabelProps={{ sx: { fontSize: 13.5 } }} />
          <TextField label="Apellido *" size="small" value={form.apellido} onChange={set('apellido')}
            InputProps={{ sx: { fontSize: 13.5 } }} InputLabelProps={{ sx: { fontSize: 13.5 } }} />
        </Box>

        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
          <TextField select label="Tipo documento *" size="small" value={form.tipo_documento}
            onChange={set('tipo_documento')}
            InputProps={{ sx: { fontSize: 13.5 } }} InputLabelProps={{ sx: { fontSize: 13.5 } }}>
            {TIPOS_DOC.map(t => (
              <MenuItem key={t.value} value={t.value} sx={{ fontSize: 13.5 }}>{t.label}</MenuItem>
            ))}
          </TextField>
          <TextField label="N° de documento *" size="small" value={form.n_documento}
            onChange={set('n_documento')}
            InputProps={{ sx: { fontSize: 13.5 } }} InputLabelProps={{ sx: { fontSize: 13.5 } }} />
        </Box>

        <TextField label="Correo electrónico *" size="small" type="email" value={form.email}
          onChange={set('email')}
          InputProps={{ sx: { fontSize: 13.5 } }} InputLabelProps={{ sx: { fontSize: 13.5 } }} />

        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
          <TextField label="Teléfono" size="small" value={form.telefono} onChange={set('telefono')}
            InputProps={{ sx: { fontSize: 13.5 } }} InputLabelProps={{ sx: { fontSize: 13.5 } }} />
          <TextField select label="Rol *" size="small" value={rol}
            onChange={e => setRol(e.target.value as 'seguridad' | 'recepcion')}
            InputProps={{ sx: { fontSize: 13.5 } }} InputLabelProps={{ sx: { fontSize: 13.5 } }}>
            <MenuItem value="recepcion" sx={{ fontSize: 13.5 }}>Recepción</MenuItem>
            <MenuItem value="seguridad" sx={{ fontSize: 13.5 }}>Seguridad</MenuItem>
          </TextField>
        </Box>

        <TextField label="Contraseña inicial *" size="small" value={form.password}
          onChange={set('password')}
          helperText="El usuario podrá cambiarla desde su perfil"
          InputProps={{ sx: { fontSize: 13.5 } }} InputLabelProps={{ sx: { fontSize: 13.5 } }}
          FormHelperTextProps={{ sx: { fontSize: 12 } }} />

        {error && <Alert severity="error" sx={{ fontSize: 13, py: 0.5 }}>{error}</Alert>}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={handleClose} sx={{ color: '#64748B', textTransform: 'none', fontSize: 13.5 }}>
          Cancelar
        </Button>
        <Button variant="contained"
          disabled={!canSubmit || mutation.isPending}
          onClick={() => mutation.mutate()}
          sx={{
            bgcolor: '#2563EB', textTransform: 'none', fontSize: 13.5, fontWeight: 600,
            boxShadow: 'none', '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' },
          }}>
          {mutation.isPending ? 'Creando...' : 'Crear usuario'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Dialog confirmar inactivar ───────────────────────────────────────────────
function InactivarDialog({ name, onConfirm, onClose, loading }: {
  name: string; onConfirm: () => void; onClose: () => void; loading: boolean;
}) {
  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography fontWeight={700} fontSize={15.5}>Inactivar usuario</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: '8px !important' }}>
        <Typography fontSize={13.5} color="#64748B">
          ¿Deseas inactivar a <strong style={{ color: '#0F172A' }}>{name}</strong> del conjunto?
          Se le retirará el acceso pero se conservará su historial.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: '#64748B', textTransform: 'none', fontSize: 13.5 }}>
          Cancelar
        </Button>
        <Button variant="contained" disabled={loading} onClick={onConfirm}
          sx={{
            bgcolor: '#DC2626', textTransform: 'none', fontSize: 13.5, fontWeight: 600,
            boxShadow: 'none', '&:hover': { bgcolor: '#B91C1C', boxShadow: 'none' },
          }}>
          {loading ? 'Inactivando...' : 'Inactivar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Tabla de usuarios ────────────────────────────────────────────────────────
function StaffTable({ rows, tab, onInactivar }: {
  rows: StaffMember[];
  tab: number;
  onInactivar?: (u: StaffMember) => void;
}) {
  const [page, setPage] = useState(0);
  const paginated = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (rows.length === 0) {
    return (
      <Box py={8} textAlign="center">
        <PersonOff sx={{ fontSize: 36, color: '#E2E8F0', mb: 1, display: 'block', mx: 'auto' }} />
        <Typography fontSize={13.5} color="#94A3B8">
          {tab === 0 ? 'No hay usuarios activos' : 'No hay usuarios inactivos'}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Table>
        <TableHead>
          <TableRow sx={{ '& th': TH_SX }}>
            <TableCell>Usuario</TableCell>
            <TableCell>Documento</TableCell>
            <TableCell>Teléfono</TableCell>
            <TableCell>Rol</TableCell>
            <TableCell>{tab === 0 ? 'Desde' : 'Ingresó'}</TableCell>
            {tab === 1 && <TableCell>Se fue</TableCell>}
            {tab === 0 && <TableCell sx={{ width: 120 }} />}
          </TableRow>
        </TableHead>
        <TableBody>
          {paginated.map(u => {
            const fullName = `${u.nombre} ${u.apellido}`;
            const initials = `${u.nombre[0]}${u.apellido[0]}`.toUpperCase();
            const rolCfg   = ROL_CONFIG[u.rol] ?? { label: u.rol, bgcolor: '#F1F5F9', color: '#64748B' };
            return (
              <TableRow key={u.id} sx={{
                '&:hover': { bgcolor: '#F8FAFC' },
                '& td': TD_SX,
                '&:last-child td': { border: 0 },
              }}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar
                      src={u.avatar_url ?? undefined}
                      sx={{
                        width: 32, height: 32, fontSize: 11, fontWeight: 700,
                        bgcolor: tab === 0 ? '#0F172A' : '#94A3B8',
                      }}
                    >
                      {!u.avatar_url && initials}
                    </Avatar>
                    <Box>
                      <Typography fontSize={13.5} fontWeight={600}
                        color={tab === 0 ? '#0F172A' : '#64748B'} lineHeight={1.3}>
                        {fullName}
                      </Typography>
                      <Typography fontSize={12} color="#94A3B8">{u.email}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{u.tipo_documento} · {u.n_documento}</TableCell>
                <TableCell>{u.telefono ?? '—'}</TableCell>
                <TableCell>
                  <Chip label={rolCfg.label} size="small" sx={{
                    bgcolor: rolCfg.bgcolor, color: rolCfg.color,
                    fontWeight: 700, fontSize: 11, border: 'none', borderRadius: 1,
                  }} />
                </TableCell>
                <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {dayjs(u.fecha_inicio).format('DD/MM/YYYY')}
                </TableCell>
                {tab === 1 && (
                  <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {u.fecha_salida
                      ? dayjs(u.fecha_salida).format('DD/MM/YYYY')
                      : <Typography fontSize={13.5} color="#94A3B8">—</Typography>
                    }
                  </TableCell>
                )}
                {tab === 0 && (
                  <TableCell sx={{ pr: 3 }}>
                    <Button
                      size="small"
                      onClick={() => onInactivar?.(u)}
                      sx={{
                        fontSize: 12, color: '#DC2626', textTransform: 'none',
                        fontWeight: 600, px: 1.5, py: 0.5,
                        border: '1px solid #FEE2E2', borderRadius: '6px',
                        '&:hover': { bgcolor: '#FEE2E2' },
                      }}
                    >
                      Inactivar
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {rows.length > PAGE_SIZE && (
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={PAGE_SIZE}
          rowsPerPageOptions={[PAGE_SIZE]}
          sx={{
            borderTop: '1px solid #F1F5F9',
            '& .MuiTablePagination-toolbar': { minHeight: 44, px: 3 },
            '& .MuiTablePagination-displayedRows': { fontSize: 12.5, color: '#64748B' },
            '& .MuiTablePagination-actions': { ml: 1 },
          }}
        />
      )}
    </>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────
export function UsersPage() {
  const qc = useQueryClient();
  const [tab,          setTab]          = useState(0);
  const [search,       setSearch]       = useState('');
  const [dialogOpen,   setDialogOpen]   = useState(false);
  const [inactivarId,  setInactivarId]  = useState<StaffMember | null>(null);

  const activosQ = useQuery({
    queryKey: ['staff-activos'],
    queryFn: usersApi.listStaff,
    refetchInterval: 60_000,
  });

  const inactivosQ = useQuery({
    queryKey: ['staff-inactivos'],
    queryFn: usersApi.listStaffInactivos,
    refetchInterval: 60_000,
  });

  const inactivarMutation = useMutation({
    mutationFn: (id: string) => usersApi.inactivar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff-activos'] });
      qc.invalidateQueries({ queryKey: ['staff-inactivos'] });
      setInactivarId(null);
    },
  });

  const data      = tab === 0 ? (activosQ.data   ?? []) : (inactivosQ.data ?? []);
  const isLoading = tab === 0 ? activosQ.isLoading : inactivosQ.isLoading;

  const q = search.toLowerCase();
  const filtered = useMemo(() =>
    data.filter(u =>
      !q || [u.nombre, u.apellido, u.email, u.n_documento, ROL_CONFIG[u.rol]?.label]
        .some(f => f?.toLowerCase().includes(q))
    ), [data, q]);

  const TABS_SX = {
    px: 3, borderBottom: '1px solid #F1F5F9', minHeight: 44,
    '& .MuiTab-root': { fontSize: 13.5, fontWeight: 600, textTransform: 'none', minHeight: 44, color: '#64748B', px: 0, mr: 3 },
    '& .Mui-selected': { color: '#0F172A' },
    '& .MuiTabs-indicator': { bgcolor: '#2563EB', height: 2 },
  };

  return (
    <Box display="flex" flexDirection="column" gap={2.5}>

      {/* ── Toolbar ── */}
      <Box display="flex" alignItems="center" gap={1.5}>
        <SearchBar
          value={search}
          onChange={v => { setSearch(v); }}
          placeholder="Buscar por nombre, documento o rol..."
          width={300}
        />
        <Box flex={1} />
        {tab === 0 && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
            sx={{
              bgcolor: '#2563EB', color: 'white', fontWeight: 700,
              fontSize: 13.5, px: 2.5, py: 1.1, borderRadius: '6px',
              boxShadow: 'none', textTransform: 'none',
              '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' },
            }}
          >
            Nuevo usuario
          </Button>
        )}
      </Box>

      {/* ── Card con tabs + tabla ── */}
      <Box sx={{
        bgcolor: 'white', borderRadius: 2,
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}>
        <Tabs value={tab} onChange={(_, v) => { setTab(v); setSearch(''); }} sx={TABS_SX}>
          <Tab label={`Activos${activosQ.data ? ` (${activosQ.data.length})` : ''}`} />
          <Tab label={`Inactivos${inactivosQ.data?.length ? ` (${inactivosQ.data.length})` : ''}`} />
        </Tabs>

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress size={28} sx={{ color: '#0F172A' }} />
          </Box>
        ) : (
          <StaffTable
            rows={filtered}
            tab={tab}
            onInactivar={tab === 0 ? setInactivarId : undefined}
          />
        )}
      </Box>

      {/* ── Dialogs ── */}
      <CrearUsuarioDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={() => {
          qc.invalidateQueries({ queryKey: ['staff-activos'] });
          setDialogOpen(false);
        }}
      />

      {inactivarId && (
        <InactivarDialog
          name={`${inactivarId.nombre} ${inactivarId.apellido}`}
          loading={inactivarMutation.isPending}
          onConfirm={() => inactivarMutation.mutate(inactivarId.id)}
          onClose={() => setInactivarId(null)}
        />
      )}

    </Box>
  );
}
