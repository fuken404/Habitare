import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box, Typography, Chip, CircularProgress,
  Drawer, Divider, IconButton, Avatar,
  Button, Switch, FormControlLabel, InputBase,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  Close, People, EventAvailable, CheckCircle,
  Cancel, Schedule, HourglassEmpty, DoneAll, Settings,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/core/auth/authStore';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { SearchBar } from '@/shared/components/SearchBar';
import { commonAreasApi, type ZonaComunItem, type ReservaItem, type EstadoReserva } from '../api/commonAreasApi';

dayjs.locale('es');

// ─── Tokens ───────────────────────────────────────────────────────────────────
const ESTADO_CONFIG: Record<EstadoReserva, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  pendiente:   { label: 'Pendiente',   bg: '#FEF3C7', color: '#92400E', icon: <HourglassEmpty sx={{ fontSize: 13 }} /> },
  confirmada:  { label: 'Confirmada',  bg: '#DCFCE7', color: '#15803D', icon: <CheckCircle sx={{ fontSize: 13 }} /> },
  cancelada:   { label: 'Cancelada',   bg: '#F1F5F9', color: '#64748B', icon: <Cancel sx={{ fontSize: 13 }} /> },
  completada:  { label: 'Completada',  bg: '#EFF6FF', color: '#1D4ED8', icon: <DoneAll sx={{ fontSize: 13 }} /> },
};

const ZONA_COLORS = ['#2563EB', '#7C3AED', '#059669', '#EA580C', '#0891B2', '#DC2626'];

// ─── ConfigZonaDialog ─────────────────────────────────────────────────────────
function ConfigZonaDialog({ zona, onClose }: { zona: ZonaComunItem | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [requiereAprobacion, setRequiereAprobacion] = useState(zona?.requiere_aprobacion ?? false);

  useEffect(() => {
    setRequiereAprobacion(zona?.requiere_aprobacion ?? false);
  }, [zona?.id]);

  const mut = useMutation({
    mutationFn: (requiere: boolean) =>
      commonAreasApi.actualizarZona(zona!.id, { requiere_aprobacion: requiere }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['zonas-comunes'] }),
  });

  if (!zona) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setRequiereAprobacion(val);
    mut.mutate(val);
  };

  return (
    <Dialog open={!!zona} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography fontWeight={700} fontSize={15.5}>{zona.nombre}</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: '8px !important' }}>
        <Typography fontSize={12} color="#94A3B8" fontWeight={700} textTransform="uppercase"
          letterSpacing="0.06em" mb={1.5}>
          Configuración de reservas
        </Typography>
        <Box sx={{ border: '1px solid #E2E8F0', borderRadius: '8px', px: 2, py: 1.5 }}>
          <FormControlLabel
            control={
              <Switch
                checked={requiereAprobacion}
                onChange={handleChange}
                disabled={mut.isPending}
                size="small"
                sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#2563EB' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#2563EB' } }}
              />
            }
            label={
              <Box ml={0.5}>
                <Typography fontSize={13.5} fontWeight={600} color="#0F172A">
                  Requiere aprobación
                </Typography>
                <Typography fontSize={12} color="#64748B">
                  {requiereAprobacion
                    ? 'Las reservas quedan en pendiente hasta que el admin las autorice'
                    : 'Las reservas se confirman automáticamente'}
                </Typography>
              </Box>
            }
            sx={{ alignItems: 'flex-start', m: 0, gap: 0.5 }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ color: '#64748B', textTransform: 'none', fontSize: 13.5 }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Zona card ────────────────────────────────────────────────────────────────
