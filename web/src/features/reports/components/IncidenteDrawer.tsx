import { useState } from 'react';
import {
  Box, Chip, CircularProgress, Divider, Drawer,
  IconButton, InputBase, Button, Typography,
} from '@mui/material';
import {
  Close, LocationOn, CalendarToday, CheckCircleOutline,
  Send,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  reportsApi,
  type EstadoIncidente,
  type SeveridadIncidente,
  TRANSICIONES,
} from '../api/reportsApi';

// ─── Tokens visuales ──────────────────────────────────────────────────────────
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

const ESTADO_NEXT_LABEL: Record<EstadoIncidente, string> = {
  reportado:   'Marcar en atención',
  en_atencion: 'Marcar como resuelto',
  resuelto:    'Cerrar novedad',
  cerrado:     '',
};

function InfoRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Box display="flex" alignItems="flex-start" gap={1.25}>
      <Box sx={{ color: '#94A3B8', mt: '2px', flexShrink: 0, '& svg': { fontSize: 15 } }}>
        {icon}
      </Box>
      <Typography fontSize={13.5} color="#334155" lineHeight={1.55}>{children}</Typography>
    </Box>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  incidenteId: string | null;
  tipoNombre: string;
  onClose: () => void;
  onUpdated: () => void;
}

export function IncidenteDrawer({ incidenteId, tipoNombre, onClose, onUpdated }: Props) {
  const qc = useQueryClient();
  const [nota, setNota] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['incidente-detalle', incidenteId],
    queryFn: () => reportsApi.getIncidente(incidenteId!),
    enabled: !!incidenteId,
  });

  const estadoMutation = useMutation({
    mutationFn: (nuevoEstado: EstadoIncidente) =>
      reportsApi.actualizarEstado(incidenteId!, nuevoEstado),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incidente-detalle', incidenteId] });
      onUpdated();
    },
  });

  const notaMutation = useMutation({
    mutationFn: (descripcion: string) =>
      reportsApi.agregarActualizacion(incidenteId!, descripcion),
    onSuccess: () => {
      setNota('');
      qc.invalidateQueries({ queryKey: ['incidente-detalle', incidenteId] });
    },
  });

  const handleAvanzarEstado = () => {
    if (!data) return;
    const siguientes = TRANSICIONES[data.estado];
    if (siguientes.length > 0) estadoMutation.mutate(siguientes[0]);
  };

  const handleNota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nota.trim()) return;
    notaMutation.mutate(nota.trim());
  };

  const estadoCfg  = data ? ESTADO_CFG[data.estado]       : null;
  const sevCfg     = data ? SEVERIDAD_CFG[data.severidad]  : null;
  const siguientes = data ? TRANSICIONES[data.estado]      : [];

  return (
    <Drawer
      anchor="right"
      open={!!incidenteId}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 460,
          bgcolor: '#F8FAFC',
          borderLeft: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* ── Header ── */}
      <Box sx={{
        px: 3, py: 2.5,
        bgcolor: 'white',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2,
      }}>
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

          {/* ── Chips de estado + severidad ── */}
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
            <Chip label={tipoNombre} size="small" sx={{
              bgcolor: '#F1F5F9', color: '#475569',
              fontWeight: 600, fontSize: 12, border: 'none', borderRadius: 1, height: 24,
            }} />
          </Box>

          {/* ── Info ── */}
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            <InfoRow icon={<CalendarToday />}>
              Reportado el {dayjs(data.created_at).format('DD/MM/YYYY [a las] hh:mm A')}
            </InfoRow>
            {data.ubicacion && (
              <InfoRow icon={<LocationOn />}>{data.ubicacion}</InfoRow>
            )}
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
            <Typography fontSize={13.5} color="#334155" lineHeight={1.65}>
              {data.descripcion}
            </Typography>
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
                  {/* línea vertical */}
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
                    <Typography fontSize={13.5} color="#334155" lineHeight={1.5}>
                      {act.descripcion}
                    </Typography>
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
                <Box component="form" onSubmit={handleNota}
                  sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <InputBase
                    multiline
                    rows={2}
                    placeholder="Escribe una actualización..."
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    sx={{
                      flex: 1, border: '1px solid #E2E8F0', borderRadius: '6px',
                      px: 1.5, py: 1, fontSize: 13.5, bgcolor: 'white',
                      alignItems: 'flex-start',
                      '&.Mui-focused': { borderColor: '#2563EB', boxShadow: '0 0 0 3px rgba(37,99,235,0.10)' },
                      '& textarea::placeholder': { color: '#94A3B8', opacity: 1 },
                    }}
                  />
                  <IconButton
                    type="submit"
                    disabled={!nota.trim() || notaMutation.isPending}
                    sx={{
                      width: 36, height: 36, bgcolor: '#0F172A', color: 'white', borderRadius: '6px',
                      flexShrink: 0,
                      '&:hover': { bgcolor: '#1E293B' },
                      '&:disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' },
                    }}
                  >
                    {notaMutation.isPending
                      ? <CircularProgress size={14} sx={{ color: 'white' }} />
                      : <Send sx={{ fontSize: 15 }} />}
                  </IconButton>
                </Box>
              </Box>
            </>
          )}
        </Box>
      ) : null}

      {/* ── Footer: cambio de estado ── */}
      {data && siguientes.length > 0 && (
        <Box sx={{
          px: 3, py: 2,
          bgcolor: 'white', borderTop: '1px solid #E2E8F0',
        }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleAvanzarEstado}
            disabled={estadoMutation.isPending}
            sx={{
              bgcolor: '#0F172A', fontWeight: 700, fontSize: 13.5,
              textTransform: 'none', borderRadius: '6px', py: 1.25,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' },
            }}
          >
            {estadoMutation.isPending
              ? <CircularProgress size={16} sx={{ color: 'rgba(255,255,255,0.6)' }} />
              : ESTADO_NEXT_LABEL[data.estado]}
          </Button>
        </Box>
      )}
    </Drawer>
  );
}
