import { useState } from 'react';
import {
  Box, Typography, Button, Chip, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody, TablePagination,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel,
  IconButton,
} from '@mui/material';
import { Add, Close } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { SearchBar } from '@/shared/components/SearchBar';
import { useAuthStore } from '@/core/auth/authStore';
import { trasteosApi, type TrasteoItem, type TipoTrasteo, type EstadoTrasteo, type TrasteoCreate } from '../api/trasteosApi';
import { unitsApi } from '@/features/units/api/unitsApi';

dayjs.locale('es');

// ─── Visual tokens ────────────────────────────────────────────────────────────
const TH_SX = {
  py: 1.25, px: 3, bgcolor: '#F8FAFC',
  fontSize: 11, fontWeight: 700, color: '#94A3B8',
  textTransform: 'uppercase' as const, letterSpacing: '0.06em',
  borderBottom: '1px solid #E2E8F0',
};
const TD_SX = { py: 1.5, px: 3, fontSize: 13.5, borderColor: '#F1F5F9', color: '#64748B' };
const PAGE_SIZE = 15;

const ESTADO_CFG: Record<EstadoTrasteo, { label: string; bg: string; color: string }> = {
  solicitado: { label: 'Solicitado', bg: '#FEF9C3', color: '#A16207' },
  autorizado: { label: 'Autorizado', bg: '#DCFCE7', color: '#15803D' },
  rechazado:  { label: 'Rechazado',  bg: '#FEE2E2', color: '#DC2626' },
  completado: { label: 'Completado', bg: '#F1F5F9', color: '#64748B' },
};

const TIPO_CFG: Record<TipoTrasteo, { label: string; bg: string; color: string }> = {
  entrada: { label: 'Entrada', bg: '#DBEAFE', color: '#1D4ED8' },
  salida:  { label: 'Salida',  bg: '#F3E8FF', color: '#7C3AED' },
};

function unidadLabel(t: TrasteoItem) {
  return [t.numero_unidad && `Apto ${t.numero_unidad}`, t.nombre_torre]
    .filter(Boolean).join(' · ') || '—';
}

// ─── Dialog crear trasteo ─────────────────────────────────────────────────────
const EMPTY_FORM: TrasteoCreate = {
  unidad_id: '', fecha_programada: '', hora_inicio: '', hora_fin: '',
  tipo: 'entrada', observaciones: '',
};

