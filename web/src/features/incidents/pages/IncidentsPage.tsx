import { useState, useMemo } from 'react';
import {
  Box, Chip, Typography, Button, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody, TablePagination,
  Drawer, IconButton, Divider, InputBase,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, MenuItem, Select, TextField,
  List, ListItem, ListItemText, Tooltip,
} from '@mui/material';
import {
  Add, Close, Settings, Delete, ReportProblemOutlined, FilterList,
  LocationOn, CalendarToday, CheckCircleOutline, Send,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { useAuthStore } from '@/core/auth/authStore';
import { SearchBar } from '@/shared/components/SearchBar';
import {
  incidentsApi,
  type EstadoIncidente,
  type SeveridadIncidente,
  type IncidenteListItem,
  type IncidenteDetalle,
  type TipoIncidente,
} from '../api/incidentsApi';

dayjs.locale('es');

// ─── Tokens visuales ──────────────────────────────────────────────────────────
const TH_SX = {
  py: 1.25, px: 3, bgcolor: '#F8FAFC',
  fontSize: 11, fontWeight: 700, color: '#94A3B8',
  textTransform: 'uppercase' as const, letterSpacing: '0.06em',
  borderBottom: '1px solid #E2E8F0',
};
const TD_SX = {
  py: 1.75, px: 3, fontSize: 13.5, borderColor: '#F1F5F9', color: '#64748B',
};
const PAGE_SIZE = 15;

// ─── Badges de severidad ──────────────────────────────────────────────────────
const SEV_STYLE: Record<SeveridadIncidente, { bg: string; color: string; label: string }> = {
  baja:    { bg: '#DCFCE7', color: '#15803D', label: 'Baja' },
  media:   { bg: '#FEF9C3', color: '#A16207', label: 'Media' },
  alta:    { bg: '#FFEDD5', color: '#C2410C', label: 'Alta' },
  critica: { bg: '#FEE2E2', color: '#DC2626', label: 'Crítica' },
};

const ESTADO_STYLE: Record<EstadoIncidente, { bg: string; color: string; label: string }> = {
  reportado:   { bg: '#DBEAFE', color: '#1D4ED8', label: 'Reportado' },
  en_atencion: { bg: '#FEF9C3', color: '#A16207', label: 'En atención' },
  resuelto:    { bg: '#DCFCE7', color: '#15803D', label: 'Resuelto' },
  cerrado:     { bg: 'transparent', color: '#94A3B8', label: 'Cerrado' },
};

function SevBadge({ v }: { v: SeveridadIncidente }) {
  const s = SEV_STYLE[v];
  return (
    <Box component="span" sx={{
      display: 'inline-block', px: 1.25, py: 0.25,
      bgcolor: s.bg, color: s.color,
      fontSize: 12.5, fontWeight: 600, borderRadius: '6px',
    }}>
      {s.label}
    </Box>
  );
}

function EstadoBadge({ v }: { v: EstadoIncidente }) {
  const s = ESTADO_STYLE[v];
  return (
    <Box component="span" sx={{
      display: 'inline-block', px: 1.25, py: 0.25,
      bgcolor: s.bg, color: s.color,
      fontSize: 12.5, fontWeight: 600, borderRadius: '6px',
    }}>
      {s.label}
    </Box>
  );
}

// ─── CrearIncidenteDialog ─────────────────────────────────────────────────────
export function CrearIncidenteDialog({ open, onClose, tipos }: {
  open: boolean; onClose: () => void; tipos: TipoIncidente[];
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    tipo_id: '', titulo: '', descripcion: '',
    severidad: 'media' as SeveridadIncidente, ubicacion: '',
  });
  const [error, setError] = useState('');

  const mut = useMutation({
    mutationFn: () => incidentsApi.crear({
      tipo_id: form.tipo_id, titulo: form.titulo,
      descripcion: form.descripcion, severidad: form.severidad,
      ubicacion: form.ubicacion || undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['incidentes'] }); handleClose(); },
    onError: (err: any) => setError(err?.response?.data?.detail ?? 'Error al crear novedad'),
  });

  function handleClose() {
    setForm({ tipo_id: '', titulo: '', descripcion: '', severidad: 'media', ubicacion: '' });
    setError('');
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography fontWeight={700} fontSize={15.5}>Registrar novedad</Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: '#94A3B8' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '12px !important' }}>
        {error && <Typography fontSize={12.5} color="error">{error}</Typography>}
        <FormControl size="small" fullWidth required>
          <InputLabel sx={{ fontSize: 13.5 }}>Tipo de novedad</InputLabel>
          <Select value={form.tipo_id} label="Tipo de novedad"
            onChange={e => setForm(f => ({ ...f, tipo_id: e.target.value }))} sx={{ fontSize: 13.5 }}>
            {tipos.map(t => <MenuItem key={t.id} value={t.id} sx={{ fontSize: 13.5 }}>{t.nombre}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label="Título *" size="small" fullWidth value={form.titulo}
          onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
          InputProps={{ sx: { fontSize: 13.5 } }} InputLabelProps={{ sx: { fontSize: 13.5 } }} />
        <TextField label="Descripción *" size="small" fullWidth multiline rows={3}
          value={form.descripcion}
          onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
          InputProps={{ sx: { fontSize: 13.5 } }} InputLabelProps={{ sx: { fontSize: 13.5 } }} />
        <FormControl size="small" fullWidth>
          <InputLabel sx={{ fontSize: 13.5 }}>Severidad</InputLabel>
          <Select value={form.severidad} label="Severidad"
            onChange={e => setForm(f => ({ ...f, severidad: e.target.value as SeveridadIncidente }))}
            sx={{ fontSize: 13.5 }}>
            <MenuItem value="baja" sx={{ fontSize: 13.5 }}>Baja</MenuItem>
            <MenuItem value="media" sx={{ fontSize: 13.5 }}>Media</MenuItem>
            <MenuItem value="alta" sx={{ fontSize: 13.5 }}>Alta</MenuItem>
            <MenuItem value="critica" sx={{ fontSize: 13.5 }}>Crítica</MenuItem>
          </Select>
        </FormControl>
        <TextField label="Ubicación (opcional)" size="small" fullWidth value={form.ubicacion}
          onChange={e => setForm(f => ({ ...f, ubicacion: e.target.value }))}
          InputProps={{ sx: { fontSize: 13.5 } }} InputLabelProps={{ sx: { fontSize: 13.5 } }} />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={handleClose} sx={{ color: '#64748B', textTransform: 'none', fontSize: 13.5 }}>
          Cancelar
        </Button>
        <Button variant="contained"
          disabled={!form.tipo_id || !form.titulo || !form.descripcion || mut.isPending}
          onClick={() => mut.mutate()}
          sx={{ bgcolor: '#0F172A', textTransform: 'none', fontSize: 13.5, fontWeight: 600,
            boxShadow: 'none', borderRadius: '6px',
            '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' } }}>
          {mut.isPending ? 'Guardando...' : 'Registrar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── GestionarTiposDialog ─────────────────────────────────────────────────────
function GestionarTiposDialog({ open, onClose, tipos }: {
  open: boolean; onClose: () => void; tipos: TipoIncidente[];
}) {
  const qc = useQueryClient();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');

  const crearMut = useMutation({
    mutationFn: () => incidentsApi.crearTipo(nombre, descripcion || undefined),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['incidentes-tipos'] }); setNombre(''); setDescripcion(''); setError(''); },
    onError: (err: any) => setError(err?.response?.data?.detail ?? 'Error al crear tipo'),
  });
  const eliminarMut = useMutation({
    mutationFn: (id: string) => incidentsApi.eliminarTipo(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['incidentes-tipos'] }),
    onError: (err: any) => setError(err?.response?.data?.detail ?? 'Error al eliminar'),
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography fontWeight={700} fontSize={15.5}>Tipos de novedad</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}><Close fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
        {error && <Typography fontSize={12.5} color="error">{error}</Typography>}
        <Box display="flex" gap={1}>
          <TextField label="Nombre" size="small" value={nombre}
            onChange={e => setNombre(e.target.value)} sx={{ flex: 1 }}
            InputProps={{ sx: { fontSize: 13.5 } }} InputLabelProps={{ sx: { fontSize: 13.5 } }} />
          <Button variant="contained" size="small" disabled={!nombre || crearMut.isPending}
            onClick={() => crearMut.mutate()}
            sx={{ bgcolor: '#0F172A', textTransform: 'none', fontSize: 13, fontWeight: 600,
              boxShadow: 'none', borderRadius: '6px', whiteSpace: 'nowrap',
              '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' } }}>
            Agregar
          </Button>
        </Box>
        <TextField label="Descripción (opcional)" size="small" fullWidth value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          InputProps={{ sx: { fontSize: 13.5 } }} InputLabelProps={{ sx: { fontSize: 13.5 } }} />
        <Divider />
        <List dense disablePadding>
          {tipos.length === 0 && <Typography fontSize={13} color="#94A3B8" sx={{ py: 1 }}>No hay tipos configurados</Typography>}
          {tipos.map(t => (
            <ListItem key={t.id} disableGutters secondaryAction={
              <Tooltip title="Eliminar">
                <IconButton size="small" onClick={() => eliminarMut.mutate(t.id)}
                  disabled={eliminarMut.isPending} sx={{ color: '#94A3B8' }}>
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            }>
              <ListItemText
                primary={<Typography fontSize={13.5} fontWeight={600} color="#0F172A">{t.nombre}</Typography>}
                secondary={t.descripcion ? <Typography fontSize={12} color="#64748B">{t.descripcion}</Typography> : undefined}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ color: '#64748B', textTransform: 'none', fontSize: 13.5 }}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Helpers del drawer ───────────────────────────────────────────────────────
const ESTADO_NEXT_LABEL: Record<EstadoIncidente, string> = {
  reportado:   'Marcar en atención',
  en_atencion: 'Marcar como resuelto',
  resuelto:    'Cerrar novedad',
  cerrado:     '',
};
const TRANSICIONES: Record<EstadoIncidente, EstadoIncidente[]> = {
  reportado:   ['en_atencion'],
  en_atencion: ['resuelto'],
  resuelto:    ['cerrado'],
  cerrado:     [],
};
const ESTADO_CFG: Record<EstadoIncidente, { label: string; bg: string; color: string }> = {
  reportado:   { label: 'Reportado',   bg: '#FEF9C3', color: '#854D0E' },
  en_atencion: { label: 'En atención', bg: '#FEF3C7', color: '#92400E' },
  resuelto:    { label: 'Resuelto',    bg: '#DCFCE7', color: '#15803D' },
  cerrado:     { label: 'Cerrado',     bg: '#F1F5F9', color: '#475569' },
};
const SEVERIDAD_CFG: Record<SeveridadIncidente, { label: string; bg: string; color: string }> = {
  baja:    { label: 'Baja',    bg: '#F0FDF4', color: '#15803D' },
  media:   { label: 'Media',   bg: '#FEF9C3', color: '#854D0E' },
  alta:    { label: 'Alta',    bg: '#FFF7ED', color: '#C2410C' },
  critica: { label: 'Crítica', bg: '#FEF2F2', color: '#B91C1C' },
};

function InfoRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Box display="flex" alignItems="flex-start" gap={1.25}>
      <Box sx={{ color: '#94A3B8', mt: '2px', flexShrink: 0, '& svg': { fontSize: 15 } }}>{icon}</Box>
      <Typography fontSize={13.5} color="#334155" lineHeight={1.55}>{children}</Typography>
    </Box>
  );
}

