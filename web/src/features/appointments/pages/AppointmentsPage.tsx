import { useState } from 'react';
import {
  Box, Typography, Button, Chip, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody, TablePagination,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Tabs, Tab,
  Drawer, InputBase,
} from '@mui/material';
import { Add, Close, Send } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { SearchBar } from '@/shared/components/SearchBar';
import { appointmentsApi, type CitaItem, type EstadoCita, type DisponibilidadCreate } from '../api/appointmentsApi';

dayjs.locale('es');

// ─── Tokens visuales ─────────────────────────────────────────────────────────
const TH_SX = {
  py: 1.25, px: 3, bgcolor: '#F8FAFC',
  fontSize: 11, fontWeight: 700, color: '#94A3B8',
  textTransform: 'uppercase' as const, letterSpacing: '0.06em',
  borderBottom: '1px solid #E2E8F0',
};
const TD_SX = { py: 1.5, px: 3, fontSize: 13.5, borderColor: '#F1F5F9', color: '#64748B' };
const PAGE_SIZE = 15;

const ESTADO_CFG: Record<EstadoCita, { label: string; bg: string; color: string }> = {
  solicitada: { label: 'Solicitada', bg: '#FEF9C3', color: '#A16207' },
  confirmada: { label: 'Confirmada', bg: '#DCFCE7', color: '#15803D' },
  rechazada:  { label: 'Rechazada',  bg: '#FEE2E2', color: '#DC2626' },
  completada: { label: 'Completada', bg: '#F1F5F9', color: '#64748B' },
};

const SIGUIENTE: Partial<Record<EstadoCita, { next: EstadoCita; label: string }>> = {
  solicitada: { next: 'confirmada', label: 'Confirmar' },
  confirmada: { next: 'completada', label: 'Completar' },
};

function unidadLabel(c: CitaItem) {
  return [c.numero_unidad && `Apto ${c.numero_unidad}`, c.nombre_torre]
    .filter(Boolean).join(' · ') || null;
}

