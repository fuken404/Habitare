import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Chip, CircularProgress, Drawer, IconButton,
  Button, TableContainer, Table, TableHead, TableRow, TableCell,
  TableBody, TablePagination, FormControl, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Divider,
  RadioGroup, FormControlLabel, Radio, Checkbox, InputAdornment,
} from '@mui/material';
import {
  FilterList, Close, Add, CalendarToday, Person,
  Campaign, Archive, Send, Search, Apartment, Layers,
  WarningAmber, FormatListBulleted,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { SearchBar } from '@/shared/components/SearchBar';
import { useAuthStore } from '@/core/auth/authStore';
import {
  communicationsApi,
  type ComunicadoListItem, type TipoComunicado, type EstadoComunicado,
} from '../api/communicationsApi';

type ModoSegmentacion = 'todos' | 'torres' | 'pisos' | 'mora' | 'manual';

dayjs.locale('es');

// ─── Visual tokens ────────────────────────────────────────────────────────────
const TIPO_CFG: Record<TipoComunicado, { label: string; bg: string; color: string }> = {
  informativo:  { label: 'Informativo',  bg: '#DBEAFE', color: '#1D4ED8' },
  urgente:      { label: 'Urgente',      bg: '#FEE2E2', color: '#DC2626' },
  evento:       { label: 'Evento',       bg: '#DCFCE7', color: '#15803D' },
  mantenimiento:{ label: 'Mantenimiento',bg: '#FFEDD5', color: '#C2410C' },
};

const ESTADO_CFG: Record<EstadoComunicado, { label: string; bg: string; color: string }> = {
  borrador:  { label: 'Borrador',  bg: '#F1F5F9', color: '#64748B' },
  publicado: { label: 'Publicado', bg: '#DCFCE7', color: '#15803D' },
  archivado: { label: 'Archivado', bg: '#F8FAFC', color: '#94A3B8' },
};

const SEG_LABEL: Record<string, string> = {
  todos:  'Todos los residentes',
  torre:  'Por torre',
  unidad: 'Por unidad',
  rol:    'Por rol',
};

const TH_SX = {
  bgcolor: '#F8FAFC', color: '#94A3B8', fontSize: 11, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.06em', py: 1.5, px: 2,
  borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap',
} as const;

const TD_SX = { py: 1.5, px: 2, borderBottom: '1px solid #F1F5F9', fontSize: 13.5 } as const;

const PAGE_SIZE = 15;

// ─── CrearComunicadoDialog ────────────────────────────────────────────────────
export function CrearComunicadoDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();

  const [titulo, setTitulo]       = useState('');
  const [contenido, setContenido] = useState('');
  const [tipo, setTipo]           = useState<TipoComunicado | ''>('');
  const [modo, setModo]           = useState<ModoSegmentacion>('todos');
  const [busqUnidad, setBusqUnidad] = useState('');

  // Selecciones multi
  const [torresSelec, setTorresSelec]   = useState<Set<string>>(new Set());
  const [pisosSelec, setPisosSelec]     = useState<Set<number>>(new Set());
  const [unidadesSelec, setUnidadesSelec] = useState<Set<string>>(new Set());

  // Datos externos
  const { data: torres = [] } = useQuery({
    queryKey: ['torres-lista'],
    queryFn: communicationsApi.listarTorres,
    enabled: open,
  });

  const { data: unidades = [] } = useQuery({
    queryKey: ['unidades-detalle'],
    queryFn: communicationsApi.listarUnidades,
    enabled: open,
  });

  const { data: facturasVencidas = [], isLoading: loadingMora } = useQuery({
    queryKey: ['facturas-vencidas'],
    queryFn: communicationsApi.listarFacturasVencidas,
    enabled: open && modo === 'mora',
  });

  // Pisos únicos disponibles
  const pisosDisponibles = useMemo(() =>
    [...new Set(unidades.map(u => u.piso).filter((p): p is number => p !== null))].sort((a, b) => a - b),
    [unidades]
  );

  // Unidades en mora — agrupadas por unidad_id con monto total sumado
  const unidadesEnMora = useMemo(() => {
    const map = new Map<string, { unidad_id: string; numero_unidad: string | null; nombre_torre: string | null; monto_total: number }>();
    for (const f of facturasVencidas) {
      const existing = map.get(f.unidad_id);
      if (existing) {
        existing.monto_total += Number(f.monto_total);
      } else {
        map.set(f.unidad_id, {
          unidad_id: f.unidad_id,
          numero_unidad: f.numero_unidad,
          nombre_torre: f.nombre_torre,
          monto_total: Number(f.monto_total),
        });
      }
    }
    return [...map.values()];
  }, [facturasVencidas]);

  // Unidades filtradas para selección manual
  const unidadesFiltradas = useMemo(() => {
    const q = busqUnidad.trim().toLowerCase();
    if (!q) return unidades;
    return unidades.filter(u =>
      u.numero.toLowerCase().includes(q) ||
      (u.nombre_torre ?? '').toLowerCase().includes(q)
    );
  }, [unidades, busqUnidad]);

  const toggleSet = <T,>(set: Set<T>, val: T): Set<T> => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    return next;
  };

  // Resolver segmentaciones según modo
  const resolverSegmentaciones = () => {
    if (modo === 'todos') return [{ tipo: 'todos' as const }];
    if (modo === 'torres') return [...torresSelec].map(id => ({ tipo: 'torre' as const, torre_id: id }));
    if (modo === 'pisos') {
      const ids = unidades.filter(u => u.piso !== null && pisosSelec.has(u.piso!)).map(u => u.id);
      return ids.map(id => ({ tipo: 'unidad' as const, unidad_id: id }));
    }
    if (modo === 'mora') return unidadesEnMora.map(u => ({ tipo: 'unidad' as const, unidad_id: u.id }));
    if (modo === 'manual') return [...unidadesSelec].map(id => ({ tipo: 'unidad' as const, unidad_id: id }));
    return [{ tipo: 'todos' as const }];
  };

  const segValid = () => {
    if (modo === 'todos' || modo === 'mora') return true;
    if (modo === 'torres') return torresSelec.size > 0;
    if (modo === 'pisos') return pisosSelec.size > 0;
    if (modo === 'manual') return unidadesSelec.size > 0;
    return false;
  };

  const reset = () => {
    setTitulo(''); setContenido(''); setTipo(''); setModo('todos');
    setTorresSelec(new Set()); setPisosSelec(new Set()); setUnidadesSelec(new Set());
    setBusqUnidad('');
  };

  const mut = useMutation({
    mutationFn: () => communicationsApi.crear({
      titulo, contenido, tipo: tipo as TipoComunicado,
      segmentaciones: resolverSegmentaciones(),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comunicados'] });
      reset();
      onClose();
    },
  });

  const valid = titulo.trim() && contenido.trim() && tipo && segValid();

  const MODO_CFG: Record<ModoSegmentacion, { label: string; icon: React.ReactNode }> = {
    todos:  { label: 'Todos los residentes',  icon: <Person sx={{ fontSize: 16 }} /> },
    torres: { label: 'Por torre(s)',           icon: <Apartment sx={{ fontSize: 16 }} /> },
    pisos:  { label: 'Por piso(s)',            icon: <Layers sx={{ fontSize: 16 }} /> },
    mora:   { label: 'Residentes en mora',     icon: <WarningAmber sx={{ fontSize: 16 }} /> },
    manual: { label: 'Selección manual',       icon: <FormatListBulleted sx={{ fontSize: 16 }} /> },
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography fontWeight={700} fontSize={15.5}>Nuevo comunicado</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: '8px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>

        {/* Campos base */}
        <TextField size="small" label="Título *" fullWidth value={titulo}
          onChange={e => setTitulo(e.target.value)}
          inputProps={{ style: { fontSize: 13.5 } }} InputLabelProps={{ style: { fontSize: 13.5 } }} />

        <FormControl size="small" fullWidth>
          <Select displayEmpty value={tipo}
            onChange={e => setTipo(e.target.value as TipoComunicado)}
            renderValue={v => v
              ? TIPO_CFG[v as TipoComunicado].label
              : <span style={{ color: '#94A3B8' }}>Tipo *</span>}
            sx={{ fontSize: 13.5 }}>
            {(Object.keys(TIPO_CFG) as TipoComunicado[]).map(t => (
              <MenuItem key={t} value={t} sx={{ fontSize: 13.5 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%',
                    bgcolor: TIPO_CFG[t].color, flexShrink: 0 }} />
                  {TIPO_CFG[t].label}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField size="small" label="Contenido *" fullWidth multiline rows={5}
          value={contenido} onChange={e => setContenido(e.target.value)}
          inputProps={{ style: { fontSize: 13.5 } }} InputLabelProps={{ style: { fontSize: 13.5 } }} />

        <Divider />

        {/* Segmentación */}
        <Box>
          <Typography fontSize={12} fontWeight={700} color="#94A3B8"
            textTransform="uppercase" letterSpacing="0.06em" mb={1}>
            Destinatarios
          </Typography>

          <RadioGroup value={modo} onChange={e => setModo(e.target.value as ModoSegmentacion)}>
            {(Object.keys(MODO_CFG) as ModoSegmentacion[]).map(m => (
              <FormControlLabel key={m} value={m}
                control={<Radio size="small" sx={{ py: 0.5,
                  '&.Mui-checked': { color: '#0F172A' } }} />}
                label={
                  <Box display="flex" alignItems="center" gap={0.75}>
                    <Box sx={{ color: modo === m ? '#0F172A' : '#94A3B8', display: 'flex' }}>
                      {MODO_CFG[m].icon}
                    </Box>
                    <Typography fontSize={13.5} color={modo === m ? '#0F172A' : '#64748B'}>
                      {MODO_CFG[m].label}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </RadioGroup>

          {/* Panel dinámico según modo */}
          {modo === 'torres' && (
            <Box sx={{ mt: 1.5, pl: 3.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {torres.length === 0
                ? <Typography fontSize={12.5} color="#94A3B8">No hay torres registradas.</Typography>
                : torres.map(t => (
                  <Chip key={t.id} label={t.nombre} size="small"
                    onClick={() => setTorresSelec(s => toggleSet(s, t.id))}
                    sx={{
                      cursor: 'pointer', fontWeight: 600, fontSize: 12.5,
                      bgcolor: torresSelec.has(t.id) ? '#0F172A' : 'white',
                      color: torresSelec.has(t.id) ? 'white' : '#64748B',
                      border: `1px solid ${torresSelec.has(t.id) ? '#0F172A' : '#E2E8F0'}`,
                      '&:hover': { bgcolor: torresSelec.has(t.id) ? '#1E293B' : '#F8FAFC' },
                    }} />
                ))}
            </Box>
          )}

          {modo === 'pisos' && (
            <Box sx={{ mt: 1.5, pl: 3.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {pisosDisponibles.length === 0
                ? <Typography fontSize={12.5} color="#94A3B8">No hay pisos registrados.</Typography>
                : pisosDisponibles.map(p => (
                  <Chip key={p} label={`Piso ${p}`} size="small"
                    onClick={() => setPisosSelec(s => toggleSet(s, p))}
                    sx={{
                      cursor: 'pointer', fontWeight: 600, fontSize: 12.5,
                      bgcolor: pisosSelec.has(p) ? '#0F172A' : 'white',
                      color: pisosSelec.has(p) ? 'white' : '#64748B',
                      border: `1px solid ${pisosSelec.has(p) ? '#0F172A' : '#E2E8F0'}`,
                      '&:hover': { bgcolor: pisosSelec.has(p) ? '#1E293B' : '#F8FAFC' },
                    }} />
                ))}
            </Box>
          )}

          {modo === 'mora' && (
            <Box sx={{ mt: 1.5, pl: 3.5 }}>
              {loadingMora ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={14} sx={{ color: '#94A3B8' }} />
                  <Typography fontSize={12.5} color="#94A3B8">Cargando...</Typography>
                </Box>
              ) : unidadesEnMora.length === 0 ? (
                <Typography fontSize={12.5} color="#94A3B8">No hay unidades con facturas vencidas.</Typography>
              ) : (
                <div style={{
                  background: '#FEF9C3', border: '1px solid #FDE68A', borderRadius: 6,
                  padding: '10px 16px',
                }}>
                  <div style={{ fontSize: 12.5, color: '#92400E', fontWeight: 600, marginBottom: 4 }}>
                    {unidadesEnMora.length} unidad{unidadesEnMora.length !== 1 ? 'es' : ''} con saldo vencido
                  </div>
                  {unidadesEnMora.map(u => (
                    <div key={u.unidad_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, marginTop: 2, lineHeight: '18px' }}>
                      <span style={{ color: '#A16207' }}>
                        Unidad {u.numero_unidad ?? u.unidad_id.slice(0, 8)}
                        {u.nombre_torre ? ` · ${u.nombre_torre}` : ''}
                      </span>
                      <span style={{ fontWeight: 700, color: '#92400E', flexShrink: 0, marginLeft: 8 }}>
                        ${u.monto_total.toLocaleString('es-CO')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Box>
          )}

          {modo === 'manual' && (
            <Box sx={{ mt: 1.5, pl: 3.5 }}>
              <TextField size="small" fullWidth placeholder="Buscar unidad o torre…"
                value={busqUnidad} onChange={e => setBusqUnidad(e.target.value)}
                InputProps={{ startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 16, color: '#94A3B8' }} />
                  </InputAdornment>
                )}}
                sx={{ mb: 1, '& .MuiOutlinedInput-root': {
                  fontSize: 13, borderRadius: 1.5, bgcolor: 'white',
                  '& fieldset': { borderColor: '#E2E8F0' },
                }}} />
              <Box sx={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #E2E8F0',
                borderRadius: 1.5, bgcolor: 'white' }}>
                {unidadesFiltradas.length === 0
                  ? <Typography fontSize={12.5} color="#94A3B8" p={2}>Sin resultados.</Typography>
                  : unidadesFiltradas.map(u => (
                    <Box key={u.id} display="flex" alignItems="center"
                      onClick={() => setUnidadesSelec(s => toggleSet(s, u.id))}
                      sx={{ px: 1.5, py: 0.75, cursor: 'pointer',
                        '&:hover': { bgcolor: '#F8FAFC' },
                        borderBottom: '1px solid #F1F5F9' }}>
                      <Checkbox size="small" checked={unidadesSelec.has(u.id)}
                        sx={{ p: 0.5, mr: 1, '&.Mui-checked': { color: '#0F172A' } }} />
                      <Box>
                        <Typography fontSize={13} fontWeight={600} color="#0F172A">
                          Unidad {u.numero}
                        </Typography>
                        {u.nombre_torre && (
                          <Typography fontSize={11.5} color="#94A3B8">{u.nombre_torre}
                            {u.piso !== null ? ` · Piso ${u.piso}` : ''}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
              </Box>
              {unidadesSelec.size > 0 && (
                <Typography fontSize={12} color="#64748B" mt={0.75}>
                  {unidadesSelec.size} unidad{unidadesSelec.size !== 1 ? 'es' : ''} seleccionada{unidadesSelec.size !== 1 ? 's' : ''}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: '#64748B', textTransform: 'none', fontSize: 13.5 }}>
          Cancelar
        </Button>
        <Button variant="contained" disabled={!valid || mut.isPending} onClick={() => mut.mutate()}
          sx={{ bgcolor: '#0F172A', textTransform: 'none', fontSize: 13.5, borderRadius: 1.5,
            boxShadow: 'none', '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' } }}>
          {mut.isPending ? 'Creando...' : 'Crear borrador'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── InfoRow ──────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Box display="flex" gap={1.5} alignItems="flex-start">
      <Box sx={{ color: '#94A3B8', mt: 0.25, flexShrink: 0 }}>{icon}</Box>
      <Box flex={1}>
        <Typography fontSize={11} color="#94A3B8" fontWeight={700}
          textTransform="uppercase" letterSpacing="0.05em">
          {label}
        </Typography>
        <Typography fontSize={13.5} color="#0F172A" mt={0.25}>{value}</Typography>
      </Box>
    </Box>
  );
}

// ─── ComunicadoDrawer ─────────────────────────────────────────────────────────
function ComunicadoDrawer({
  comunicado, isAdmin, onClose,
}: { comunicado: ComunicadoListItem | null; isAdmin: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [confirmAccion, setConfirmAccion] = useState<'publicar' | 'archivar' | 'eliminar' | null>(null);

  const { data: detalle, isLoading } = useQuery({
    queryKey: ['comunicado-detalle', comunicado?.id],
    queryFn:  () => communicationsApi.getById(comunicado!.id),
    enabled:  !!comunicado,
  });

  const publicarMut = useMutation({
    mutationFn: () => communicationsApi.publicar(comunicado!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comunicados'] });
      setConfirmAccion(null);
      onClose();
    },
  });

  const archivarMut = useMutation({
    mutationFn: () => communicationsApi.archivar(comunicado!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comunicados'] });
      setConfirmAccion(null);
      onClose();
    },
  });

  const eliminarMut = useMutation({
    mutationFn: () => communicationsApi.eliminar(comunicado!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comunicados'] });
      setConfirmAccion(null);
      onClose();
    },
  });

  const handleConfirm = () => {
    if (confirmAccion === 'publicar') publicarMut.mutate();
    else if (confirmAccion === 'archivar') archivarMut.mutate();
    else if (confirmAccion === 'eliminar') eliminarMut.mutate();
  };

  const isPending = publicarMut.isPending || archivarMut.isPending || eliminarMut.isPending;
  const tipoCfg   = comunicado ? TIPO_CFG[comunicado.tipo] : null;
  const estadoCfg = comunicado ? ESTADO_CFG[comunicado.estado] : null;

  const CONFIRM_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    publicar: { label: 'Publicar comunicado', color: '#15803D', bg: '#059669' },
    archivar: { label: 'Archivar comunicado', color: '#64748B', bg: '#475569' },
    eliminar: { label: 'Eliminar comunicado', color: '#DC2626', bg: '#DC2626' },
  };

  return (
    <Drawer anchor="right" open={!!comunicado} onClose={onClose}
      PaperProps={{ sx: { width: 520, display: 'flex', flexDirection: 'column',
        bgcolor: '#F8FAFC', borderLeft: '1px solid #E2E8F0' } }}>

      {/* Header */}
      {comunicado && (
        <Box sx={{ px: 3, py: 2.5, bgcolor: 'white', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
          <Box display="flex" alignItems="flex-start" gap={1}>
            <Box flex={1} minWidth={0}>
              <Box display="flex" gap={1} mb={1}>
                {tipoCfg && (
                  <Chip label={tipoCfg.label} size="small"
                    sx={{ bgcolor: tipoCfg.bg, color: tipoCfg.color, fontWeight: 700,
                      fontSize: 11.5, borderRadius: 1, border: 'none' }} />
                )}
                {estadoCfg && (
                  <Chip label={estadoCfg.label} size="small"
                    sx={{ bgcolor: estadoCfg.bg, color: estadoCfg.color, fontWeight: 600,
                      fontSize: 11.5, borderRadius: 1, border: 'none' }} />
                )}
              </Box>
              <Typography fontSize={16} fontWeight={700} color="#0F172A" lineHeight={1.3}
                sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {comunicado.titulo}
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8', flexShrink: 0 }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>
        {isLoading || !comunicado ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress size={24} sx={{ color: '#0F172A' }} />
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Meta */}
            <Box display="flex" flexDirection="column" gap={2}>
              <InfoRow
                icon={<Person sx={{ fontSize: 16 }} />}
                label="Publicado por"
                value={comunicado.nombre_autor ?? '—'}
              />
              <InfoRow
                icon={<CalendarToday sx={{ fontSize: 16 }} />}
                label="Creado"
                value={dayjs(comunicado.created_at).format('DD/MM/YYYY [·] hh:mm A')}
              />
              {comunicado.fecha_publicacion && (
                <InfoRow
                  icon={<Send sx={{ fontSize: 16 }} />}
                  label="Publicado"
                  value={dayjs(comunicado.fecha_publicacion).format('DD/MM/YYYY [·] hh:mm A')}
                />
              )}
              <InfoRow
                icon={<Campaign sx={{ fontSize: 16 }} />}
                label="Destinatarios"
                value={
                  detalle?.segmentaciones.length
                    ? detalle.segmentaciones.map(s => SEG_LABEL[s.tipo] ?? s.tipo).join(', ')
                    : 'Sin segmentación'
                }
              />
            </Box>

            <Divider sx={{ borderColor: '#E2E8F0' }} />

            {/* Contenido */}
            <Box>
              <Typography fontSize={12} color="#94A3B8" fontWeight={700}
                textTransform="uppercase" letterSpacing="0.06em" mb={1.5}>
                Contenido
              </Typography>
              <Typography fontSize={13.5} color="#334155" lineHeight={1.7}
                sx={{ whiteSpace: 'pre-wrap' }}>
                {detalle?.contenido}
              </Typography>
            </Box>

            {/* Confirmación inline */}
            {confirmAccion && (
              <>
                <Divider sx={{ borderColor: '#E2E8F0' }} />
                <Box sx={{ bgcolor: 'white', border: '1px solid #E2E8F0', borderRadius: 2, p: 2 }}>
                  <Typography fontSize={13} color="#0F172A" fontWeight={600} mb={1.5}>
                    ¿{CONFIRM_LABELS[confirmAccion].label}?
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Button size="small" onClick={() => setConfirmAccion(null)}
                      sx={{ fontSize: 12.5, color: '#64748B', textTransform: 'none' }}>
                      Cancelar
                    </Button>
                    <Button size="small" variant="contained" disabled={isPending}
                      onClick={handleConfirm}
                      sx={{ fontSize: 12.5, textTransform: 'none', boxShadow: 'none', borderRadius: 1,
                        bgcolor: CONFIRM_LABELS[confirmAccion].bg,
                        '&:hover': { boxShadow: 'none', filter: 'brightness(0.9)' } }}>
                      {isPending ? '...' : 'Confirmar'}
                    </Button>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        )}
      </Box>

      {/* Footer — acciones admin según estado */}
      {isAdmin && comunicado && !confirmAccion && (
        <Box sx={{ px: 3, py: 2, bgcolor: 'white', borderTop: '1px solid #E2E8F0',
          flexShrink: 0, display: 'flex', gap: 1.5, alignItems: 'center' }}>
          {comunicado.estado === 'borrador' && (
            <>
              <Button fullWidth variant="contained"
                startIcon={<Send sx={{ fontSize: 16 }} />}
                disabled={!detalle || detalle.segmentaciones.length === 0}
                onClick={() => setConfirmAccion('publicar')}
                title={!detalle || detalle.segmentaciones.length === 0 ? 'El comunicado no tiene destinatarios configurados' : undefined}
                sx={{ bgcolor: '#0F172A', textTransform: 'none', fontSize: 13.5, borderRadius: 1.5,
                  boxShadow: 'none', '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' } }}>
                Publicar
              </Button>
              <Button startIcon={<Archive sx={{ fontSize: 16 }} />}
                onClick={() => setConfirmAccion('eliminar')}
                sx={{ textTransform: 'none', fontSize: 13, color: '#DC2626',
                  '&:hover': { bgcolor: '#FEF2F2' } }}>
                Eliminar
              </Button>
            </>
          )}
          {comunicado.estado === 'publicado' && (
            <Button fullWidth variant="outlined"
              startIcon={<Archive sx={{ fontSize: 16 }} />}
              onClick={() => setConfirmAccion('archivar')}
              sx={{ textTransform: 'none', fontSize: 13.5, borderRadius: 1.5, color: '#64748B',
                borderColor: '#E2E8F0', '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' } }}>
              Archivar comunicado
            </Button>
          )}
        </Box>
      )}
    </Drawer>
  );
}

// ─── CommunicationsPage ───────────────────────────────────────────────────────
export function CommunicationsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.rol === 'administracion' || user?.rol === 'superadmin';

  const [search,       setSearch]       = useState('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoComunicado | ''>('');
  const [tipoFilter,   setTipoFilter]   = useState<TipoComunicado | ''>('');
  const [page,         setPage]         = useState(0);
  const [selected,     setSelected]     = useState<ComunicadoListItem | null>(null);
  const [crearOpen,    setCrearOpen]    = useState(false);

  const { data: comunicados = [], isLoading } = useQuery({
    queryKey: ['comunicados', estadoFilter],
    queryFn:  () => communicationsApi.list(estadoFilter || undefined),
  });

  const q = search.toLowerCase();
  const filtered = comunicados.filter(c => {
    if (tipoFilter && c.tipo !== tipoFilter) return false;
    if (q && ![c.titulo, c.nombre_autor].some(v => v?.toLowerCase().includes(q))) return false;
    return true;
  });

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <Box display="flex" flexDirection="column" gap={2.5}>

      {/* Toolbar */}
      <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por título o autor..."
          width={280}
        />
        <Box flex={1} />
        {isAdmin && (
          <Button startIcon={<Add />} variant="contained"
            onClick={() => setCrearOpen(true)}
            sx={{ bgcolor: '#0F172A', textTransform: 'none', fontSize: 13.5, borderRadius: 1.5,
              boxShadow: 'none', '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' } }}>
            Nuevo comunicado
          </Button>
        )}

        {/* Filtro tipo */}
        <FormControl size="small" sx={{
          minWidth: 165,
          '& .MuiOutlinedInput-root': {
            borderRadius: 1.5, fontSize: 13.5,
            '& fieldset': { borderColor: '#E2E8F0' },
            '&:hover fieldset': { borderColor: '#CBD5E1' },
          },
        }}>
          <Select
            displayEmpty
            value={tipoFilter}
            onChange={e => { setTipoFilter(e.target.value as TipoComunicado | ''); setPage(0); }}
            startAdornment={<FilterList sx={{ fontSize: 16, color: '#94A3B8', mr: 0.5 }} />}
            renderValue={v => v ? TIPO_CFG[v as TipoComunicado].label : 'Tipo'}
          >
            <MenuItem value="" sx={{ fontSize: 13.5 }}>Todos</MenuItem>
            {(Object.keys(TIPO_CFG) as TipoComunicado[]).map(t => (
              <MenuItem key={t} value={t} sx={{ fontSize: 13.5 }}>{TIPO_CFG[t].label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Filtro estado */}
        <FormControl size="small" sx={{
          minWidth: 150,
          '& .MuiOutlinedInput-root': {
            borderRadius: 1.5, fontSize: 13.5,
            '& fieldset': { borderColor: '#E2E8F0' },
            '&:hover fieldset': { borderColor: '#CBD5E1' },
          },
        }}>
          <Select
            displayEmpty
            value={estadoFilter}
            onChange={e => { setEstadoFilter(e.target.value as EstadoComunicado | ''); setPage(0); }}
            startAdornment={<FilterList sx={{ fontSize: 16, color: '#94A3B8', mr: 0.5 }} />}
            renderValue={v => v ? ESTADO_CFG[v as EstadoComunicado].label : 'Estado'}
          >
            <MenuItem value="" sx={{ fontSize: 13.5 }}>Todos</MenuItem>
            {(Object.keys(ESTADO_CFG) as EstadoComunicado[]).map(e => (
              <MenuItem key={e} value={e} sx={{ fontSize: 13.5 }}>{ESTADO_CFG[e].label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <Box sx={{ bgcolor: 'white', borderRadius: 2, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Título', 'Tipo', 'Estado', 'Autor', 'Publicado'].map(h => (
                  <TableCell key={h} sx={TH_SX}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={26} sx={{ color: '#0F172A' }} />
                  </TableCell>
                </TableRow>
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center"
                    sx={{ py: 8, color: '#94A3B8', fontSize: 13.5 }}>
                    Sin comunicados encontrados
                  </TableCell>
                </TableRow>
              ) : paginated.map(c => {
                const tipo   = TIPO_CFG[c.tipo];
                const estado = ESTADO_CFG[c.estado];
                return (
                  <TableRow key={c.id} onClick={() => setSelected(c)}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#F8FAFC' },
                      '&:last-child td': { borderBottom: 0 },
                      opacity: c.estado === 'archivado' ? 0.6 : 1 }}>
                    <TableCell sx={{ ...TD_SX, maxWidth: 320 }}>
                      <Typography fontSize={13.5} fontWeight={600} color="#0F172A"
                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.titulo}
                      </Typography>
                    </TableCell>
                    <TableCell sx={TD_SX}>
                      <Chip label={tipo.label} size="small"
                        sx={{ bgcolor: tipo.bg, color: tipo.color,
                          fontWeight: 700, fontSize: 11.5, borderRadius: 1, border: 'none' }} />
                    </TableCell>
                    <TableCell sx={TD_SX}>
                      <Chip label={estado.label} size="small"
                        sx={{ bgcolor: estado.bg, color: estado.color,
                          fontWeight: 600, fontSize: 11.5, borderRadius: 1, border: 'none' }} />
                    </TableCell>
                    <TableCell sx={{ ...TD_SX, color: '#64748B' }}>
                      {c.nombre_autor ?? '—'}
                    </TableCell>
                    <TableCell sx={{ ...TD_SX, color: '#64748B' }}>
                      {c.fecha_publicacion
                        ? dayjs(c.fecha_publicacion).format('DD/MM/YY · hh:mm A')
                        : <Typography fontSize={12} color="#CBD5E1">—</Typography>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 2, py: 0.5, borderTop: filtered.length > PAGE_SIZE ? '1px solid #F1F5F9' : 'none' }}>
          <Typography fontSize={12} color="#94A3B8">
            {filtered.length} comunicado{filtered.length !== 1 ? 's' : ''}
          </Typography>
          {filtered.length > PAGE_SIZE && (
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              rowsPerPage={PAGE_SIZE}
              rowsPerPageOptions={[]}
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

      <ComunicadoDrawer
        comunicado={selected}
        isAdmin={isAdmin}
        onClose={() => setSelected(null)}
      />
      <CrearComunicadoDialog open={crearOpen} onClose={() => setCrearOpen(false)} />
    </Box>
  );
}