function ZonaCard({ zona, index, onClick, selected, isAdmin, onConfig }: {
  zona: ZonaComunItem;
  index: number;
  onClick: () => void;
  selected: boolean;
  isAdmin: boolean;
  onConfig: (e: React.MouseEvent) => void;
}) {
  const color = ZONA_COLORS[index % ZONA_COLORS.length];
  return (
    <Box onClick={onClick} sx={{
      bgcolor: 'white', borderRadius: 2,
      border: selected ? `2px solid ${color}` : '1px solid #E2E8F0',
      boxShadow: selected ? `0 0 0 3px ${color}22` : '0 1px 4px rgba(0,0,0,0.04)',
      cursor: 'pointer', overflow: 'hidden',
      borderTop: `3px solid ${color}`,
      transition: 'box-shadow .15s, border .15s',
      '&:hover': { boxShadow: `0 4px 16px rgba(0,0,0,0.10)` },
    }}>
      <Box sx={{ p: 2.5 }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1} mb={1.5}>
          <Typography fontWeight={700} fontSize={14.5} color="#0F172A" lineHeight={1.3}>
            {zona.nombre}
          </Typography>
          <Box display="flex" alignItems="center" gap={0.5}>
            {!zona.is_activa && (
              <Chip label="Inactiva" size="small" sx={{ bgcolor: '#F1F5F9', color: '#94A3B8', fontSize: 10.5, fontWeight: 600, border: 'none', height: 20 }} />
            )}
            {isAdmin && (
              <IconButton
                size="small"
                onClick={onConfig}
                sx={{ p: 0.5, color: '#94A3B8', '&:hover': { color: '#64748B', bgcolor: '#F1F5F9' } }}
              >
                <Settings sx={{ fontSize: 15 }} />
              </IconButton>
            )}
          </Box>
        </Box>
        <Box display="flex" gap={1.5} flexWrap="wrap">
          {zona.capacidad_maxima != null && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <People sx={{ fontSize: 14, color: '#94A3B8' }} />
              <Typography fontSize={12.5} color="#64748B">{zona.capacidad_maxima} personas</Typography>
            </Box>
          )}
          {zona.requiere_aprobacion && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <Schedule sx={{ fontSize: 14, color: '#F59E0B' }} />
              <Typography fontSize={12.5} color="#92400E">Requiere aprobación</Typography>
            </Box>
          )}
        </Box>
      </Box>
      <Box sx={{ px: 2.5, pb: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <EventAvailable sx={{ fontSize: 13, color }} />
        <Typography fontSize={12.5} fontWeight={600} color={color}>Ver reservas</Typography>
      </Box>
    </Box>
  );
}

// ─── ReservasDrawer ───────────────────────────────────────────────────────────
type AccionPendiente = 'autorizar' | 'rechazar';