function DetalleDrawer({ incidenteId, tipoNombre, onClose }: {
  incidenteId: string | null;
  tipoNombre: string;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [nota, setNota] = useState('');

  const { data, isLoading } = useQuery<IncidenteDetalle>({
    queryKey: ['incidente-detalle', incidenteId],
    queryFn: () => incidentsApi.getById(incidenteId!),
    enabled: !!incidenteId,
  });

  const estadoMut = useMutation({
    mutationFn: (nuevoEstado: EstadoIncidente) => incidentsApi.avanzarEstado(incidenteId!, nuevoEstado),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incidentes'] });
      qc.invalidateQueries({ queryKey: ['incidente-detalle', incidenteId] });
    },
  });

  const notaMut = useMutation({
    mutationFn: (desc: string) => incidentsApi.agregarActualizacion(incidenteId!, desc),
    onSuccess: () => {
      setNota('');
      qc.invalidateQueries({ queryKey: ['incidente-detalle', incidenteId] });
    },
  });

  const handleNota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nota.trim()) return;
    notaMut.mutate(nota.trim());
  };

  const siguientes  = data ? TRANSICIONES[data.estado] : [];
  const estadoCfg   = data ? ESTADO_CFG[data.estado]     : null;
  const sevCfg      = data ? SEVERIDAD_CFG[data.severidad] : null;

  return (
    <Drawer anchor="right" open={!!incidenteId} onClose={onClose}
      PaperProps={{ sx: { width: 460, bgcolor: '#F8FAFC', borderLeft: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' } }}>

      {/* ── Header ── */}
      <Box sx={{ px: 3, py: 2.5, bgcolor: 'white', borderBottom: '1px solid #E2E8F0',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box flex={1} minWidth={0}>
          {data && (
            <Typography fontSize={11} fontWeight={700} color="#94A3B8"
              sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5, fontFamily: 'monospace' }}>
              {data.numero_radicado ?? '—'}
            </Typography>
          )}
          <Typography fontWeight={700} fontSize={15} color="#0F172A" lineHeight={1.35}
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {data?.titulo ?? ''}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}
          sx={{ color: '#94A3B8', flexShrink: 0, '&:hover': { color: '#64748B' } }}>
          <Close fontSize="small" />
        </IconButton>
      </Box>

      {isLoading ? (
        <Box flex={1} display="flex" alignItems="center" justifyContent="center">
          <CircularProgress size={28} sx={{ color: '#0F172A' }} />
        </Box>
      ) : data ? (
        <Box flex={1} sx={{ overflowY: 'auto' }}>

          {/* ── Chips estado + severidad + tipo ── */}
          <Box sx={{ px: 3, py: 2, bgcolor: 'white', borderBottom: '1px solid #F1F5F9',
            display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {estadoCfg && (
              <Chip label={estadoCfg.label} size="small" sx={{
                bgcolor: estadoCfg.bg, color: estadoCfg.color,
                fontWeight: 600, fontSize: 12, border: 'none', borderRadius: 1, height: 24,
              }} />
            )}
            {sevCfg && (
              <Chip label={`Severidad: ${sevCfg.label}`} size="small" sx={{
                bgcolor: sevCfg.bg, color: sevCfg.color,
                fontWeight: 600, fontSize: 12, border: 'none', borderRadius: 1, height: 24,
              }} />
            )}
            {tipoNombre && (
              <Chip label={tipoNombre} size="small" sx={{
                bgcolor: '#F1F5F9', color: '#475569',
                fontWeight: 600, fontSize: 12, border: 'none', borderRadius: 1, height: 24,
              }} />
            )}
          </Box>

          {/* ── Info ── */}
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            <InfoRow icon={<CalendarToday />}>
              Reportado el {dayjs(data.created_at).format('DD/MM/YYYY [a las] hh:mm A')}
            </InfoRow>
            {data.ubicacion && <InfoRow icon={<LocationOn />}>{data.ubicacion}</InfoRow>}
            {data.fecha_resolucion && (
              <InfoRow icon={<CheckCircleOutline />}>
                Resuelto el {dayjs(data.fecha_resolucion).format('DD/MM/YYYY [a las] hh:mm A')}
              </InfoRow>
            )}
          </Box>

          <Divider sx={{ mx: 3, borderColor: '#E2E8F0' }} />

          {/* ── Descripción ── */}
          <Box sx={{ px: 3, py: 2.5 }}>
            <Typography fontSize={11} fontWeight={700} color="#94A3B8"
              sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
              Descripción
            </Typography>
            <Typography fontSize={13.5} color="#334155" lineHeight={1.65}>{data.descripcion}</Typography>
          </Box>

          <Divider sx={{ mx: 3, borderColor: '#E2E8F0' }} />

          {/* ── Bitácora ── */}
          <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
            <Typography fontSize={11} fontWeight={700} color="#94A3B8"
              sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5 }}>
              Bitácora
            </Typography>
            <Box display="flex" flexDirection="column" gap={0}>
              {data.actualizaciones.map((act, idx) => (
                <Box key={act.id} display="flex" gap={1.5}>
                  <Box display="flex" flexDirection="column" alignItems="center">
                    <Box sx={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      bgcolor: idx === 0 ? '#2563EB' : '#CBD5E1', mt: '5px',
                    }} />
                    {idx < data.actualizaciones.length - 1 && (
                      <Box sx={{ width: 1, flex: 1, bgcolor: '#E2E8F0', minHeight: 16, mt: 0.5 }} />
                    )}
                  </Box>
                  <Box pb={idx < data.actualizaciones.length - 1 ? 2 : 0}>
                    <Typography fontSize={12} color="#94A3B8" mb={0.25}>
                      {dayjs(act.created_at).format('DD/MM/YY · hh:mm A')}
                    </Typography>
                    <Typography fontSize={13.5} color="#334155" lineHeight={1.5}>{act.descripcion}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* ── Agregar nota ── */}
          {data.estado !== 'cerrado' && (
            <>
              <Divider sx={{ mx: 3, borderColor: '#E2E8F0' }} />
              <Box sx={{ px: 3, py: 2.5 }}>
                <Typography fontSize={11} fontWeight={700} color="#94A3B8"
                  sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
                  Agregar nota
                </Typography>
                <Box component="form" onSubmit={handleNota} sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <InputBase
                    multiline rows={2}
                    placeholder="Escribe una actualización..."
                    value={nota}
                    onChange={e => setNota(e.target.value)}
                    sx={{
                      flex: 1, border: '1px solid #E2E8F0', borderRadius: '6px',
                      px: 1.5, py: 1, fontSize: 13.5, bgcolor: 'white', alignItems: 'flex-start',
                      '&.Mui-focused': { borderColor: '#2563EB', boxShadow: '0 0 0 3px rgba(37,99,235,0.10)' },
                      '& textarea::placeholder': { color: '#94A3B8', opacity: 1 },
                    }}
                  />
                  <IconButton type="submit" disabled={!nota.trim() || notaMut.isPending}
                    sx={{ width: 36, height: 36, bgcolor: '#0F172A', color: 'white', borderRadius: '6px', flexShrink: 0,
                      '&:hover': { bgcolor: '#1E293B' },
                      '&:disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' } }}>
                    {notaMut.isPending
                      ? <CircularProgress size={14} sx={{ color: 'white' }} />
                      : <Send sx={{ fontSize: 15 }} />}
                  </IconButton>
                </Box>
              </Box>
            </>
          )}
        </Box>
      ) : null}

      {/* ── Footer: avanzar estado ── */}
      {data && siguientes.length > 0 && (
        <Box sx={{ px: 3, py: 2, bgcolor: 'white', borderTop: '1px solid #E2E8F0' }}>
          <Button fullWidth variant="contained"
            onClick={() => estadoMut.mutate(siguientes[0])}
            disabled={estadoMut.isPending}
            sx={{ bgcolor: '#0F172A', fontWeight: 700, fontSize: 13.5, textTransform: 'none',
              borderRadius: '6px', py: 1.25, boxShadow: 'none',
              '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' } }}>
            {estadoMut.isPending
              ? <CircularProgress size={16} sx={{ color: 'rgba(255,255,255,0.6)' }} />
              : ESTADO_NEXT_LABEL[data.estado]}
          </Button>
        </Box>
      )}
    </Drawer>
  );
}

