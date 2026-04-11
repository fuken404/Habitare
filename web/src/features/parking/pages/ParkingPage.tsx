import { useState } from 'react';
import {
  Box, Typography, Chip, CircularProgress, Button, Tab, Tabs,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Alert, Switch, Drawer, IconButton, Divider, InputAdornment,
} from '@mui/material';
import {
  Add, DirectionsCar, LocalParking, Close,
  EmojiEvents, PlayArrow, Garage, Settings,
  TwoWheeler, Palette, DriveEta, Search, CheckCircleOutline,
  Campaign, Group, EditNote,
} from '@mui/icons-material';
import {
  communicationsApi, type TipoComunicado,
} from '@/features/communications/api/communicationsApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { useAuthStore } from '@/core/auth/authStore';
import {
  parkingApi,
  type ParqueaderoEstado, type SorteoItem, type UnidadItem,
} from '../api/parkingApi';

dayjs.locale('es');

// ─── Visual tokens ─────────────────────────────────────────────────────────────
const TIPO_CFG = {
  cubierto:    { label: 'Cubierto',    bg: '#DBEAFE', color: '#1D4ED8' },
  descubierto: { label: 'Descubierto', bg: '#FEF9C3', color: '#A16207' },
} as const;

const ESTADO_SORTEO_CFG: Record<string, { label: string; bg: string; color: string }> = {
  programado: { label: 'Programado', bg: '#DBEAFE', color: '#1D4ED8' },
  ejecutado:  { label: 'Ejecutado',  bg: '#DCFCE7', color: '#15803D' },
  cancelado:  { label: 'Cancelado',  bg: '#F1F5F9', color: '#64748B' },
};

// ─── Stat card ─────────────────────────────────────────────────────────────────
type FiltroEstado = 'todos' | 'ocupados' | 'libres' | 'cubiertos' | 'descubiertos';