// ─── Dialog crear disponibilidad ─────────────────────────────────────────────
function CrearSlotDialog({ open, onClose, onCreated }: {
  open: boolean; onClose: () => void; onCreated: () => void;
}) {
  const [form, setForm] = useState<DisponibilidadCreate>({
    fecha: '', hora_inicio: '', hora_fin: '', cupos_totales: 1,
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => appointmentsApi.crearDisponibilidad(form),
    onSuccess: () => { onCreated(); handleClose(); },
    onError: (err: any) => setError(err?.response?.data?.detail ?? 'Error al crear la franja'),
  });

  const handleClose = () => {
    setForm({ fecha: '', hora_inicio: '', hora_fin: '', cupos_totales: 1 });
    setError('');
    onClose();
  };

  const canSubmit = form.fecha && form.hora_inicio && form.hora_fin;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography fontWeight={700} fontSize={15.5}>Nueva franja de disponibilidad</Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: '#94A3B8' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
        <TextField
          label="Fecha" type="date" size="small" fullWidth
          value={form.fecha}
          onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: dayjs().format('YYYY-MM-DD') }}
          sx={{ '& .MuiInputBase-input': { fontSize: 13.5 } }}
        />
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
          <TextField
            label="Hora inicio" type="time" size="small"
            value={form.hora_inicio}
            onChange={e => setForm(f => ({ ...f, hora_inicio: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            sx={{ '& .MuiInputBase-input': { fontSize: 13.5 } }}
          />
          <TextField
            label="Hora fin" type="time" size="small"
            value={form.hora_fin}
            onChange={e => setForm(f => ({ ...f, hora_fin: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            sx={{ '& .MuiInputBase-input': { fontSize: 13.5 } }}
          />
        </Box>
        <TextField
          label="Cupos" type="number" size="small" fullWidth
          value={form.cupos_totales}
          onChange={e => setForm(f => ({ ...f, cupos_totales: parseInt(e.target.value) || 1 }))}
          inputProps={{ min: 1, max: 20 }}
          sx={{ '& .MuiInputBase-input': { fontSize: 13.5 } }}
        />
        {error && <Typography fontSize={12.5} color="error">{error}</Typography>}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={handleClose} sx={{ color: '#64748B', textTransform: 'none', fontSize: 13.5 }}>
          Cancelar
        </Button>
        <Button variant="contained" disabled={!canSubmit || mutation.isPending}
          onClick={() => mutation.mutate()}
          sx={{ bgcolor: '#0F172A', textTransform: 'none', fontSize: 13.5, fontWeight: 600,
            boxShadow: 'none', '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' } }}>
          {mutation.isPending ? 'Creando...' : 'Crear franja'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Drawer detalle de cita ───────────────────────────────────────────────────
function CitaDrawer({ cita, onClose }: { cita: CitaItem | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [obs, setObs] = useState('');

  const avanzarMut = useMutation({
    mutationFn: (estado: EstadoCita) =>
      appointmentsApi.actualizarCita(cita!.id, { estado }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['citas'] }),
  });

  const rechazarMut = useMutation({
    mutationFn: () => appointmentsApi.actualizarCita(cita!.id, {
      estado: 'rechazada',
      observaciones_admin: obs.trim() || undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['citas'] }); onClose(); },
  });

  const siguiente = cita ? SIGUIENTE[cita.estado] : null;
  const esFinal   = cita && ['rechazada', 'completada'].includes(cita.estado);

  return (
    <Drawer anchor="right" open={!!cita} onClose={onClose}
      PaperProps={{ sx: { width: 420, display: 'flex', flexDirection: 'column',
        bgcolor: '#F8FAFC', borderLeft: '1px solid #E2E8F0' } }}>

      {cita && (
        <>
          <Box sx={{ px: 3, py: 2.5, bgcolor: 'white', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
              <Box flex={1}>
                <Typography fontSize={11} color="#94A3B8" fontWeight={700}
                  textTransform="uppercase" letterSpacing="0.08em">Detalle de cita</Typography>
              </Box>
              <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}>
                <Close fontSize="small" />
              </IconButton>
            </Box>

            <Chip label={ESTADO_CFG[cita.estado].label} size="small"
              sx={{ bgcolor: ESTADO_CFG[cita.estado].bg, color: ESTADO_CFG[cita.estado].color,
                fontWeight: 700, fontSize: 11.5, borderRadius: 1, border: 'none', mb: 1.5 }} />

            <Box display="flex" flexDirection="column" gap={1.25}>
              {[
                { label: 'Residente',  value: cita.nombre_residente },
                { label: 'Unidad',     value: unidadLabel(cita) },
                { label: 'Fecha',      value: cita.fecha ? dayjs(cita.fecha).format('dddd D [de] MMMM [de] YYYY') : null },
                { label: 'Horario',    value: cita.hora_inicio && cita.hora_fin
                  ? `${cita.hora_inicio.slice(0, 5)} – ${cita.hora_fin.slice(0, 5)}` : null },
                { label: 'Motivo',     value: cita.motivo },
                { label: 'Obs. admin', value: cita.observaciones_admin },
              ].map(({ label, value }) => value ? (
                <Box key={label}>
                  <Typography fontSize={10.5} color="#94A3B8" fontWeight={600}
                    textTransform="uppercase" letterSpacing="0.05em">{label}</Typography>
                  <Typography fontSize={13.5} color="#0F172A">{value}</Typography>
                </Box>
              ) : null)}
            </Box>
          </Box>

          {!esFinal && (
            <Box sx={{ px: 3, py: 2.5, bgcolor: 'white', borderTop: '1px solid #E2E8F0',
              mt: 'auto', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {siguiente && (
                <Button fullWidth variant="contained"
                  disabled={avanzarMut.isPending}
                  onClick={() => avanzarMut.mutate(siguiente.next)}
                  sx={{ bgcolor: '#0F172A', textTransform: 'none', fontSize: 13.5, borderRadius: 1.5,
                    boxShadow: 'none', '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' } }}>
                  {avanzarMut.isPending ? '...' : siguiente.label}
                </Button>
              )}
              {['solicitada', 'confirmada'].includes(cita.estado) && (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1,
                    border: '1px solid #E2E8F0', borderRadius: '10px', px: 1.5, py: 1, bgcolor: 'white' }}>
                    <InputBase multiline maxRows={3} fullWidth
                      placeholder="Observación (opcional antes de rechazar)..."
                      value={obs} onChange={e => setObs(e.target.value)}
                      sx={{ fontSize: 13.5, color: '#0F172A' }} />
                    <IconButton size="small" disabled={rechazarMut.isPending}
                      onClick={() => rechazarMut.mutate()}
                      sx={{ color: '#DC2626', flexShrink: 0 }}>
                      <Send sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                  <Button disabled={rechazarMut.isPending} onClick={() => rechazarMut.mutate()}
                    sx={{ textTransform: 'none', fontSize: 13, color: '#DC2626',
                      '&:hover': { bgcolor: '#FEF2F2' } }}>
                    {rechazarMut.isPending ? '...' : 'Rechazar cita'}
                  </Button>
                </>
              )}
            </Box>
          )}
        </>
      )}
    </Drawer>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────
export function AppointmentsPage() {
  const qc = useQueryClient();
  const [tab,         setTab]         = useState(0);
  const [search,      setSearch]      = useState('');
  const [estadoF,     setEstadoF]     = useState<EstadoCita | ''>('');
  const [page,        setPage]        = useState(0);
  const [slotOpen,    setSlotOpen]    = useState(false);
  const [selected,    setSelected]    = useState<CitaItem | null>(null);

  const citasQ = useQuery({
    queryKey: ['citas', estadoF],
    queryFn: () => appointmentsApi.listCitas(estadoF ? { estado: estadoF } : undefined),
    refetchInterval: 60_000,
  });

  const slotsQ = useQuery({
    queryKey: ['citas-disponibilidad'],
    queryFn: () => appointmentsApi.listDisponibilidad(),
    enabled: tab === 1,
  });

  const q = search.toLowerCase();
  const filteredCitas = (citasQ.data ?? []).filter(c =>
    !q || [c.nombre_residente, c.numero_unidad, c.nombre_torre, c.motivo]
      .some(f => f?.toLowerCase().includes(q))
  );
  const paginated = filteredCitas.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <Box display="flex" flexDirection="column" gap={2.5}>

      {/* Toolbar */}
      <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
        {tab === 0 && (
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(0); }}
            placeholder="Buscar por residente, unidad..." width={260} />
        )}
        <Box flex={1} />
        <Button variant="contained" startIcon={<Add />}
          onClick={() => setSlotOpen(true)}
          sx={{ bgcolor: '#0F172A', color: 'white', fontWeight: 700, fontSize: 13.5,
            px: 2.5, py: 1.1, borderRadius: '6px', boxShadow: 'none', textTransform: 'none',
            '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' } }}>
          Nueva franja
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ bgcolor: 'white', borderRadius: 2, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{
            px: 3, borderBottom: '1px solid #F1F5F9', minHeight: 44,
            '& .MuiTab-root': { fontSize: 13.5, fontWeight: 600, textTransform: 'none', minHeight: 44,
              color: '#64748B', px: 0, mr: 3 },
            '& .Mui-selected': { color: '#0F172A' },
            '& .MuiTabs-indicator': { bgcolor: '#2563EB', height: 2 },
          }}>
          <Tab label={`Citas${citasQ.data?.length ? ` (${citasQ.data.length})` : ''}`} />
          <Tab label="Disponibilidad" />
        </Tabs>

        {tab === 0 ? (
          // ── Tab: citas ──
          citasQ.isLoading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress size={26} sx={{ color: '#0F172A' }} />
            </Box>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    {['Residente', 'Unidad', 'Fecha', 'Horario', 'Motivo', 'Estado'].map(h => (
                      <TableCell key={h} sx={TH_SX}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8, color: '#94A3B8', fontSize: 13.5 }}>
                        Sin citas registradas
                      </TableCell>
                    </TableRow>
                  ) : paginated.map(c => {
                    const est = ESTADO_CFG[c.estado];
                    return (
                      <TableRow key={c.id} onClick={() => setSelected(c)}
                        sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#F8FAFC' },
                          '& td': TD_SX, '&:last-child td': { border: 0 } }}>
                        <TableCell>
                          <Typography fontSize={13.5} fontWeight={600} color="#0F172A">
                            {c.nombre_residente ?? '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>{unidadLabel(c) ?? '—'}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {c.fecha ? dayjs(c.fecha).format('DD/MM/YYYY') : '—'}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                          {c.hora_inicio && c.hora_fin
                            ? `${c.hora_inicio.slice(0, 5)} – ${c.hora_fin.slice(0, 5)}`
                            : '—'}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>
                          <Typography fontSize={13} color="#64748B"
                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.motivo}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={est.label} size="small"
                            sx={{ bgcolor: est.bg, color: est.color,
                              fontWeight: 700, fontSize: 11, borderRadius: 1, border: 'none' }} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: 2, py: 0.5, borderTop: filteredCitas.length > PAGE_SIZE ? '1px solid #F1F5F9' : 'none' }}>
                <Typography fontSize={12} color="#94A3B8">{filteredCitas.length} cita{filteredCitas.length !== 1 ? 's' : ''}</Typography>
                {filteredCitas.length > PAGE_SIZE && (
                  <TablePagination component="div" count={filteredCitas.length} page={page}
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
            </>
          )
        ) : (
          // ── Tab: disponibilidad ──
          slotsQ.isLoading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress size={26} sx={{ color: '#0F172A' }} />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  {['Fecha', 'Horario', 'Cupos totales', 'Disponibles'].map(h => (
                    <TableCell key={h} sx={TH_SX}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {(slotsQ.data ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 8, color: '#94A3B8', fontSize: 13.5 }}>
                      Sin franjas de disponibilidad
                    </TableCell>
                  </TableRow>
                ) : (slotsQ.data ?? []).map(s => (
                  <TableRow key={s.id} sx={{ '& td': TD_SX, '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {dayjs(s.fecha).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                      {s.hora_inicio.slice(0, 5)} – {s.hora_fin.slice(0, 5)}
                    </TableCell>
                    <TableCell>{s.cupos_totales}</TableCell>
                    <TableCell>
                      <Chip
                        label={s.cupos_disponibles}
                        size="small"
                        sx={{
                          bgcolor: s.cupos_disponibles > 0 ? '#DCFCE7' : '#F1F5F9',
                          color:   s.cupos_disponibles > 0 ? '#15803D' : '#94A3B8',
                          fontWeight: 700, fontSize: 11.5, borderRadius: 1, border: 'none',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )
        )}
      </Box>

      <CrearSlotDialog
        open={slotOpen}
        onClose={() => setSlotOpen(false)}
        onCreated={() => {
          setSlotOpen(false);
          qc.invalidateQueries({ queryKey: ['citas-disponibilidad'] });
        }}
      />

      <CitaDrawer cita={selected} onClose={() => setSelected(null)} />
    </Box>
  );
}