// ─── IncidentsPage ────────────────────────────────────────────────────────────
export default function IncidentsPage() {
  const user = useAuthStore(s => s.user);
  const isAdmin = user?.rol === 'administracion' || user?.rol === 'superadmin';

  const [search,       setSearch]       = useState('');
  const [filtroSev,    setFiltroSev]    = useState<SeveridadIncidente | ''>('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoIncidente | ''>('');
  const [page,         setPage]         = useState(0);
  const [selectedId,   setSelectedId]   = useState<string | null>(null);
  const [openCrear,    setOpenCrear]    = useState(false);
  const [openTipos,    setOpenTipos]    = useState(false);

  const { data: incidentes = [], isLoading } = useQuery<IncidenteListItem[]>({
    queryKey: ['incidentes'],
    queryFn: () => incidentsApi.list(),
  });

  const { data: tipos = [] } = useQuery<TipoIncidente[]>({
    queryKey: ['incidentes-tipos'],
    queryFn: incidentsApi.getTipos,
  });

  const q = search.toLowerCase();
  const filtered = useMemo(() =>
    incidentes.filter(i => {
      if (filtroSev && i.severidad !== filtroSev) return false;
      if (filtroEstado && i.estado !== filtroEstado) return false;
      if (q && !([i.titulo, i.numero_radicado, i.nombre_reportado_por].some(f => f?.toLowerCase().includes(q)))) return false;
      return true;
    }),
    [incidentes, filtroSev, filtroEstado, q]
  );

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <Box display="flex" flexDirection="column" gap={2.5}>

      {/* ── Toolbar ── */}
      <Box display="flex" alignItems="center" gap={1.5}>
        <SearchBar
          value={search}
          onChange={v => { setSearch(v); setPage(0); }}
          placeholder="Buscar por título, radicado o reportado por..."
          width={320}
        />
        <Box flex={1} />
        {isAdmin && (
          <Tooltip title="Gestionar tipos de novedad">
            <IconButton onClick={() => setOpenTipos(true)}
              sx={{ color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '6px', p: 0.9 }}>
              <Settings fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCrear(true)}
          sx={{ bgcolor: '#0F172A', color: 'white', fontWeight: 700, fontSize: 13.5,
            px: 2.5, py: 1.1, borderRadius: '6px', boxShadow: 'none', textTransform: 'none',
            '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' } }}>
          Registrar novedad
        </Button>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={filtroSev}
            onChange={e => { setFiltroSev(e.target.value as SeveridadIncidente | ''); setPage(0); }}
            displayEmpty
            startAdornment={<FilterList sx={{ fontSize: 15, color: '#94A3B8', mr: 0.5 }} />}
            sx={{
              fontSize: 13.5, bgcolor: 'white', borderRadius: '6px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
            }}
          >
            <MenuItem value=""><Typography fontSize={13.5} color="#94A3B8">Severidad</Typography></MenuItem>
            <MenuItem value="baja" sx={{ fontSize: 13.5 }}>Baja</MenuItem>
            <MenuItem value="media" sx={{ fontSize: 13.5 }}>Media</MenuItem>
            <MenuItem value="alta" sx={{ fontSize: 13.5 }}>Alta</MenuItem>
            <MenuItem value="critica" sx={{ fontSize: 13.5 }}>Crítica</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={filtroEstado}
            onChange={e => { setFiltroEstado(e.target.value as EstadoIncidente | ''); setPage(0); }}
            displayEmpty
            startAdornment={<FilterList sx={{ fontSize: 15, color: '#94A3B8', mr: 0.5 }} />}
            sx={{
              fontSize: 13.5, bgcolor: 'white', borderRadius: '6px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
            }}
          >
            <MenuItem value=""><Typography fontSize={13.5} color="#94A3B8">Estado</Typography></MenuItem>
            <MenuItem value="reportado" sx={{ fontSize: 13.5 }}>Reportado</MenuItem>
            <MenuItem value="en_atencion" sx={{ fontSize: 13.5 }}>En atención</MenuItem>
            <MenuItem value="resuelto" sx={{ fontSize: 13.5 }}>Resuelto</MenuItem>
            <MenuItem value="cerrado" sx={{ fontSize: 13.5 }}>Cerrado</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* ── Tabla ── */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress size={28} sx={{ color: '#0F172A' }} />
        </Box>
      ) : filtered.length === 0 ? (
        <Box py={10} textAlign="center">
          <ReportProblemOutlined sx={{ fontSize: 36, color: '#E2E8F0', mb: 1, display: 'block', mx: 'auto' }} />
          <Typography fontSize={13.5} color="#94A3B8">
            {q || filtroSev || filtroEstado ? 'Sin resultados para los filtros aplicados' : 'No hay novedades registradas'}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ bgcolor: 'white', borderRadius: 2, border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': TH_SX }}>
                <TableCell>Novedad</TableCell>
                <TableCell>Severidad</TableCell>
                <TableCell>Título</TableCell>
                <TableCell>Reportado por</TableCell>
                <TableCell>Fecha / Hora</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map(inc => (
                <TableRow key={inc.id} onClick={() => setSelectedId(inc.id)}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#F8FAFC' }, '& td': TD_SX, '&:last-child td': { border: 0 } }}>
                  <TableCell>
                    <Typography fontSize={13.5} fontWeight={700} color="#0F172A" fontFamily="monospace">
                      {inc.numero_radicado ?? '—'}
                    </Typography>
                  </TableCell>
                  <TableCell><SevBadge v={inc.severidad} /></TableCell>
                  <TableCell>
                    <Typography fontSize={13.5} color="#334155"
                      sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {inc.titulo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {inc.nombre_reportado_por ?? '—'}
                    {inc.rol_reportado_por && (
                      <Box component="span" sx={{ color: '#94A3B8', fontSize: 12 }}>
                        {' '}({inc.rol_reportado_por.charAt(0).toUpperCase() + inc.rol_reportado_por.slice(1)})
                      </Box>
                    )}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                    {dayjs(inc.created_at).format('DD/MM/YY · hh:mm A')}
                  </TableCell>
                  <TableCell><EstadoBadge v={inc.estado} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length > PAGE_SIZE && (
            <TablePagination component="div" count={filtered.length} page={page}
              onPageChange={(_, p) => setPage(p)} rowsPerPage={PAGE_SIZE} rowsPerPageOptions={[PAGE_SIZE]}
              sx={{ borderTop: '1px solid #F1F5F9',
                '& .MuiTablePagination-toolbar': { minHeight: 44, px: 3 },
                '& .MuiTablePagination-displayedRows': { fontSize: 12.5, color: '#64748B' },
                '& .MuiTablePagination-actions': { ml: 1 } }} />
          )}
        </Box>
      )}

      {/* ── Contador ── */}
      {!isLoading && (
        <Typography fontSize={12.5} color="#94A3B8">
          {filtered.length} {filtered.length === 1 ? 'novedad encontrada' : 'novedades encontradas'}
        </Typography>
      )}

      <DetalleDrawer
        incidenteId={selectedId}
        tipoNombre={selectedId ? (incidentes.find(i => i.id === selectedId)?.tipo_nombre ?? '') : ''}
        onClose={() => setSelectedId(null)}
      />
      <CrearIncidenteDialog open={openCrear} onClose={() => setOpenCrear(false)} tipos={tipos} />
      {isAdmin && <GestionarTiposDialog open={openTipos} onClose={() => setOpenTipos(false)} tipos={tipos} />}
    </Box>
  );
}
