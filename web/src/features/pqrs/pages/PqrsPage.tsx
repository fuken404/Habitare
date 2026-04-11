import { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box, Typography, Chip, CircularProgress, Drawer, IconButton,
  Button, TableContainer, Table, TableHead, TableRow, TableCell,
  TableBody, TablePagination, FormControl, Select, MenuItem,
  InputBase, Avatar,
} from '@mui/material';
import {
  FilterList, Close, CalendarToday, Person,
  Send, Lock, Inbox, AttachFile,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { SearchBar } from '@/shared/components/SearchBar';
import { useAuthStore } from '@/core/auth/authStore';
import {
  pqrsApi,
  type PqrsListItem, type EstadoPQRS, type PrioridadPQRS, type TipoPQRS,
} from '../api/pqrsApi';

dayjs.locale('es');

// ─── Visual tokens ────────────────────────────────────────────────────────────
const ESTADO_CFG: Record<EstadoPQRS, { label: string; bg: string; color: string }> = {
  abierta:    { label: 'Abierta',    bg: '#DBEAFE', color: '#1D4ED8' },
  en_proceso: { label: 'En proceso', bg: '#FEF9C3', color: '#A16207' },
  resuelta:   { label: 'Resuelta',   bg: '#DCFCE7', color: '#15803D' },
  cerrada:    { label: 'Cerrada',    bg: '#F1F5F9', color: '#64748B' },
  rechazada:  { label: 'Rechazada',  bg: '#FEE2E2', color: '#DC2626' },
};

const TIPO_CFG: Record<TipoPQRS, { label: string; bg: string; color: string }> = {
  peticion:   { label: 'Petición',   bg: '#DBEAFE', color: '#1D4ED8' },
  queja:      { label: 'Queja',      bg: '#FFEDD5', color: '#C2410C' },
  reclamo:    { label: 'Reclamo',    bg: '#FEE2E2', color: '#DC2626' },
  sugerencia: { label: 'Sugerencia', bg: '#F3E8FF', color: '#7C3AED' },
};

const PRIORIDAD_CFG: Record<PrioridadPQRS, { label: string; bg: string; color: string }> = {
  baja:    { label: 'Baja',    bg: '#F1F5F9', color: '#64748B' },
  media:   { label: 'Media',   bg: '#FEF9C3', color: '#A16207' },
  alta:    { label: 'Alta',    bg: '#FFEDD5', color: '#C2410C' },
  urgente: { label: 'Urgente', bg: '#FEE2E2', color: '#DC2626' },
};

const SIGUIENTE_ESTADO: Partial<Record<EstadoPQRS, { estado: EstadoPQRS; label: string }>> = {
  abierta:    { estado: 'en_proceso', label: 'Tomar en proceso' },
  en_proceso: { estado: 'resuelta',   label: 'Marcar como resuelta' },
  resuelta:   { estado: 'cerrada',    label: 'Cerrar PQRS' },
};

const TH_SX = {
  bgcolor: '#F8FAFC', color: '#94A3B8', fontSize: 11, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.06em', py: 1.5, px: 2,
  borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap',
} as const;

const TD_SX = { py: 1.5, px: 2, borderBottom: '1px solid #F1F5F9', fontSize: 13.5 } as const;

const PAGE_SIZE = 15;

// ─── PqrsDrawer ───────────────────────────────────────────────────────────────
function PqrsDrawer({
  pqrs, isAdmin, onClose,
}: { pqrs: PqrsListItem | null; isAdmin: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [nota, setNota]           = useState('');
  const [esInterno, setEsInterno] = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);

  const { data: detalle, isLoading } = useQuery({
    queryKey: ['pqrs-detalle', pqrs?.id],
    queryFn:  () => pqrsApi.getById(pqrs!.id),
    enabled:  !!pqrs,
  });

  const avanzarMut = useMutation({
    mutationFn: (estado: EstadoPQRS) => pqrsApi.actualizarEstado(pqrs!.id, estado),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pqrs'] });
      qc.invalidateQueries({ queryKey: ['pqrs-detalle', pqrs?.id] });
    },
  });

  const rechazarMut = useMutation({
    mutationFn: () => pqrsApi.rechazar(pqrs!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pqrs'] });
      onClose();
    },
  });

  const mensajeMut = useMutation({
    mutationFn: () => pqrsApi.agregarMensaje(pqrs!.id, nota, esInterno),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pqrs-detalle', pqrs?.id] });
      setNota('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    },
  });

  const estadoCfg = pqrs ? ESTADO_CFG[pqrs.estado] : null;
  const tipoCfg   = pqrs?.tipo ? TIPO_CFG[pqrs.tipo] : null;
  const priorCfg  = pqrs ? PRIORIDAD_CFG[pqrs.prioridad] : null;
  const siguiente = pqrs ? SIGUIENTE_ESTADO[pqrs.estado] : null;
  const esFinal   = pqrs && ['cerrada', 'rechazada'].includes(pqrs.estado);

  const initials = (name: string | null) =>
    name ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '?';

  return (
    <Drawer anchor="right" open={!!pqrs} onClose={onClose}
      PaperProps={{ sx: { width: 520, display: 'flex', flexDirection: 'column',
        bgcolor: '#F8FAFC', borderLeft: '1px solid #E2E8F0' } }}>

      {/* Header */}
      {pqrs && (
        <Box sx={{ px: 3, py: 2.5, bgcolor: 'white', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
          <Box display="flex" alignItems="flex-start" gap={1}>
            <Box flex={1} minWidth={0}>
              <Typography fontSize={11} color="#94A3B8" fontWeight={700}
                textTransform="uppercase" letterSpacing="0.08em" fontFamily="monospace" mb={0.5}>
                {pqrs.numero_radicado ?? '—'}
              </Typography>
              <Typography fontSize={15.5} fontWeight={700} color="#0F172A" lineHeight={1.3}
                sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {pqrs.asunto}
              </Typography>
              <Box display="flex" gap={0.75} mt={1} flexWrap="wrap">
                {tipoCfg && (
                  <Chip label={tipoCfg.label} size="small"
                    sx={{ bgcolor: tipoCfg.bg, color: tipoCfg.color,
                      fontWeight: 700, fontSize: 11.5, borderRadius: 1, border: 'none' }} />
                )}
                {estadoCfg && (
                  <Chip label={estadoCfg.label} size="small"
                    sx={{ bgcolor: estadoCfg.bg, color: estadoCfg.color,
                      fontWeight: 600, fontSize: 11.5, borderRadius: 1, border: 'none' }} />
                )}
                {priorCfg && (
                  <Chip label={priorCfg.label} size="small"
                    sx={{ bgcolor: priorCfg.bg, color: priorCfg.color,
                      fontWeight: 600, fontSize: 11, borderRadius: 1, border: 'none' }} />
                )}
              </Box>
            </Box>
            <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8', flexShrink: 0 }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>

          <Box display="flex" gap={2.5} mt={1.5} flexWrap="wrap">
            <Box display="flex" alignItems="center" gap={0.5}>
              <Person sx={{ fontSize: 13, color: '#94A3B8' }} />
              <Typography fontSize={12} color="#64748B">
                {pqrs.nombre_radicador ?? '—'}
                {pqrs.numero_unidad && ` · Unidad ${pqrs.numero_unidad}`}
                {pqrs.nombre_torre && ` (${pqrs.nombre_torre})`}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <CalendarToday sx={{ fontSize: 13, color: '#94A3B8' }} />
              <Typography fontSize={12} color="#64748B">
                {dayjs(pqrs.created_at).format('DD/MM/YY · hh:mm A')}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Adjuntos */}
      {detalle && detalle.adjuntos.length > 0 && (
        <Box sx={{ px: 3, py: 1.5, bgcolor: 'white', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
          <Box display="flex" alignItems="center" gap={0.5} mb={1}>
            <AttachFile sx={{ fontSize: 13, color: '#94A3B8' }} />
            <Typography fontSize={11} fontWeight={700} color="#94A3B8" textTransform="uppercase" letterSpacing="0.06em">
              Adjuntos ({detalle.adjuntos.length})
            </Typography>
          </Box>
          <Box display="flex" flexWrap="wrap" gap={0.75}>
            {detalle.adjuntos.map(adj => {
              const handleDownload = () => {
                const link = document.createElement('a');
                link.href = `data:${adj.mime_type ?? 'application/octet-stream'};base64,${adj.contenido_b64}`;
                link.download = adj.nombre;
                link.click();
              };
              return (
                <Box key={adj.id} onClick={handleDownload}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 0.75,
                    px: 1.25, py: 0.75, borderRadius: 1.5,
                    border: '1px solid #E2E8F0', bgcolor: '#F8FAFC',
                    cursor: 'pointer', transition: 'all 0.15s',
                    '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' },
                  }}>
                  <AttachFile sx={{ fontSize: 13, color: '#64748B' }} />
                  <Typography fontSize={12} color="#0F172A" fontWeight={500}
                    sx={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {adj.nombre}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Hilo de mensajes */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>
        {isLoading || !pqrs ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress size={24} sx={{ color: '#0F172A' }} />
          </Box>
        ) : !detalle?.mensajes.length ? (
          <Box py={6} textAlign="center">
            <Inbox sx={{ fontSize: 36, color: '#E2E8F0', mb: 1 }} />
            <Typography fontSize={13} color="#94A3B8">Sin mensajes aún</Typography>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={1.5}>
            {detalle.mensajes.map(m => {
              const esMio = m.autor_id === user?.id;
              return (
                <Box key={m.id} display="flex" flexDirection="column"
                  alignItems={esMio ? 'flex-end' : 'flex-start'}>
                  <Box display="flex" alignItems="center" gap={0.75} mb={0.5}
                    flexDirection={esMio ? 'row-reverse' : 'row'}>
                    <Avatar sx={{ width: 22, height: 22,
                      bgcolor: esMio ? '#0F172A' : '#E2E8F0',
                      color: esMio ? 'white' : '#64748B', fontSize: 10, fontWeight: 700 }}>
                      {initials(m.nombre_autor)}
                    </Avatar>
                    <Typography fontSize={11.5} color="#64748B" fontWeight={600}>
                      {m.nombre_autor ?? 'Usuario'}
                    </Typography>
                    {m.is_interno && (
                      <Box display="flex" alignItems="center" gap={0.25}>
                        <Lock sx={{ fontSize: 10, color: '#A16207' }} />
                        <Typography fontSize={10} color="#A16207" fontWeight={700}>Interno</Typography>
                      </Box>
                    )}
                  </Box>
                  <Box sx={{
                    maxWidth: '85%',
                    bgcolor: m.is_interno ? '#FFFBEB' : esMio ? '#0F172A' : 'white',
                    border: m.is_interno ? '1px solid #FDE68A'
                      : esMio ? 'none' : '1px solid #E2E8F0',
                    borderRadius: esMio ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    px: 1.75, py: 1.25,
                  }}>
                    <Typography fontSize={13.5} lineHeight={1.6} sx={{ whiteSpace: 'pre-wrap' }}
                      color={m.is_interno ? '#92400E' : esMio ? 'white' : '#0F172A'}>
                      {m.contenido}
                    </Typography>
                    <Typography fontSize={10.5} mt={0.5} textAlign="right"
                      color={m.is_interno ? '#B45309' : esMio ? 'rgba(255,255,255,0.55)' : '#94A3B8'}>
                      {dayjs(m.created_at).format('DD/MM [·] hh:mm A')}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
            <div ref={bottomRef} />
          </Box>
        )}
      </Box>

      {/* Input de nota */}
      {pqrs && !esFinal && (
        <Box sx={{ px: 3, pt: 1.5, pb: 0, bgcolor: 'white', borderTop: '1px solid #E2E8F0', flexShrink: 0 }}>
          {isAdmin && (
            <Box display="flex" gap={1} mb={1}>
              <Button size="small" onClick={() => setEsInterno(false)}
                sx={{ fontSize: 11.5, textTransform: 'none', borderRadius: 1, px: 1.5,
                  bgcolor: !esInterno ? '#0F172A' : 'transparent',
                  color: !esInterno ? 'white' : '#64748B',
                  '&:hover': { bgcolor: !esInterno ? '#1E293B' : '#F1F5F9' } }}>
                Respuesta pública
              </Button>
              <Button size="small" onClick={() => setEsInterno(true)}
                startIcon={<Lock sx={{ fontSize: 12 }} />}
                sx={{ fontSize: 11.5, textTransform: 'none', borderRadius: 1, px: 1.5,
                  bgcolor: esInterno ? '#FEF9C3' : 'transparent',
                  color: esInterno ? '#A16207' : '#64748B',
                  border: esInterno ? '1px solid #FDE68A' : '1px solid transparent',
                  '&:hover': { bgcolor: esInterno ? '#FEF3C7' : '#F1F5F9' } }}>
                Nota interna
              </Button>
            </Box>
          )}
          <Box sx={{
            display: 'flex', alignItems: 'flex-end', gap: 1, mb: 2,
            border: `1px solid ${esInterno ? '#FDE68A' : '#E2E8F0'}`,
            borderRadius: '10px', px: 1.5, py: 1,
            bgcolor: esInterno ? '#FFFBEB' : 'white',
          }}>
            <InputBase multiline maxRows={4} fullWidth
              placeholder={esInterno
                ? 'Nota interna (solo visible para administración)...'
                : 'Escribe una respuesta...'}
              value={nota}
              onChange={e => setNota(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey && nota.trim()) {
                  e.preventDefault();
                  mensajeMut.mutate();
                }
              }}
              sx={{ fontSize: 13.5, color: '#0F172A', '& textarea': { resize: 'none' } }}
            />
            <IconButton size="small" disabled={!nota.trim() || mensajeMut.isPending}
              onClick={() => mensajeMut.mutate()}
              sx={{ color: nota.trim() ? '#0F172A' : '#CBD5E1', flexShrink: 0, mb: 0.25 }}>
              <Send sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Footer — avance de estado */}
      {isAdmin && pqrs && !esFinal && (
        <Box sx={{ px: 3, py: 2, bgcolor: 'white', borderTop: '1px solid #E2E8F0',
          flexShrink: 0, display: 'flex', gap: 1.5 }}>
          {siguiente && (
            <Button fullWidth variant="contained"
              disabled={avanzarMut.isPending}
              onClick={() => avanzarMut.mutate(siguiente.estado)}
              sx={{ bgcolor: '#0F172A', textTransform: 'none', fontSize: 13.5, borderRadius: 1.5,
                boxShadow: 'none', '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' } }}>
              {avanzarMut.isPending ? '...' : siguiente.label}
            </Button>
          )}
          {['abierta', 'en_proceso'].includes(pqrs.estado) && (
            <Button disabled={rechazarMut.isPending} onClick={() => rechazarMut.mutate()}
              sx={{ textTransform: 'none', fontSize: 13, color: '#DC2626',
                flexShrink: 0, '&:hover': { bgcolor: '#FEF2F2' } }}>
              {rechazarMut.isPending ? '...' : 'Rechazar'}
            </Button>
          )}
        </Box>
      )}
    </Drawer>
  );
}

// ─── PqrsPage ─────────────────────────────────────────────────────────────────
export function PqrsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.rol === 'administracion' || user?.rol === 'superadmin';
  const location = useLocation();

  const [search,       setSearch]       = useState('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoPQRS | ''>((location.state as any)?.estadoFilter ?? '');
  const [tipoFilter,   setTipoFilter]   = useState<TipoPQRS | ''>('');
  const [page,         setPage]         = useState(0);
  const [selected,     setSelected]     = useState<PqrsListItem | null>(null);

  const { data: pqrsList = [], isLoading } = useQuery({
    queryKey: ['pqrs', estadoFilter],
    queryFn:  () => pqrsApi.list(estadoFilter || undefined),
  });

  const q = search.toLowerCase();
  const filtered = pqrsList.filter(p => {
    if (tipoFilter && p.tipo !== tipoFilter) return false;
    if (q && ![p.numero_radicado, p.asunto, p.nombre_radicador, p.numero_unidad]
      .some(v => v?.toLowerCase().includes(q))) return false;
    return true;
  });

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Mantener selected actualizado tras mutaciones
  const selectedActualizado = selected
    ? (pqrsList.find(p => p.id === selected.id) ?? selected)
    : null;

  return (
    <Box display="flex" flexDirection="column" gap={2.5}>

      {/* Toolbar */}
      <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
        <SearchBar value={search} onChange={setSearch}
          placeholder="Buscar por asunto, radicado, unidad..." width={300} />
        <Box flex={1} />

        <FormControl size="small" sx={{
          minWidth: 150,
          '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: 13.5,
            '& fieldset': { borderColor: '#E2E8F0' },
            '&:hover fieldset': { borderColor: '#CBD5E1' } },
        }}>
          <Select displayEmpty value={tipoFilter}
            onChange={e => { setTipoFilter(e.target.value as TipoPQRS | ''); setPage(0); }}
            startAdornment={<FilterList sx={{ fontSize: 16, color: '#94A3B8', mr: 0.5 }} />}
            renderValue={v => v ? TIPO_CFG[v as TipoPQRS].label : 'Tipo'}>
            <MenuItem value="" sx={{ fontSize: 13.5 }}>Todos</MenuItem>
            {(Object.keys(TIPO_CFG) as TipoPQRS[]).map(t => (
              <MenuItem key={t} value={t} sx={{ fontSize: 13.5 }}>{TIPO_CFG[t].label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{
          minWidth: 150,
          '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: 13.5,
            '& fieldset': { borderColor: '#E2E8F0' },
            '&:hover fieldset': { borderColor: '#CBD5E1' } },
        }}>
          <Select displayEmpty value={estadoFilter}
            onChange={e => { setEstadoFilter(e.target.value as EstadoPQRS | ''); setPage(0); }}
            startAdornment={<FilterList sx={{ fontSize: 16, color: '#94A3B8', mr: 0.5 }} />}
            renderValue={v => v ? ESTADO_CFG[v as EstadoPQRS].label : 'Estado'}>
            <MenuItem value="" sx={{ fontSize: 13.5 }}>Todos</MenuItem>
            {(Object.keys(ESTADO_CFG) as EstadoPQRS[]).map(e => (
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
                {['Radicado', 'Tipo', 'Asunto', 'Unidad', 'Prioridad', 'Estado', 'Fecha'].map(h => (
                  <TableCell key={h} sx={TH_SX}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={26} sx={{ color: '#0F172A' }} />
                  </TableCell>
                </TableRow>
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center"
                    sx={{ py: 8, color: '#94A3B8', fontSize: 13.5 }}>
                    Sin PQRS encontradas
                  </TableCell>
                </TableRow>
              ) : paginated.map(p => {
                const est   = ESTADO_CFG[p.estado];
                const tipo  = p.tipo ? TIPO_CFG[p.tipo] : null;
                const prior = PRIORIDAD_CFG[p.prioridad];
                return (
                  <TableRow key={p.id} onClick={() => setSelected(p)}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#F8FAFC' },
                      '&:last-child td': { borderBottom: 0 },
                      opacity: ['cerrada', 'rechazada'].includes(p.estado) ? 0.65 : 1 }}>
                    <TableCell sx={TD_SX}>
                      <Typography fontFamily="monospace" fontWeight={700} fontSize={12} color="#0F172A">
                        {p.numero_radicado ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={TD_SX}>
                      {tipo
                        ? <Chip label={tipo.label} size="small"
                            sx={{ bgcolor: tipo.bg, color: tipo.color,
                              fontWeight: 700, fontSize: 11, borderRadius: 1, border: 'none' }} />
                        : <Typography fontSize={12} color="#CBD5E1">—</Typography>}
                    </TableCell>
                    <TableCell sx={{ ...TD_SX, maxWidth: 260 }}>
                      <Typography fontSize={13.5} fontWeight={600} color="#0F172A"
                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.asunto}
                      </Typography>
                      {p.nombre_radicador && (
                        <Typography fontSize={11.5} color="#94A3B8">{p.nombre_radicador}</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={TD_SX}>
                      <Typography fontSize={13} fontWeight={600} color="#0F172A">
                        {p.numero_unidad ?? '—'}
                      </Typography>
                      {p.nombre_torre && (
                        <Typography fontSize={11.5} color="#94A3B8">{p.nombre_torre}</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={TD_SX}>
                      <Chip label={prior.label} size="small"
                        sx={{ bgcolor: prior.bg, color: prior.color,
                          fontWeight: 600, fontSize: 11, borderRadius: 1, border: 'none' }} />
                    </TableCell>
                    <TableCell sx={TD_SX}>
                      <Chip label={est.label} size="small"
                        sx={{ bgcolor: est.bg, color: est.color,
                          fontWeight: 700, fontSize: 11, borderRadius: 1, border: 'none' }} />
                    </TableCell>
                    <TableCell sx={{ ...TD_SX, color: '#64748B', whiteSpace: 'nowrap' }}>
                      {dayjs(p.created_at).format('DD/MM/YY')}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 2, py: 0.5, borderTop: filtered.length > PAGE_SIZE ? '1px solid #F1F5F9' : 'none' }}>
          <Typography fontSize={12} color="#94A3B8">{filtered.length} PQRS</Typography>
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

      <PqrsDrawer pqrs={selectedActualizado} isAdmin={isAdmin} onClose={() => setSelected(null)} />
    </Box>
  );
}