function CrearTrasteoDialog({ open, onClose, onCreated }: {
  open: boolean; onClose: () => void; onCreated: () => void;
}) {
  const [form, setForm] = useState<TrasteoCreate>(EMPTY_FORM);
  const [error, setError] = useState('');

  const unidadesQ = useQuery({
    queryKey: ['unidades-detalle'],
    queryFn: unitsApi.listDetalle,
    enabled: open,
    staleTime: 5 * 60_000,
  });

  const mutation = useMutation({
    mutationFn: () => trasteosApi.crear({
      ...form,
      observaciones: form.observaciones?.trim() || undefined,
    }),
    onSuccess: () => { onCreated(); handleClose(); },
    onError: (err: any) => setError(err?.response?.data?.detail ?? 'Error al registrar el trasteo'),
  });

  const handleClose = () => { setForm(EMPTY_FORM); setError(''); onClose(); };
  const set = (k: keyof TrasteoCreate) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const canSubmit = form.unidad_id && form.fecha_programada && form.hora_inicio && form.hora_fin && form.tipo;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography fontWeight={700} fontSize={15.5}>Registrar Trasteo</Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: '#94A3B8' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '12px !important' }}>
        <FormControl fullWidth size="small">
          <InputLabel sx={{ fontSize: 13.5 }}>Unidad</InputLabel>
          <Select
            value={form.unidad_id}
            onChange={e => setForm(f => ({ ...f, unidad_id: e.target.value }))}
            label="Unidad"
            sx={{ fontSize: 13.5 }}
          >
            {(unidadesQ.data ?? []).map(u => (
              <MenuItem key={u.id} value={u.id} sx={{ fontSize: 13.5 }}>
                {u.nombre_torre ? `Apto ${u.numero} · ${u.nombre_torre}` : `Apto ${u.numero}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel sx={{ fontSize: 13.5 }}>Tipo</InputLabel>
          <Select
            value={form.tipo}
            onChange={e => setForm(f => ({ ...f, tipo: e.target.value as TipoTrasteo }))}
            label="Tipo"
            sx={{ fontSize: 13.5 }}
          >
            <MenuItem value="entrada" sx={{ fontSize: 13.5 }}>Entrada</MenuItem>
            <MenuItem value="salida" sx={{ fontSize: 13.5 }}>Salida</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Fecha programada" type="date" size="small" fullWidth
          value={form.fecha_programada}
          onChange={set('fecha_programada')}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: dayjs().format('YYYY-MM-DD') }}
          sx={{ '& .MuiInputBase-input': { fontSize: 13.5 } }}
        />

        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
          <TextField
            label="Hora inicio" type="time" size="small"
            value={form.hora_inicio}
            onChange={set('hora_inicio')}
            InputLabelProps={{ shrink: true }}
            sx={{ '& .MuiInputBase-input': { fontSize: 13.5 } }}
          />
          <TextField
            label="Hora fin" type="time" size="small"
            value={form.hora_fin}
            onChange={set('hora_fin')}
            InputLabelProps={{ shrink: true }}
            sx={{ '& .MuiInputBase-input': { fontSize: 13.5 } }}
          />
        </Box>

        <TextField
          label="Observaciones (opcional)" multiline rows={2} size="small" fullWidth
          value={form.observaciones}
          onChange={set('observaciones')}
          sx={{ '& .MuiInputBase-input': { fontSize: 13.5 } }}
        />

        {error && (
          <Typography fontSize={12.5} color="error">{error}</Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={handleClose}
          sx={{ color: '#64748B', textTransform: 'none', fontSize: 13.5 }}>
          Cancelar
        </Button>
        <Button variant="contained" disabled={!canSubmit || mutation.isPending}
          onClick={() => mutation.mutate()}
          sx={{ bgcolor: '#0F172A', textTransform: 'none', fontSize: 13.5, fontWeight: 600,
            boxShadow: 'none', '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' } }}>
          {mutation.isPending ? 'Registrando...' : 'Registrar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Acciones de estado (solo admin) ─────────────────────────────────────────
function EstadoActions({ trasteo, onDone }: { trasteo: TrasteoItem; onDone: () => void }) {
  const qc = useQueryClient();
  const mutate = useMutation({
    mutationFn: (estado: EstadoTrasteo) => trasteosApi.actualizar(trasteo.id, { estado }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['trasteos'] }); onDone(); },
  });

  if (trasteo.estado === 'solicitado') {
    return (
      <Box display="flex" gap={0.75}>
        <Button size="small" disabled={mutate.isPending}
          onClick={() => mutate.mutate('autorizado')}
          sx={{ fontSize: 11.5, textTransform: 'none', bgcolor: '#DCFCE7', color: '#15803D',
            borderRadius: 1, px: 1.25, py: 0.4, '&:hover': { bgcolor: '#BBF7D0' } }}>
          Autorizar
        </Button>
        <Button size="small" disabled={mutate.isPending}
          onClick={() => mutate.mutate('rechazado')}
          sx={{ fontSize: 11.5, textTransform: 'none', bgcolor: '#FEE2E2', color: '#DC2626',
            borderRadius: 1, px: 1.25, py: 0.4, '&:hover': { bgcolor: '#FECACA' } }}>
          Rechazar
        </Button>
      </Box>
    );
  }
  if (trasteo.estado === 'autorizado') {
    return (
      <Button size="small" disabled={mutate.isPending}
        onClick={() => mutate.mutate('completado')}
        sx={{ fontSize: 11.5, textTransform: 'none', bgcolor: '#F1F5F9', color: '#64748B',
          borderRadius: 1, px: 1.25, py: 0.4, '&:hover': { bgcolor: '#E2E8F0' } }}>
        Completar
      </Button>
    );
  }
  return null;
}

// ─── Página ───────────────────────────────────────────────────────────────────
export function TrasteosPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.rol === 'administracion' || user?.rol === 'superadmin';
  const qc = useQueryClient();

  const [search,     setSearch]     = useState('');
  const [estadoF,    setEstadoF]    = useState<EstadoTrasteo | ''>('');
  const [fechaF,     setFechaF]     = useState('');
  const [page,       setPage]       = useState(0);
  const [crearOpen,  setCrearOpen]  = useState(false);

  const { data: trasteos = [], isLoading } = useQuery({
    queryKey: ['trasteos', fechaF, estadoF],
    queryFn: () => trasteosApi.list({
      fecha: fechaF || undefined,
      estado: estadoF || undefined,
    }),
    refetchInterval: 60_000,
  });

  const q = search.toLowerCase();
  const filtered = trasteos.filter(t => {
    if (!q) return true;
    return [t.numero_unidad, t.nombre_torre, t.nombre_creador]
      .some(f => f?.toLowerCase().includes(q));
  });

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <Box display="flex" flexDirection="column" gap={2.5}>

      {/* Toolbar */}
      <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(0); }}
          placeholder="Buscar por unidad o torre..." width={260} />

        <TextField
          type="date" size="small" label="Fecha"
          value={fechaF}
          onChange={e => { setFechaF(e.target.value); setPage(0); }}
          InputLabelProps={{ shrink: true }}
          sx={{
            width: 160,
            '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: 13.5,
              '& fieldset': { borderColor: '#E2E8F0' },
              '&:hover fieldset': { borderColor: '#CBD5E1' } },
          }}
        />

        <FormControl size="small" sx={{
          minWidth: 150,
          '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: 13.5,
            '& fieldset': { borderColor: '#E2E8F0' },
            '&:hover fieldset': { borderColor: '#CBD5E1' } },
        }}>
          <Select displayEmpty value={estadoF}
            onChange={e => { setEstadoF(e.target.value as EstadoTrasteo | ''); setPage(0); }}
            renderValue={v => v ? ESTADO_CFG[v as EstadoTrasteo].label : 'Estado'}>
            <MenuItem value="" sx={{ fontSize: 13.5 }}>Todos</MenuItem>
            {(Object.keys(ESTADO_CFG) as EstadoTrasteo[]).map(e => (
              <MenuItem key={e} value={e} sx={{ fontSize: 13.5 }}>{ESTADO_CFG[e].label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box flex={1} />

        {isAdmin && (
          <Button variant="contained" startIcon={<Add />}
            onClick={() => setCrearOpen(true)}
            sx={{ bgcolor: '#0F172A', color: 'white', fontWeight: 700, fontSize: 13.5,
              px: 2.5, py: 1.1, borderRadius: '6px', boxShadow: 'none', textTransform: 'none',
              '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' } }}>
            Registrar Trasteo
          </Button>
        )}
      </Box>

      {/* Table */}
      <Box sx={{ bgcolor: 'white', borderRadius: 2, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              {['Unidad', 'Tipo', 'Fecha', 'Horario', 'Estado', 'Registrado por', 'Observaciones',
                ...(isAdmin ? ['Acciones'] : [])].map(h => (
                <TableCell key={h} sx={TH_SX}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 8 : 7} align="center" sx={{ py: 8 }}>
                  <CircularProgress size={26} sx={{ color: '#0F172A' }} />
                </TableCell>
              </TableRow>
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 8 : 7} align="center"
                  sx={{ py: 8, color: '#94A3B8', fontSize: 13.5 }}>
                  Sin trasteos registrados
                </TableCell>
              </TableRow>
            ) : paginated.map(t => {
              const est  = ESTADO_CFG[t.estado];
              const tipo = TIPO_CFG[t.tipo];
              return (
                <TableRow key={t.id} sx={{
                  '&:hover': { bgcolor: '#F8FAFC' },
                  '& td': TD_SX,
                  '&:last-child td': { border: 0 },
                }}>
                  <TableCell>
                    <Typography fontSize={13.5} fontWeight={600} color="#0F172A">
                      {unidadLabel(t)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={tipo.label} size="small"
                      sx={{ bgcolor: tipo.bg, color: tipo.color,
                        fontWeight: 700, fontSize: 11, borderRadius: 1, border: 'none' }} />
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {dayjs(t.fecha_programada).format('DD/MM/YYYY')}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                    {t.hora_inicio.slice(0, 5)} – {t.hora_fin.slice(0, 5)}
                  </TableCell>
                  <TableCell>
                    <Chip label={est.label} size="small"
                      sx={{ bgcolor: est.bg, color: est.color,
                        fontWeight: 700, fontSize: 11, borderRadius: 1, border: 'none' }} />
                  </TableCell>
                  <TableCell>{t.nombre_creador ?? '—'}</TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <Typography fontSize={13} color="#64748B"
                      sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.observaciones ?? '—'}
                    </Typography>
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <EstadoActions trasteo={t} onDone={() => {}} />
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 2, py: 0.5, borderTop: filtered.length > PAGE_SIZE ? '1px solid #F1F5F9' : 'none' }}>
          <Typography fontSize={12} color="#94A3B8">{filtered.length} trasteo{filtered.length !== 1 ? 's' : ''}</Typography>
          {filtered.length > PAGE_SIZE && (
            <TablePagination component="div" count={filtered.length} page={page}
              rowsPerPage={PAGE_SIZE} rowsPerPageOptions={[]}
              onPageChange={(_, p) => setPage(p)}
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
              sx={{
                '& .MuiTablePagination-toolbar': { minHeight: 40, fontSize: 12 },
                '& .MuiTablePagination-displayedRows': { fontSize: 12, color: '#64748B' },
              }}
            />
          )}
        </Box>
      </Box>

      {isAdmin && (
        <CrearTrasteoDialog
          open={crearOpen}
          onClose={() => setCrearOpen(false)}
          onCreated={() => {
            setCrearOpen(false);
            qc.invalidateQueries({ queryKey: ['trasteos'] });
          }}
        />
      )}
    </Box>
  );
}