function ReservasDrawer({ zona, onClose }: { zona: ZonaComunItem | null; onClose: () => void }) {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const puedeAutorizar = user?.rol === 'administracion' || user?.rol === 'superadmin';

  const [confirmId,    setConfirmId]    = useState<string | null>(null);
  const [accionActiva, setAccionActiva] = useState<AccionPendiente>('autorizar');
  const [motivo,       setMotivo]       = useState('');

  const { data: reservas = [], isLoading } = useQuery({
    queryKey: ['reservas-zona', zona?.id],
    queryFn: () => commonAreasApi.listReservasByZona(zona!.id),
    enabled: !!zona,
    refetchInterval: 30_000,
  });

  const confirmarMut = useMutation({
    mutationFn: () => commonAreasApi.confirmarReserva(confirmId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservas-zona', zona?.id] });
      setConfirmId(null);
    },
  });

  const rechazarMut = useMutation({
    mutationFn: (m: string) => commonAreasApi.rechazarReserva(confirmId!, m),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reservas-zona', zona?.id] });
      setConfirmId(null);
      setMotivo('');
    },
  });

  const cancelarConfirm = () => { setConfirmId(null); setMotivo(''); };

  const handleConfirmar = () => {
    if (accionActiva === 'autorizar') confirmarMut.mutate();
    else rechazarMut.mutate(motivo);
  };

  const isPending = confirmarMut.isPending || rechazarMut.isPending;

  const today = dayjs().startOf('day');
  const futuras = reservas
    .filter(r => dayjs(r.fecha_reserva).isSame(today, 'day') || dayjs(r.fecha_reserva).isAfter(today))
    .sort((a, b) => {
      const d = dayjs(a.fecha_reserva).diff(dayjs(b.fecha_reserva));
      return d !== 0 ? d : a.hora_inicio.localeCompare(b.hora_inicio);
    });

  const grouped = useMemo(() => {
    const map = new Map<string, ReservaItem[]>();
    for (const r of futuras) {
      if (!map.has(r.fecha_reserva)) map.set(r.fecha_reserva, []);
      map.get(r.fecha_reserva)!.push(r);
    }
    return [...map.entries()];
  }, [futuras]);

  return (
    <Drawer anchor="right" open={!!zona} onClose={onClose}
      PaperProps={{ sx: { width: 460, display: 'flex', flexDirection: 'column' } }}>

      {/* Header */}
      <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box flex={1}>
          <Typography fontWeight={700} fontSize={16} color="#0F172A">{zona?.nombre}</Typography>
          <Typography fontSize={12.5} color="#64748B" mt={0.25}>
            Reservas confirmadas y pendientes desde hoy
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8', mt: -0.5 }}>
          <Close fontSize="small" />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress size={26} sx={{ color: '#0F172A' }} />
          </Box>
        ) : futuras.length === 0 ? (
          <Box py={6} textAlign="center">
            <EventAvailable sx={{ fontSize: 36, color: '#E2E8F0', mb: 1 }} />
            <Typography fontSize={13.5} color="#94A3B8">Sin reservas próximas</Typography>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={3}>
            {grouped.map(([fecha, items]) => (
              <Box key={fecha}>
                {/* Fecha */}
                <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                  <Typography fontSize={12} fontWeight={700} color="#94A3B8" textTransform="uppercase" letterSpacing="0.06em">
                    {dayjs(fecha).isSame(today, 'day')
                      ? 'Hoy'
                      : dayjs(fecha).isSame(today.add(1, 'day'), 'day')
                      ? 'Mañana'
                      : dayjs(fecha).format('dddd D [de] MMMM')}
                  </Typography>
                  <Box sx={{ flex: 1, height: 1, bgcolor: '#F1F5F9' }} />
                  <Typography fontSize={11.5} color="#94A3B8">
                    {items.length} reserva{items.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>

                {/* Cards de reserva */}
                <Box display="flex" flexDirection="column" gap={1.5}>
                  {items.map(r => {
                    const cfg = ESTADO_CONFIG[r.estado];
                    const initials = r.nombre_residente
                      ? r.nombre_residente.split(' ').map(n => n[0]).slice(0, 2).join('')
                      : '?';
                    const isConfirming = confirmId === r.id;

                    return (
                      <Box key={r.id} sx={{
                        border: '1px solid #E2E8F0', borderRadius: 2, p: 2,
                        bgcolor: r.estado === 'cancelada' ? '#FAFAFA' : 'white',
                        opacity: r.estado === 'cancelada' ? 0.7 : 1,
                      }}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ width: 34, height: 34, bgcolor: '#0F172A', fontSize: 12, fontWeight: 700 }}>
                            {initials}
                          </Avatar>
                          <Box flex={1} minWidth={0}>
                            <Typography fontSize={13.5} fontWeight={600} color="#0F172A" noWrap>
                              {r.nombre_residente ?? 'Residente'}
                            </Typography>
                            <Typography fontSize={12} color="#64748B">
                              {[r.numero_unidad, r.nombre_torre].filter(Boolean).join(' · ') || '—'}
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            icon={cfg.icon as React.ReactElement}
                            label={cfg.label}
                            sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: 11.5, border: 'none', borderRadius: 1,
                              '& .MuiChip-icon': { color: 'inherit' } }}
                          />
                        </Box>

                        <Box
                          display="flex"
                          flexDirection={isConfirming && accionActiva === 'rechazar' ? 'column' : 'row'}
                          alignItems={isConfirming && accionActiva === 'rechazar' ? 'stretch' : 'center'}
                          justifyContent="space-between"
                          mt={1.5}
                          gap={isConfirming && accionActiva === 'rechazar' ? 1 : 0}
                        >
                          <Box display="flex" alignItems="center" gap={0.75}>
                            <Schedule sx={{ fontSize: 13, color: '#94A3B8' }} />
                            <Typography fontSize={13} color="#64748B" fontVariantNumeric="tabular-nums">
                              {r.hora_inicio.slice(0, 5)} – {r.hora_fin.slice(0, 5)}
                            </Typography>
                          </Box>

                          {r.estado === 'pendiente' && puedeAutorizar && (
                            isConfirming ? (
                              // Confirmación inline
                              <Box display="flex" flexDirection="column" gap={1}>
                                {accionActiva === 'rechazar' && (
                                  <Box sx={{
                                    border: '1px solid #E2E8F0', borderRadius: '6px',
                                    px: 1.5, py: 0.75, bgcolor: '#FAFAFA',
                                  }}>
                                    <InputBase
                                      autoFocus
                                      placeholder="Motivo del rechazo (requerido)"
                                      value={motivo}
                                      onChange={e => setMotivo(e.target.value)}
                                      multiline
                                      minRows={2}
                                      fullWidth
                                      sx={{ fontSize: 12.5, color: '#0F172A', '& textarea': { resize: 'none' } }}
                                    />
                                  </Box>
                                )}
                                <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                                  <Typography fontSize={12} color="#64748B">
                                    {accionActiva === 'autorizar' ? '¿Autorizar?' : '¿Rechazar?'}
                                  </Typography>
                                  <Button size="small" onClick={cancelarConfirm}
                                    sx={{ fontSize: 12, color: '#64748B', textTransform: 'none', minWidth: 0, px: 1 }}>
                                    No
                                  </Button>
                                  <Button size="small" variant="contained"
                                    disabled={isPending || (accionActiva === 'rechazar' && !motivo.trim())}
                                    onClick={handleConfirmar}
                                    sx={{
                                      fontSize: 12, textTransform: 'none', boxShadow: 'none', px: 1.5,
                                      bgcolor: accionActiva === 'autorizar' ? '#059669' : '#DC2626',
                                      '&:hover': { bgcolor: accionActiva === 'autorizar' ? '#047857' : '#B91C1C', boxShadow: 'none' },
                                    }}>
                                    {isPending ? '...' : 'Sí'}
                                  </Button>
                                </Box>
                              </Box>
                            ) : (
                              // Botones autorizar + rechazar
                              <Box display="flex" gap={0.5}>
                                <Button size="small"
                                  onClick={() => { setMotivo(''); setAccionActiva('autorizar'); setConfirmId(r.id); }}
                                  startIcon={<CheckCircle sx={{ fontSize: 14 }} />}
                                  sx={{ fontSize: 12, color: '#059669', textTransform: 'none', minWidth: 0, px: 1,
                                    '&:hover': { bgcolor: '#F0FDF4' } }}>
                                  Autorizar
                                </Button>
                                <Button size="small"
                                  onClick={() => { setAccionActiva('rechazar'); setConfirmId(r.id); }}
                                  startIcon={<Cancel sx={{ fontSize: 14 }} />}
                                  sx={{ fontSize: 12, color: '#DC2626', textTransform: 'none', minWidth: 0, px: 1,
                                    '&:hover': { bgcolor: '#FEF2F2' } }}>
                                  Rechazar
                                </Button>
                              </Box>
                            )
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ px: 3, py: 2, borderTop: '1px solid #F1F5F9' }}>
        <Typography fontSize={12} color="#94A3B8" textAlign="center">
          {futuras.filter(r => r.estado !== 'cancelada').length} reserva{futuras.filter(r => r.estado !== 'cancelada').length !== 1 ? 's' : ''} activa{futuras.filter(r => r.estado !== 'cancelada').length !== 1 ? 's' : ''} próximas
        </Typography>
      </Box>
    </Drawer>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────
export function CommonAreasPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.rol === 'administracion' || user?.rol === 'superadmin';
  const location = useLocation();
  const zonaIdFromNav = (location.state as any)?.zonaId as string | undefined;

  const [search,       setSearch]       = useState('');
  const [selectedZona, setSelectedZona] = useState<ZonaComunItem | null>(null);
  const [configZona,   setConfigZona]   = useState<ZonaComunItem | null>(null);

  const { data: zonas = [], isLoading } = useQuery({
    queryKey: ['zonas-comunes'],
    queryFn: commonAreasApi.listZonas,
  });

  useEffect(() => {
    if (zonaIdFromNav && zonas.length > 0) {
      const zona = zonas.find(z => z.id === zonaIdFromNav);
      if (zona) setSelectedZona(zona);
    }
  }, [zonaIdFromNav, zonas]);

  const q = search.toLowerCase();
  const zonasFiltradas = zonas.filter(z => !q || z.nombre.toLowerCase().includes(q));

  return (
    <Box display="flex" flexDirection="column" gap={2.5}>

      {/* ── Toolbar ── */}
      <Box>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar zona común..." width={280} />
      </Box>

      {/* ── Grid de zonas ── */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress size={28} sx={{ color: '#0F172A' }} />
        </Box>
      ) : zonasFiltradas.length === 0 ? (
        <Box py={10} textAlign="center">
          <Typography fontSize={13.5} color="#94A3B8">
            {search ? 'Sin resultados para tu búsqueda' : 'Sin zonas comunes registradas'}
          </Typography>
        </Box>
      ) : (
        <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(260px, 1fr))" gap={2}>
          {zonasFiltradas.map((zona, i) => (
            <ZonaCard
              key={zona.id}
              zona={zona}
              index={i}
              selected={selectedZona?.id === zona.id}
              isAdmin={isAdmin}
              onClick={() => setSelectedZona(selectedZona?.id === zona.id ? null : zona)}
              onConfig={e => { e.stopPropagation(); setConfigZona(zona); }}
            />
          ))}
        </Box>
      )}

      <ReservasDrawer zona={selectedZona} onClose={() => setSelectedZona(null)} />

      <ConfigZonaDialog zona={configZona} onClose={() => setConfigZona(null)} />
    </Box>
  );
}
