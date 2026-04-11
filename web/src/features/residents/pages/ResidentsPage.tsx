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
import { residentsApi, type CrearResidentePayload } from '../api/residentsApi';
import { unitsApi } from '@/features/units/api/unitsApi';

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

// ─── Dialog crear residente ───────────────────────────────────────────────────
function CrearResidenteDialog({ open, onClose, onCreated }: {
  open: boolean; onClose: () => void; onCreated: () => void;
}) {
  const [form, setForm] = useState<CrearResidentePayload>({
    nombre: '', apellido: '', email: '', tipo_documento: 'CC',
    n_documento: '', telefono: '', password: 'Habitare2024!',
  });
  const [unidadId, setUnidadId] = useState('');
  const [error,    setError]    = useState('');

  const unidadesQ = useQuery({
    queryKey: ['unidades-detalle'],
    queryFn: unitsApi.listDetalle,
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: CrearResidentePayload = {
        ...form,
        telefono: form.telefono?.trim() || undefined,
      };
      const usuario = await residentsApi.crear(payload);
      await residentsApi.asignar(usuario.id, unidadId);
    },
    onSuccess: () => { onCreated(); handleClose(); },
    onError:   (err: any) => setError(err?.response?.data?.detail ?? 'Error al crear el residente'),
  });

  const handleClose = () => {
    setForm({ nombre: '', apellido: '', email: '', tipo_documento: 'CC', n_documento: '', telefono: '', password: 'Habitare2024!' });
    setUnidadId('');
    setError('');
    onClose();
  };

  const set = (k: keyof CrearResidentePayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const canSubmit = form.nombre.trim() && form.apellido.trim() && form.email.trim()
    && form.n_documento.trim() && form.password.trim() && unidadId;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography fontWeight={700} fontSize={15.5}>Nuevo Residente</Typography>
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

        <TextField label="Teléfono" size="small" value={form.telefono} onChange={set('telefono')}
          InputProps={{ sx: { fontSize: 13.5 } }} InputLabelProps={{ sx: { fontSize: 13.5 } }} />

        <TextField select label="Unidad *" size="small" value={unidadId}
          onChange={e => setUnidadId(e.target.value)}
          disabled={unidadesQ.isLoading}
          InputProps={{ sx: { fontSize: 13.5 } }} InputLabelProps={{ sx: { fontSize: 13.5 } }}>
          {(unidadesQ.data ?? []).map(u => (
            <MenuItem key={u.id} value={u.id} sx={{ fontSize: 13.5 }}>
              {u.nombre_torre ? `${u.nombre_torre} / ${u.numero}` : u.numero}
            </MenuItem>
          ))}
        </TextField>

        <TextField label="Contraseña inicial *" size="small" value={form.password}
          onChange={set('password')}
          helperText="El residente podrá cambiarla desde su perfil"
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
          {mutation.isPending ? 'Creando...' : 'Crear residente'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Dialog confirmar desactivar ──────────────────────────────────────────────
function DesactivarDialog({ name, onConfirm, onClose, loading }: {
  name: string; onConfirm: () => void; onClose: () => void; loading: boolean;
}) {
  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography fontWeight={700} fontSize={15.5}>Desactivar residente</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: '8px !important' }}>
        <Typography fontSize={13.5} color="#64748B">
          ¿Deseas desactivar a <strong style={{ color: '#0F172A' }}>{name}</strong> del conjunto?
          Se eliminará su acceso pero conservará su historial.
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
          {loading ? 'Desactivando...' : 'Desactivar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────
export function ResidentsPage() {
  const qc = useQueryClient();
  const [tab,          setTab]          = useState(0);
  const [search,       setSearch]       = useState('');
  const [page,         setPage]         = useState(0);
  const [dialogOpen,   setDialogOpen]   = useState(false);
  const [desactivarId, setDesactivarId] = useState<string | null>(null);

  const activosQ = useQuery({
    queryKey: ['residentes'],
    queryFn: residentsApi.list,
    refetchInterval: 60_000,
  });

  const inactivosQ = useQuery({
    queryKey: ['residentes-inactivos'],
    queryFn: residentsApi.listInactivos,
    refetchInterval: 60_000,
  });

  const desactivarMutation = useMutation({
    mutationFn: residentsApi.desactivar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['residentes'] });
      qc.invalidateQueries({ queryKey: ['residentes-inactivos'] });
      qc.invalidateQueries({ queryKey: ['adm-usuarios'] });
      setDesactivarId(null);
    },
  });

  const data     = tab === 0 ? (activosQ.data   ?? []) : (inactivosQ.data ?? []);
  const isLoading = tab === 0 ? activosQ.isLoading : inactivosQ.isLoading;

  const q = search.toLowerCase();
  const filtered = useMemo(() =>
    data.filter(r =>
      !q || [r.nombre, r.apellido, r.email, r.n_documento, r.numero_unidad].some(f => f?.toLowerCase().includes(q))
    ), [data, q]);

  const paginated        = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const desactivarTarget = (activosQ.data ?? []).find(r => r.id === desactivarId);

  const handleTabChange = (_: React.SyntheticEvent, v: number) => {
    setTab(v); setSearch(''); setPage(0);
  };

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
          onChange={v => { setSearch(v); setPage(0); }}
          placeholder="Buscar por nombre, documento o unidad..."
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
            Nuevo residente
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
        <Tabs value={tab} onChange={handleTabChange} sx={TABS_SX}>
          <Tab label={`Activos${activosQ.data ? ` (${activosQ.data.length})` : ''}`} />
          <Tab label={`Inactivos${inactivosQ.data?.length ? ` (${inactivosQ.data.length})` : ''}`} />
        </Tabs>

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress size={28} sx={{ color: '#0F172A' }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box py={8} textAlign="center">
            <PersonOff sx={{ fontSize: 36, color: '#E2E8F0', mb: 1, display: 'block', mx: 'auto' }} />
            <Typography fontSize={13.5} color="#94A3B8">
              {q ? 'Sin resultados para tu búsqueda'
                 : tab === 0 ? 'No hay residentes activos' : 'No hay residentes inactivos'}
            </Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': TH_SX }}>
                  <TableCell>Residente</TableCell>
                  <TableCell>Documento</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Última unidad</TableCell>
                  <TableCell>{tab === 0 ? 'Desde' : 'Ingresó'}</TableCell>
                  {tab === 1 && <TableCell>Se fue</TableCell>}
                  {tab === 0 && <TableCell sx={{ width: 120 }} />}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map(r => {
                  const fullName = `${r.nombre} ${r.apellido}`;
                  const initials = `${r.nombre[0]}${r.apellido[0]}`.toUpperCase();
                  const unidad   = [r.nombre_torre, r.numero_unidad].filter(Boolean).join(' / ');
                  return (
                    <TableRow key={r.id} sx={{
                      '&:hover': { bgcolor: '#F8FAFC' },
                      '& td': TD_SX,
                      '&:last-child td': { border: 0 },
                    }}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar
                            src={r.avatar_url ?? undefined}
                            sx={{ width: 32, height: 32, bgcolor: tab === 0 ? '#0F172A' : '#94A3B8', fontSize: 11, fontWeight: 700 }}
                          >
                            {!r.avatar_url && initials}
                          </Avatar>
                          <Box>
                            <Typography fontSize={13.5} fontWeight={600} color={tab === 0 ? '#0F172A' : '#64748B'} lineHeight={1.3}>
                              {fullName}
                            </Typography>
                            <Typography fontSize={12} color="#94A3B8">{r.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{r.tipo_documento} · {r.n_documento}</TableCell>
                      <TableCell>{r.telefono ?? '—'}</TableCell>
                      <TableCell sx={{ color: '#0F172A !important', fontWeight: '600 !important' }}>
                        {unidad || '—'}
                      </TableCell>
                      <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {dayjs(r.created_at).format('DD/MM/YYYY')}
                      </TableCell>
                      {tab === 1 && (
                        <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>
                          {r.fecha_salida
                            ? dayjs(r.fecha_salida).format('DD/MM/YYYY')
                            : <Typography fontSize={13.5} color="#94A3B8">—</Typography>
                          }
                        </TableCell>
                      )}
                      {tab === 0 && (
                        <TableCell sx={{ pr: 3 }}>
                          <Button
                            size="small"
                            onClick={() => setDesactivarId(r.id)}
                            sx={{
                              fontSize: 12, color: '#DC2626', textTransform: 'none',
                              fontWeight: 600, px: 1.5, py: 0.5,
                              border: '1px solid #FEE2E2', borderRadius: '6px',
                              '&:hover': { bgcolor: '#FEE2E2' },
                            }}
                          >
                            Desactivar
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filtered.length > PAGE_SIZE && (
              <TablePagination
                component="div"
                count={filtered.length}
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
        )}
      </Box>

      {/* ── Dialogs ── */}
      <CrearResidenteDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={() => {
          qc.invalidateQueries({ queryKey: ['residentes'] });
          setDialogOpen(false);
        }}
      />

      {desactivarTarget && (
        <DesactivarDialog
          name={`${desactivarTarget.nombre} ${desactivarTarget.apellido}`}
          loading={desactivarMutation.isPending}
          onConfirm={() => desactivarMutation.mutate(desactivarTarget.id)}
          onClose={() => setDesactivarId(null)}
        />
      )}

    </Box>
  );
}