function StatCard({
  label, value, color = '#0F172A', active = false, onClick,
}: {
  label: string;
  value: number;
  color?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Box onClick={onClick} sx={{
      bgcolor: active ? '#0F172A' : 'white',
      border: `1px solid ${active ? '#0F172A' : '#E2E8F0'}`,
      borderRadius: 2, px: 3, py: 2, minWidth: 130, flex: 1,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.15s',
      '&:hover': onClick ? { borderColor: '#94A3B8', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' } : {},
    }}>
      <Typography fontSize={26} fontWeight={800} lineHeight={1}
        color={active ? 'white' : color}>{value}</Typography>
      <Typography fontSize={12} mt={0.5}
        color={active ? '#CBD5E1' : '#64748B'}>{label}</Typography>
    </Box>
  );
}

// ─── Parking card ──────────────────────────────────────────────────────────────
function ParqueaderoCard({
  p, onAsignar, onLiberar, showActions,
}: {
  p: ParqueaderoEstado;
  onAsignar: (p: ParqueaderoEstado) => void;
  onLiberar: (p: ParqueaderoEstado) => void;
  showActions: boolean;
}) {
  const tipo = TIPO_CFG[p.tipo];
  return (
    <Box sx={{
      bgcolor: 'white', border: `1px solid ${p.is_ocupado ? '#E2E8F0' : '#E2E8F0'}`,
      borderRadius: 2, p: 2, display: 'flex', flexDirection: 'column', gap: 1.5,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Status strip */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        bgcolor: p.is_ocupado ? '#EF4444' : '#10B981',
      }} />

      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mt={0.5}>
        <Box>
          <Typography fontSize={22} fontWeight={800} color="#0F172A" lineHeight={1}>
            {p.numero}
          </Typography>
        </Box>
        <Chip label={tipo.label} size="small"
          sx={{ bgcolor: tipo.bg, color: tipo.color, fontWeight: 700, fontSize: 11,
            borderRadius: 1, border: 'none' }} />
      </Box>

      {p.is_ocupado ? (
        <Box>
          <Box display="flex" alignItems="center" gap={0.5} mb={0.25}>
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#EF4444' }} />
            <Typography fontSize={11.5} fontWeight={700} color="#EF4444">Ocupado</Typography>
          </Box>
          <Typography fontSize={12} color="#64748B">
            Unidad {p.numero_unidad ?? '—'}
            {p.nombre_torre && ` · ${p.nombre_torre}`}
          </Typography>
        </Box>
      ) : (
        <Box display="flex" alignItems="center" gap={0.5}>
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#10B981' }} />
          <Typography fontSize={11.5} fontWeight={700} color="#10B981">Disponible</Typography>
        </Box>
      )}

      {showActions && (p.is_ocupado ? (
        <Button size="small" onClick={() => onLiberar(p)}
          sx={{ textTransform: 'none', fontSize: 12, color: '#DC2626',
            borderRadius: 1, border: '1px solid #FECACA',
            '&:hover': { bgcolor: '#FEF2F2' } }}>
          Liberar
        </Button>
      ) : (
        <Button size="small" onClick={() => onAsignar(p)}
          sx={{ textTransform: 'none', fontSize: 12, color: '#0F172A',
            borderRadius: 1, border: '1px solid #E2E8F0',
            '&:hover': { bgcolor: '#F8FAFC' } }}>
          Asignar
        </Button>
      ))}
    </Box>
  );
}

// ─── Nuevo parqueadero dialog ──────────────────────────────────────────────────
function NuevoParqueaderoDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [numero, setNumero] = useState('');
  const [tipo, setTipo]     = useState<'cubierto' | 'descubierto'>('cubierto');
  const [nivel, setNivel]   = useState('');

  const mut = useMutation({
    mutationFn: () => parkingApi.crearParqueadero({
      numero: numero.trim(),
      tipo,
      nivel: nivel ? parseInt(nivel) : null,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parking-estado'] });
      setNumero(''); setTipo('cubierto'); setNivel('');
      onClose();
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 2.5 } }}>
      <DialogTitle sx={{ fontSize: 16, fontWeight: 700, pb: 1 }}>
        Nuevo parqueadero
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        <TextField label="Número / código" value={numero}
          onChange={e => setNumero(e.target.value)} size="small" fullWidth
          placeholder="Ej. P-01, A12..." />
        <FormControl size="small" fullWidth>
          <InputLabel>Tipo</InputLabel>
          <Select label="Tipo" value={tipo}
            onChange={e => setTipo(e.target.value as 'cubierto' | 'descubierto')}>
            <MenuItem value="cubierto">Cubierto</MenuItem>
            <MenuItem value="descubierto">Descubierto</MenuItem>
          </Select>
        </FormControl>
        <TextField label="Nivel (opcional)" value={nivel} type="number"
          onChange={e => setNivel(e.target.value)} size="small" fullWidth
          placeholder="Ej. 1, 2, -1..." />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: '#64748B' }}>Cancelar</Button>
        <Button variant="contained" disabled={!numero.trim() || mut.isPending}
          onClick={() => mut.mutate()}
          sx={{ textTransform: 'none', bgcolor: '#0F172A', borderRadius: 1.5, boxShadow: 'none',
            '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' } }}>
          {mut.isPending ? 'Creando...' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Asignar dialog ────────────────────────────────────────────────────────────
function AsignarDialog({
  parqueadero, onClose,
}: {
  parqueadero: ParqueaderoEstado | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [unidadId, setUnidadId] = useState('');

  const { data: unidades = [] } = useQuery<UnidadItem[]>({
    queryKey: ['unidades-lista'],
    queryFn: parkingApi.listarUnidades,
    enabled: !!parqueadero,
  });

  const mut = useMutation({
    mutationFn: () => parkingApi.asignarParqueadero(parqueadero!.id, unidadId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parking-estado'] });
      setUnidadId('');
      onClose();
    },
  });

  return (
    <Dialog open={!!parqueadero} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 2.5 } }}>
      <DialogTitle sx={{ fontSize: 16, fontWeight: 700, pb: 1 }}>
        Asignar parqueadero {parqueadero?.numero}
      </DialogTitle>
      <DialogContent sx={{ pt: '8px !important' }}>
        <FormControl size="small" fullWidth>
          <InputLabel>Unidad</InputLabel>
          <Select label="Unidad" value={unidadId} onChange={e => setUnidadId(e.target.value)}>
            {unidades.map(u => (
              <MenuItem key={u.id} value={u.id} sx={{ fontSize: 13.5 }}>
                Unidad {u.numero}{u.nombre_torre ? ` · ${u.nombre_torre}` : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: '#64748B' }}>Cancelar</Button>
        <Button variant="contained" disabled={!unidadId || mut.isPending}
          onClick={() => mut.mutate()}
          sx={{ textTransform: 'none', bgcolor: '#0F172A', borderRadius: 1.5, boxShadow: 'none',
            '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' } }}>
          {mut.isPending ? 'Asignando...' : 'Asignar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Tokens de tipos de comunicado ────────────────────────────────────────────
const TIPO_COM_CFG: Record<TipoComunicado, { label: string; bg: string; color: string }> = {
  informativo:   { label: 'Informativo',   bg: '#DBEAFE', color: '#1D4ED8' },
  urgente:       { label: 'Urgente',       bg: '#FEE2E2', color: '#DC2626' },
  evento:        { label: 'Evento',        bg: '#DCFCE7', color: '#15803D' },
  mantenimiento: { label: 'Mantenimiento', bg: '#FFEDD5', color: '#C2410C' },
};

// ─── Crear sorteo dialog (dos pasos) ──────────────────────────────────────────
function CrearSorteoDialog({
  open, onClose, cuposDisponibles,
}: {
  open: boolean;
  onClose: () => void;
  cuposDisponibles: number;
}) {
  const qc = useQueryClient();

  // Paso 0 = config sorteo | Paso 1 = comunicado
  const [paso, setPaso] = useState<0 | 1>(0);

  // Paso 0 — datos del sorteo
  const [fechaSorteo, setFechaSorteo] = useState(dayjs().add(14, 'day').format('YYYY-MM-DD'));
  const [fechaLimite, setFechaLimite] = useState(dayjs().add(7, 'day').format('YYYY-MM-DD'));

  // Paso 1 — comunicado
  const [titulo, setTitulo]     = useState('Sorteo de parqueaderos residentes');
  const [tipo, setTipo]         = useState<TipoComunicado>('informativo');
  const [contenido, setContenido] = useState('');
  const [confirmado, setConfirmado] = useState(false);

  const generarContenido = (fs: string, fl: string) => {
    const fsFmt = dayjs(fs).format('DD [de] MMMM [de] YYYY');
    const flFmt = fl ? dayjs(fl).format('DD [de] MMMM [de] YYYY') : null;
    return [
      `Se realizará un sorteo de rotación de parqueaderos el ${fsFmt}.`,
      `Hay ${cuposDisponibles} cupo${cuposDisponibles !== 1 ? 's' : ''} disponible${cuposDisponibles !== 1 ? 's' : ''} para asignación.`,
      flFmt ? `Las inscripciones estarán abiertas hasta el ${flFmt}.` : '',
      '',
      'Si deseas participar, inscríbete a través de la aplicación antes de la fecha límite.',
    ].filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n').trim();
  };

  const avanzarAComunicado = () => {
    setContenido(generarContenido(fechaSorteo, fechaLimite));
    setPaso(1);
  };

  const volverAtras = () => setPaso(0);

  const resetear = () => {
    setPaso(0);
    setFechaSorteo(dayjs().add(14, 'day').format('YYYY-MM-DD'));
    setFechaLimite(dayjs().add(7, 'day').format('YYYY-MM-DD'));
    setTitulo('Sorteo de parqueaderos residentes');
    setTipo('informativo');
    setContenido('');
    setConfirmado(false);
  };

  // Crea sorteo + comunicado juntos al confirmar
  const confirmarMut = useMutation({
    mutationFn: async () => {
      await parkingApi.crearSorteo({
        fecha_sorteo: fechaSorteo,
        fecha_limite_inscripcion: fechaLimite || null,
        n_cupos: cuposDisponibles,
      });
      await communicationsApi.crear({
        titulo,
        contenido,
        tipo,
        segmentaciones: [{ tipo: 'todos' }],
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parking-sorteos'] });
      qc.invalidateQueries({ queryKey: ['comunicados'] });
      setConfirmado(true);
    },
  });

  const tipoCfg = TIPO_COM_CFG[tipo];

  // Al cerrar, resetear estado
  const handleClose = () => { resetear(); onClose(); };

  return (
    <Dialog
      open={open}
      onClose={paso === 0 ? handleClose : (confirmado ? handleClose : undefined)}
      disableEscapeKeyDown={paso === 1 && !confirmado}
      maxWidth={paso === 0 ? 'xs' : 'sm'} fullWidth
      PaperProps={{ sx: { borderRadius: 2.5 } }}
    >
      {/* ── Paso 0: configurar sorteo ── */}
      {paso === 0 && (
        <>
          <DialogTitle sx={{ fontSize: 16, fontWeight: 700, pb: 1 }}>Crear sorteo</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
            <Box sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 1.5,
              px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography fontSize={13} color="#64748B">Cupos disponibles</Typography>
              <Typography fontSize={15} fontWeight={800} color="#0F172A">{cuposDisponibles}</Typography>
            </Box>
            <TextField label="Fecha del sorteo" type="date" value={fechaSorteo}
              onChange={e => setFechaSorteo(e.target.value)} size="small" fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: dayjs().add(1, 'day').format('YYYY-MM-DD') }} />
            <TextField label="Fecha límite de inscripción" type="date" value={fechaLimite}
              onChange={e => setFechaLimite(e.target.value)} size="small" fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: dayjs().format('YYYY-MM-DD'), max: fechaSorteo }}
              helperText="Hasta cuándo pueden inscribirse los residentes" />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={handleClose} sx={{ textTransform: 'none', color: '#64748B' }}>Cancelar</Button>
            <Button variant="contained"
              disabled={!fechaSorteo || cuposDisponibles < 1}
              onClick={avanzarAComunicado}
              sx={{ textTransform: 'none', bgcolor: '#0F172A', borderRadius: 1.5, boxShadow: 'none',
                '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' } }}>
              Continuar
            </Button>
          </DialogActions>
        </>
      )}

      {/* ── Paso 1: comunicado ── */}
      {paso === 1 && (
        <>
          <DialogTitle sx={{ pb: 1 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={1.5}>
                {confirmado
                  ? <CheckCircleOutline sx={{ color: '#10B981', fontSize: 20 }} />
                  : <Campaign sx={{ fontSize: 20, color: '#64748B' }} />}
                <Typography fontSize={15.5} fontWeight={700} color="#0F172A">
                  {confirmado ? 'Sorteo y comunicado creados' : 'Borrador del comunicado'}
                </Typography>
              </Box>
              {confirmado && (
                <IconButton onClick={handleClose} size="small" sx={{ color: '#94A3B8' }}>
                  <Close fontSize="small" />
                </IconButton>
              )}
            </Box>
            <Typography fontSize={12.5} color="#64748B" mt={0.5} ml={confirmado ? 4 : 0}>
              {confirmado
                ? 'El borrador quedó guardado en Comunicados. Publícalo cuando estés listo.'
                : 'Revisa y ajusta el comunicado. Al confirmar se guardarán el sorteo y el borrador.'}
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ pt: '4px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Chips meta */}
            <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
              <Chip label="Borrador" size="small"
                sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 700,
                  fontSize: 11.5, borderRadius: 1, border: 'none' }} />
              <Chip icon={<Group sx={{ fontSize: 13, ml: '6px !important' }} />}
                label="Todos los residentes" size="small"
                sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 600,
                  fontSize: 11.5, borderRadius: 1, border: 'none' }} />
              <Chip label={tipoCfg.label} size="small"
                sx={{ bgcolor: tipoCfg.bg, color: tipoCfg.color, fontWeight: 700,
                  fontSize: 11.5, borderRadius: 1, border: 'none' }} />
            </Box>

            {/* Comunicado editable */}
            <Box sx={{ bgcolor: 'white', border: '1px solid #E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ bgcolor: '#F8FAFC', px: 2.5, py: 1.5, borderBottom: '1px solid #E2E8F0',
                display: 'flex', alignItems: 'center', gap: 1 }}>
                <Campaign sx={{ fontSize: 16, color: '#94A3B8' }} />
                <Typography fontSize={11} fontWeight={700} color="#94A3B8"
                  textTransform="uppercase" letterSpacing="0.06em">
                  Vista previa · Comunicado
                </Typography>
                {!confirmado && (
                  <>
                    <EditNote sx={{ fontSize: 15, color: '#CBD5E1', ml: 'auto' }} />
                    <Typography fontSize={11} color="#CBD5E1">Editable</Typography>
                  </>
                )}
              </Box>

              <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl size="small" fullWidth disabled={confirmado}>
                  <InputLabel sx={{ fontSize: 13 }}>Tipo</InputLabel>
                  <Select label="Tipo" value={tipo}
                    onChange={e => setTipo(e.target.value as TipoComunicado)}
                    sx={{ fontSize: 13.5 }}>
                    {(Object.keys(TIPO_COM_CFG) as TipoComunicado[]).map(t => (
                      <MenuItem key={t} value={t} sx={{ fontSize: 13.5 }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%',
                            bgcolor: TIPO_COM_CFG[t].color, flexShrink: 0 }} />
                          {TIPO_COM_CFG[t].label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField label="Título" value={titulo} size="small" fullWidth
                  disabled={confirmado}
                  onChange={e => setTitulo(e.target.value)}
                  inputProps={{ style: { fontSize: 13.5, fontWeight: 700 } }}
                  InputLabelProps={{ style: { fontSize: 13 } }} />

                <TextField label="Contenido" value={contenido} size="small" fullWidth
                  multiline rows={6} disabled={confirmado}
                  onChange={e => setContenido(e.target.value)}
                  inputProps={{ style: { fontSize: 13.5, lineHeight: 1.7 } }}
                  InputLabelProps={{ style: { fontSize: 13 } }} />

                {!confirmado && (
                  <Box sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 1.5,
                    px: 2, py: 1.5 }}>
                    <Typography fontSize={12} color="#64748B">
                      El comunicado se creará como <strong>borrador</strong> y será visible para{' '}
                      <strong>todos los residentes</strong> al publicarlo.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {confirmado && (
              <Alert severity="success" sx={{ borderRadius: 1.5, fontSize: 13 }}>
                Puedes publicar el comunicado desde la sección de Comunicados.
              </Alert>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
            {confirmado ? (
              <Button onClick={handleClose}
                sx={{ textTransform: 'none', color: '#64748B' }}>
                Cerrar
              </Button>
            ) : (
              <Button startIcon={<Close sx={{ fontSize: 15 }} />}
                onClick={volverAtras}
                sx={{ textTransform: 'none', fontSize: 13, color: '#64748B',
                  border: '1px solid #E2E8F0', borderRadius: 1.5,
                  '&:hover': { bgcolor: '#F8FAFC' } }}>
                Atrás
              </Button>
            )}
            {!confirmado && (
              <Button variant="contained"
                disabled={!titulo.trim() || !contenido.trim() || confirmarMut.isPending}
                onClick={() => confirmarMut.mutate()}
                sx={{ textTransform: 'none', fontSize: 13, bgcolor: '#0F172A', borderRadius: 1.5,
                  boxShadow: 'none', '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' } }}>
                {confirmarMut.isPending ? 'Guardando...' : 'Confirmar y guardar'}
              </Button>
            )}
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

// ─── Sorteo card ───────────────────────────────────────────────────────────────
function SorteoCard({ sorteo }: { sorteo: SorteoItem }) {
  const qc = useQueryClient();
  const [confirmar, setConfirmar] = useState(false);
  const cfg = ESTADO_SORTEO_CFG[sorteo.estado];
  const ganadores = sorteo.participaciones.filter(p => p.es_ganador);
  const perdedores = sorteo.participaciones.filter(p => !p.es_ganador);

  const ejecutarMut = useMutation({
    mutationFn: () => parkingApi.ejecutarSorteo(sorteo.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parking-sorteos'] });
      setConfirmar(false);
    },
  });

  return (
    <Box sx={{ bgcolor: 'white', border: '1px solid #E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #F1F5F9',
        display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box flex={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography fontSize={15} fontWeight={700} color="#0F172A">
              Sorteo {dayjs(sorteo.fecha_sorteo).format('DD [de] MMMM [de] YYYY')}
            </Typography>
            <Chip label={cfg.label} size="small"
              sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700,
                fontSize: 11, borderRadius: 1, border: 'none' }} />
          </Box>
          <Typography fontSize={12.5} color="#64748B" mt={0.25}>
            {sorteo.n_cupos} cupos · {sorteo.participaciones.length} inscritos
          </Typography>
        </Box>
        {sorteo.estado === 'programado' && (
          !confirmar ? (
            <Button size="small" startIcon={<PlayArrow sx={{ fontSize: 15 }} />}
              onClick={() => setConfirmar(true)}
              disabled={sorteo.participaciones.length === 0}
              sx={{ textTransform: 'none', fontSize: 12.5, color: '#0F172A',
                border: '1px solid #E2E8F0', borderRadius: 1.5,
                '&:hover': { bgcolor: '#F8FAFC' } }}>
              Ejecutar sorteo
            </Button>
          ) : (
            <Box display="flex" alignItems="center" gap={1}>
              <Typography fontSize={12} color="#64748B">¿Ejecutar ahora?</Typography>
              <Button size="small" onClick={() => ejecutarMut.mutate()}
                disabled={ejecutarMut.isPending}
                sx={{ textTransform: 'none', fontSize: 12, color: 'white',
                  bgcolor: '#0F172A', borderRadius: 1.5, px: 1.5,
                  '&:hover': { bgcolor: '#1E293B' } }}>
                {ejecutarMut.isPending ? '...' : 'Sí'}
              </Button>
              <Button size="small" onClick={() => setConfirmar(false)}
                sx={{ textTransform: 'none', fontSize: 12, color: '#64748B',
                  borderRadius: 1.5, '&:hover': { bgcolor: '#F1F5F9' } }}>
                No
              </Button>
            </Box>
          )
        )}
      </Box>

      {/* Participantes */}
      {sorteo.participaciones.length === 0 ? (
        <Box px={3} py={2}>
          <Typography fontSize={12.5} color="#94A3B8">Sin inscritos aún.</Typography>
        </Box>
      ) : (
        <Box sx={{ px: 3, py: 2, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {/* Ganadores primero */}
          {ganadores.map(p => (
            <Box key={p.id} display="flex" alignItems="center" gap={1.5}
              sx={{ py: 0.75, px: 1.5, borderRadius: 1.5,
                bgcolor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <EmojiEvents sx={{ fontSize: 16, color: '#15803D' }} />
              <Typography fontSize={13} fontWeight={700} color="#15803D" flex={1}>
                Unidad {p.numero_unidad ?? p.unidad_id.slice(0, 8)}
              </Typography>
              <Chip label="Ganador" size="small"
                sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 700,
                  fontSize: 10.5, borderRadius: 1, border: 'none' }} />
            </Box>
          ))}
          {/* Perdedores */}
          {perdedores.map(p => (
            <Box key={p.id} display="flex" alignItems="center" gap={1.5}
              sx={{ py: 0.75, px: 1.5, borderRadius: 1.5,
                bgcolor: sorteo.estado === 'ejecutado' ? '#F8FAFC' : 'white',
                border: '1px solid #F1F5F9' }}>
              <DirectionsCar sx={{ fontSize: 16, color: '#94A3B8' }} />
              <Typography fontSize={13} color={sorteo.estado === 'ejecutado' ? '#94A3B8' : '#0F172A'} flex={1}>
                Unidad {p.numero_unidad ?? p.unidad_id.slice(0, 8)}
              </Typography>
              {sorteo.estado === 'ejecutado' && (
                <Typography fontSize={11} color="#CBD5E1">No ganó</Typography>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ─── Detalle drawer ────────────────────────────────────────────────────────────
function ParqueaderoDetalleDrawer({
  parqueadero, puedeGestionar, onClose, onAsignar, onLiberar,
}: {
  parqueadero: ParqueaderoEstado | null;
  puedeGestionar: boolean;
  onClose: () => void;
  onAsignar: (p: ParqueaderoEstado) => void;
  onLiberar: (p: ParqueaderoEstado) => void;
}) {
  const { data: vehiculos = [], isLoading } = useQuery({
    queryKey: ['parking-vehiculos-unidad', parqueadero?.unidad_id],
    queryFn: () => parkingApi.listarVehiculos(),
    select: data => data.filter(v => v.unidad_id === parqueadero?.unidad_id),
    enabled: !!parqueadero?.unidad_id && parqueadero.is_ocupado,
  });

  const tipo = parqueadero ? TIPO_CFG[parqueadero.tipo] : null;

  const InfoRow = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
    <Box display="flex" justifyContent="space-between" alignItems="center" py={1}
      sx={{ borderBottom: '1px solid #F1F5F9' }}>
      <Typography fontSize={12.5} color="#64748B">{label}</Typography>
      <Typography fontSize={13} fontWeight={600} color="#0F172A">{value ?? '—'}</Typography>
    </Box>
  );

  return (
    <Drawer anchor="right" open={!!parqueadero} onClose={onClose}
      PaperProps={{ sx: { width: 380, display: 'flex', flexDirection: 'column',
        bgcolor: '#F8FAFC', borderLeft: '1px solid #E2E8F0' } }}>

      {parqueadero && (
        <>
          {/* Header */}
          <Box sx={{ px: 3, py: 2.5, bgcolor: 'white', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
            <Box display="flex" alignItems="flex-start" justifyContent="space-between">
              <Box>
                <Typography fontSize={11} color="#94A3B8" fontWeight={700}
                  textTransform="uppercase" letterSpacing="0.08em">
                  Parqueadero
                </Typography>
                <Typography fontSize={28} fontWeight={800} color="#0F172A" lineHeight={1.1}>
                  {parqueadero.numero}
                </Typography>
                <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                  {tipo && (
                    <Chip label={tipo.label} size="small"
                      sx={{ bgcolor: tipo.bg, color: tipo.color, fontWeight: 700,
                        fontSize: 11.5, borderRadius: 1, border: 'none' }} />
                  )}
                  <Chip
                    label={parqueadero.is_ocupado ? 'Ocupado' : 'Disponible'}
                    size="small"
                    sx={{
                      bgcolor: parqueadero.is_ocupado ? '#FEE2E2' : '#DCFCE7',
                      color: parqueadero.is_ocupado ? '#DC2626' : '#15803D',
                      fontWeight: 700, fontSize: 11.5, borderRadius: 1, border: 'none',
                    }}
                  />
                </Box>
              </Box>
              <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}>
                <Close fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Cuerpo */}
          <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>

            {/* Info general */}
            <Typography fontSize={11} fontWeight={700} color="#94A3B8"
              textTransform="uppercase" letterSpacing="0.06em" mb={1}>
              Información
            </Typography>
            <Box sx={{ bgcolor: 'white', border: '1px solid #E2E8F0', borderRadius: 2, px: 2, mb: 3 }}>
              <InfoRow label="Número" value={parqueadero.numero} />
              <InfoRow label="Tipo" value={tipo?.label} />
              {parqueadero.is_ocupado && (
                <InfoRow label="Unidad asignada"
                  value={[parqueadero.numero_unidad, parqueadero.nombre_torre].filter(Boolean).join(' · ')} />
              )}
            </Box>

            {/* Vehículo */}
            {parqueadero.is_ocupado && (
              <>
                <Typography fontSize={11} fontWeight={700} color="#94A3B8"
                  textTransform="uppercase" letterSpacing="0.06em" mb={1}>
                  Vehículo(s) registrado(s)
                </Typography>
                {isLoading ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress size={22} sx={{ color: '#0F172A' }} />
                  </Box>
                ) : vehiculos.length === 0 ? (
                  <Box sx={{ bgcolor: 'white', border: '1px solid #E2E8F0', borderRadius: 2,
                    py: 4, textAlign: 'center' }}>
                    <Typography fontSize={13} color="#94A3B8">Sin vehículos registrados para esta unidad</Typography>
                  </Box>
                ) : (
                  <Box display="flex" flexDirection="column" gap={1.5}>
                    {vehiculos.map(v => (
                      <Box key={v.id} sx={{ bgcolor: 'white', border: '1px solid #E2E8F0',
                        borderRadius: 2, px: 2, py: 1.5 }}>
                        <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                          {v.tipo === 'automovil'
                            ? <DriveEta sx={{ fontSize: 22, color: '#64748B' }} />
                            : <TwoWheeler sx={{ fontSize: 22, color: '#64748B' }} />}
                          <Box>
                            <Typography fontSize={14} fontWeight={800} color="#0F172A"
                              fontFamily="monospace">
                              {v.placa}
                            </Typography>
                            <Typography fontSize={11.5} color="#64748B">
                              {v.tipo === 'automovil' ? 'Automóvil' : 'Motocicleta'}
                            </Typography>
                          </Box>
                        </Box>
                        <Divider sx={{ mb: 1 }} />
                        <Box display="flex" flexDirection="column" gap={0.25}>
                          {v.marca && (
                            <Box display="flex" justifyContent="space-between">
                              <Typography fontSize={12} color="#94A3B8">Marca</Typography>
                              <Typography fontSize={12.5} fontWeight={600} color="#0F172A">{v.marca}</Typography>
                            </Box>
                          )}
                          {v.modelo && (
                            <Box display="flex" justifyContent="space-between">
                              <Typography fontSize={12} color="#94A3B8">Modelo</Typography>
                              <Typography fontSize={12.5} fontWeight={600} color="#0F172A">{v.modelo}</Typography>
                            </Box>
                          )}
                          {v.color && (
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                              <Typography fontSize={12} color="#94A3B8">Color</Typography>
                              <Box display="flex" alignItems="center" gap={0.75}>
                                <Palette sx={{ fontSize: 13, color: '#94A3B8' }} />
                                <Typography fontSize={12.5} fontWeight={600} color="#0F172A">{v.color}</Typography>
                              </Box>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </>
            )}
          </Box>

          {/* Footer acciones */}
          {puedeGestionar && (
            <Box sx={{ px: 3, py: 2, bgcolor: 'white', borderTop: '1px solid #E2E8F0', flexShrink: 0 }}>
              {parqueadero.is_ocupado ? (
                <Button fullWidth onClick={() => { onLiberar(parqueadero); onClose(); }}
                  sx={{ textTransform: 'none', fontSize: 13.5, color: '#DC2626',
                    border: '1px solid #FECACA', borderRadius: 1.5,
                    '&:hover': { bgcolor: '#FEF2F2' } }}>
                  Liberar parqueadero
                </Button>
              ) : (
                <Button fullWidth onClick={() => { onAsignar(parqueadero); onClose(); }}
                  variant="contained"
                  sx={{ textTransform: 'none', fontSize: 13.5, bgcolor: '#0F172A',
                    borderRadius: 1.5, boxShadow: 'none',
                    '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' } }}>
                  Asignar parqueadero
                </Button>
              )}
            </Box>
          )}
        </>
      )}
    </Drawer>
  );
}

// ─── Tab Parqueaderos ──────────────────────────────────────────────────────────
function TabParqueaderos({ isAdmin, requiereSorteo }: { isAdmin: boolean; requiereSorteo: boolean }) {
  const qc = useQueryClient();
  const [detalle, setDetalle]           = useState<ParqueaderoEstado | null>(null);
  const [asignarA, setAsignarA]         = useState<ParqueaderoEstado | null>(null);
  const [liberarConfirm, setLiberar]    = useState<ParqueaderoEstado | null>(null);
  const [filtro, setFiltro]             = useState<FiltroEstado>('todos');
  const [busqueda, setBusqueda]         = useState('');

  const { data: espacios = [], isLoading } = useQuery({
    queryKey: ['parking-estado'],
    queryFn: parkingApi.getEstadoResidentes,
  });

  const liberarMut = useMutation({
    mutationFn: (p: ParqueaderoEstado) => parkingApi.liberarParqueadero(p.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parking-estado'] });
      setLiberar(null);
    },
  });

  const total      = espacios.length;
  const ocupados   = espacios.filter(p => p.is_ocupado).length;
  const libres     = total - ocupados;
  const cubiertos  = espacios.filter(p => p.tipo === 'cubierto').length;
  const descub     = espacios.filter(p => p.tipo === 'descubierto').length;

  // Solo el admin puede asignar/liberar manualmente cuando NO está activo el sistema de sorteos
  const puedeGestionar = isAdmin && !requiereSorteo;

  const toggleFiltro = (f: FiltroEstado) => setFiltro(prev => prev === f ? 'todos' : f);

  const query = busqueda.trim().toLowerCase();

  const espaciosFiltrados = espacios.filter(p => {
    if (filtro === 'ocupados')     return p.is_ocupado;
    if (filtro === 'libres')       return !p.is_ocupado;
    if (filtro === 'cubiertos')    return p.tipo === 'cubierto';
    if (filtro === 'descubiertos') return p.tipo === 'descubierto';
    return true;
  }).filter(p => {
    if (!query) return true;
    return (
      p.numero.toLowerCase().includes(query) ||
      (p.numero_unidad ?? '').toLowerCase().includes(query) ||
      (p.nombre_torre ?? '').toLowerCase().includes(query)
    );
  });

  return (
    <Box display="flex" flexDirection="column" gap={2.5}>
      {/* Stats — clickable filters */}
      <Box display="flex" gap={2} flexWrap="wrap">
        <StatCard label="Total" value={total}
          active={filtro === 'todos'} onClick={() => toggleFiltro('todos')} />
        <StatCard label="Ocupados" value={ocupados} color="#EF4444"
          active={filtro === 'ocupados'} onClick={() => toggleFiltro('ocupados')} />
        <StatCard label="Disponibles" value={libres} color="#10B981"
          active={filtro === 'libres'} onClick={() => toggleFiltro('libres')} />
        <StatCard label="Cubiertos" value={cubiertos} color="#1D4ED8"
          active={filtro === 'cubiertos'} onClick={() => toggleFiltro('cubiertos')} />
        <StatCard label="Descubiertos" value={descub} color="#A16207"
          active={filtro === 'descubiertos'} onClick={() => toggleFiltro('descubiertos')} />
      </Box>

      {/* Toolbar */}
      <TextField
        size="small"
        placeholder="Buscar por número, unidad o torre…"
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ fontSize: 17, color: '#94A3B8' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 1.5, bgcolor: 'white', fontSize: 13.5,
            '& fieldset': { borderColor: '#E2E8F0' },
          },
        }}
      />

      {/* Banner — sorteo activo */}
      {isAdmin && requiereSorteo && (
        <Alert severity="info" icon={<EmojiEvents sx={{ fontSize: 18 }} />}
          sx={{ borderRadius: 1.5, fontSize: 13, alignItems: 'center' }}>
          El sistema de sorteos está activo. Las asignaciones se gestionan mediante sorteos de rotación.
        </Alert>
      )}

      {/* Grid */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress size={26} sx={{ color: '#0F172A' }} />
        </Box>
      ) : espacios.length === 0 ? (
        <Box sx={{ bgcolor: 'white', border: '1px solid #E2E8F0', borderRadius: 2,
          py: 8, textAlign: 'center' }}>
          <Garage sx={{ fontSize: 40, color: '#E2E8F0', mb: 1 }} />
          <Typography fontSize={14} color="#94A3B8">
            No hay parqueaderos registrados
          </Typography>
        </Box>
      ) : espaciosFiltrados.length === 0 ? (
        <Box sx={{ bgcolor: 'white', border: '1px solid #E2E8F0', borderRadius: 2,
          py: 6, textAlign: 'center' }}>
          <Typography fontSize={14} color="#94A3B8">
            Ningún parqueadero coincide con el filtro seleccionado
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 2 }}>
          {espaciosFiltrados.map(p => (
            <Box key={p.id} onClick={() => setDetalle(p)} sx={{ cursor: 'pointer' }}>
              <ParqueaderoCard p={p}
                onAsignar={puedeGestionar ? setAsignarA : () => {}}
                onLiberar={puedeGestionar ? setLiberar : () => {}}
                showActions={puedeGestionar} />
            </Box>
          ))}
        </Box>
      )}

      {/* Confirm liberar */}
      <Dialog open={!!liberarConfirm} onClose={() => setLiberar(null)}
        maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2.5 } }}>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700, pb: 1 }}>
          Liberar parqueadero {liberarConfirm?.numero}
        </DialogTitle>
        <DialogContent>
          <Typography fontSize={13.5} color="#64748B">
            ¿Confirmar que la unidad{' '}
            <strong>{liberarConfirm?.numero_unidad}</strong> desocupó este espacio?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setLiberar(null)}
            sx={{ textTransform: 'none', color: '#64748B' }}>Cancelar</Button>
          <Button variant="contained" disabled={liberarMut.isPending}
            onClick={() => liberarMut.mutate(liberarConfirm!)}
            sx={{ textTransform: 'none', bgcolor: '#EF4444', borderRadius: 1.5,
              boxShadow: 'none', '&:hover': { bgcolor: '#DC2626', boxShadow: 'none' } }}>
            {liberarMut.isPending ? '...' : 'Liberar'}
          </Button>
        </DialogActions>
      </Dialog>

      <ParqueaderoDetalleDrawer
        parqueadero={detalle}
        puedeGestionar={puedeGestionar}
        onClose={() => setDetalle(null)}
        onAsignar={p => { setDetalle(null); setAsignarA(p); }}
        onLiberar={p => { setDetalle(null); setLiberar(p); }}
      />
      <AsignarDialog parqueadero={asignarA} onClose={() => setAsignarA(null)} />
    </Box>
  );
}

// ─── Tab Sorteos ───────────────────────────────────────────────────────────────
function TabSorteos() {
  const qc = useQueryClient();
  const [dialogNuevo, setDialogNuevo] = useState(false);

  const { data: config, isLoading: loadingConfig } = useQuery({
    queryKey: ['parking-config'],
    queryFn: parkingApi.getConfig,
  });

  const { data: sorteos = [], isLoading: loadingSorteos } = useQuery({
    queryKey: ['parking-sorteos'],
    queryFn: parkingApi.listarSorteos,
  });

  const { data: espacios = [], isLoading: loadingEspacios } = useQuery({
    queryKey: ['parking-estado'],
    queryFn: parkingApi.getEstadoResidentes,
  });

  const { data: vehiculos = [] } = useQuery({
    queryKey: ['parking-vehiculos'],
    queryFn: parkingApi.listarVehiculos,
  });

  const [pendingToggle, setPendingToggle] = useState<boolean | null>(null);

  const configMut = useMutation({
    mutationFn: (val: boolean) => parkingApi.updateConfig(val),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parking-config'] });
      setPendingToggle(null);
    },
  });

  const requiereSorteo      = config?.requiere_sorteo ?? false;
  const totalEspacios       = espacios.length;
  const cuposDisponibles    = espacios.length;
  const totalVehiculos      = vehiculos.length;
  const haySorteoActivo = sorteos.some(s => s.estado === 'programado');
  const isLoading = loadingSorteos || loadingEspacios || loadingConfig;

  return (
    <Box display="flex" flexDirection="column" gap={2.5}>

      {/* Config toggle */}
      <Box sx={{ bgcolor: 'white', border: '1px solid #E2E8F0', borderRadius: 2,
        px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Settings sx={{ fontSize: 18, color: '#94A3B8' }} />
        <Box flex={1}>
          <Typography fontSize={13.5} fontWeight={600} color="#0F172A">
            Sistema de sorteo habilitado
          </Typography>
          <Typography fontSize={12} color="#64748B">
            Cuando está activo, los parqueaderos residentes se asignan mediante sorteos de rotación.
          </Typography>
        </Box>
        {loadingConfig ? (
          <CircularProgress size={20} sx={{ color: '#0F172A' }} />
        ) : (
          <Switch
            checked={requiereSorteo}
            disabled={configMut.isPending}
            onChange={e => setPendingToggle(e.target.checked)}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': { color: '#0F172A' },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0F172A' },
            }}
          />
        )}
      </Box>

      {/* Banner — solo cuando hay sorteo activo */}
      {!isLoading && requiereSorteo && haySorteoActivo && (
        <Alert severity="info" sx={{ borderRadius: 2, fontSize: 13.5, alignItems: 'center' }}>
          <strong>Hay un sorteo programado.</strong>{' '}
          {totalVehiculos} vehículo{totalVehiculos !== 1 ? 's' : ''} registrado{totalVehiculos !== 1 ? 's' : ''} · {totalEspacios} parqueadero{totalEspacios !== 1 ? 's' : ''}.
        </Alert>
      )}

      {/* Sorteos — solo visibles si el sistema está habilitado */}
      {requiereSorteo && (
        <>
          <Box display="flex" justifyContent="flex-end">
            <Button startIcon={<Add />} onClick={() => setDialogNuevo(true)}
              disabled={haySorteoActivo}
              sx={{ textTransform: 'none', fontSize: 13.5, color: '#0F172A',
                border: '1px solid #E2E8F0', borderRadius: 1.5,
                '&:hover': { bgcolor: '#F8FAFC' },
                '&:disabled': { color: '#CBD5E1', borderColor: '#F1F5F9' } }}>
              Crear sorteo
            </Button>
          </Box>

          {isLoading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress size={26} sx={{ color: '#0F172A' }} />
            </Box>
          ) : sorteos.length === 0 ? (
            <Box sx={{ bgcolor: 'white', border: '1px solid #E2E8F0', borderRadius: 2,
              py: 8, textAlign: 'center' }}>
              <LocalParking sx={{ fontSize: 40, color: '#E2E8F0', mb: 1 }} />
              <Typography fontSize={14} color="#94A3B8">No hay sorteos registrados</Typography>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {sorteos.map(s => <SorteoCard key={s.id} sorteo={s} />)}
            </Box>
          )}
        </>
      )}

      <CrearSorteoDialog open={dialogNuevo} onClose={() => setDialogNuevo(false)}
        cuposDisponibles={cuposDisponibles} />

      {/* Confirmación toggle sorteo */}
      <Dialog open={pendingToggle !== null} onClose={() => setPendingToggle(null)}
        maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2.5 } }}>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 700, pb: 1 }}>
          {pendingToggle ? 'Activar sistema de sorteos' : 'Desactivar sistema de sorteos'}
        </DialogTitle>
        <DialogContent>
          <Typography fontSize={13.5} color="#64748B">
            {pendingToggle
              ? 'Al activar esta opción, la asignación de parqueaderos residentes se gestionará mediante sorteos de rotación.'
              : 'Al desactivar esta opción, el sistema de sorteos quedará inactivo y los parqueaderos se asignarán manualmente.'}
          </Typography>
          <Typography fontSize={13} color="#94A3B8" mt={1.5}>
            ¿Deseas continuar?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setPendingToggle(null)}
            sx={{ textTransform: 'none', color: '#64748B' }}>
            Cancelar
          </Button>
          <Button variant="contained" disabled={configMut.isPending}
            onClick={() => configMut.mutate(pendingToggle!)}
            sx={{ textTransform: 'none', bgcolor: '#0F172A', borderRadius: 1.5,
              boxShadow: 'none', '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' } }}>
            {configMut.isPending ? 'Guardando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ─── ParkingPage ───────────────────────────────────────────────────────────────
export function ParkingPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.rol === 'administracion' || user?.rol === 'superadmin';
  const [tab, setTab] = useState(0);

  const { data: config } = useQuery({
    queryKey: ['parking-config'],
    queryFn: parkingApi.getConfig,
  });

  const requiereSorteo = config?.requiere_sorteo ?? false;

  return (
    <Box display="flex" flexDirection="column" gap={2.5}>
      {isAdmin && (
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{
            bgcolor: 'white', borderRadius: 2, border: '1px solid #E2E8F0',
            px: 1, minHeight: 44,
            '& .MuiTab-root': { textTransform: 'none', fontSize: 13.5, minHeight: 44,
              color: '#64748B', fontWeight: 500 },
            '& .Mui-selected': { color: '#0F172A', fontWeight: 700 },
            '& .MuiTabs-indicator': { bgcolor: '#0F172A', height: 2.5, borderRadius: 2 },
          }}>
          <Tab label="Parqueaderos residentes" icon={<Garage sx={{ fontSize: 16 }} />}
            iconPosition="start" />
          <Tab label="Sorteos de rotación" icon={<EmojiEvents sx={{ fontSize: 16 }} />}
            iconPosition="start" />
        </Tabs>
      )}

      {(tab === 0 || !isAdmin) && <TabParqueaderos isAdmin={isAdmin} requiereSorteo={requiereSorteo} />}
      {tab === 1 && isAdmin && <TabSorteos />}
    </Box>
  );
}
