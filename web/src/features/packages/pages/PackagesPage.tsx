import { useState, useMemo, useEffect } from 'react';
import {
  Box, Typography, Button, Tab, Tabs, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody, TablePagination,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { Add, Close, Inventory2Outlined, MoveToInbox } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/core/api/client';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { SearchBar } from '@/shared/components/SearchBar';
import { packagesApi, type PaqueteItem } from '../api/packagesApi';
import { RegistrarPaqueteDialog } from '../components/RegistrarPaqueteDialog';

dayjs.locale('es');

// ─── Tokens visuales (igual que VisitorsPage) ────────────────────────────────
const TH_SX = {
  py: 1.25, px: 3, bgcolor: '#F8FAFC',
  fontSize: 11, fontWeight: 700, color: '#94A3B8',
  textTransform: 'uppercase' as const, letterSpacing: '0.06em',
  borderBottom: '1px solid #E2E8F0',
};
const TD_SX = {
  py: 1.5, px: 3, fontSize: 13.5, borderColor: '#F1F5F9', color: '#64748B',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Unidad { id: string; numero: string; torre_id: string | null; }
interface Torre  { id: string; nombre: string; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function labelUnidad(u: Unidad, torres: Torre[]) {
  const torre = torres.find(t => t.id === u.torre_id);
  return torre ? `Apto ${u.numero} · ${torre.nombre}` : `Apto ${u.numero}`;
}

function unidadLabel(p: PaqueteItem) {
  return [p.numero_unidad && `Apto ${p.numero_unidad}`, p.nombre_torre]
    .filter(Boolean).join(' · ') || '—';
}

function AntiguedadChip({ fecha }: { fecha: string }) {
  const dias = dayjs().diff(dayjs(fecha), 'day');
  const cfg =
    dias === 0 ? { label: 'hoy',         bg: '#DCFCE7', color: '#15803D' } :
    dias === 1 ? { label: '1 día',       bg: '#FEF3C7', color: '#92400E' } :
                 { label: `${dias} días`, bg: '#FEE2E2', color: '#B91C1C' };
  return (
    <Chip label={cfg.label} size="small" sx={{
      bgcolor: cfg.bg, color: cfg.color,
      fontWeight: 700, fontSize: 11.5, borderRadius: 1, border: 'none', height: 22,
    }} />
  );
}


interface Residente { id: string; nombre: string; apellido: string; }

// ─── Diálogo confirmar retiro ─────────────────────────────────────────────────
function ConfirmarRetiroDialog({ paquete, onClose, onConfirmed }: {
  paquete: PaqueteItem | null; onClose: () => void; onConfirmed: () => void;
}) {
  const [retiradoPor, setRetiradoPor] = useState('');

  const { data: residentes = [], isLoading: loadingResidentes } = useQuery<Residente[]>({
    queryKey: ['residentes-unidad', paquete?.unidad_id],
    queryFn: () => apiClient.get<Residente[]>(`/unidades/${paquete!.unidad_id}/residentes`).then(r => r.data),
    enabled: !!paquete?.unidad_id,
    staleTime: 2 * 60_000,
  });

  useEffect(() => {
    if (residentes.length === 1) {
      setRetiradoPor(`${residentes[0].nombre} ${residentes[0].apellido}`.trim());
    }
  }, [residentes]);

  const mutation = useMutation({
    mutationFn: () => packagesApi.entregar(paquete!.id, retiradoPor || undefined),
    onSuccess: onConfirmed,
  });

  const handleClose = () => { setRetiradoPor(''); onClose(); };

  return (
    <Dialog open={!!paquete} onClose={handleClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography fontWeight={700} fontSize={15.5}>Confirmar Retiro de Paquete</Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: '#94A3B8' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
          <Box>
            <Typography fontSize={11.5} color="#94A3B8" fontWeight={600}
              textTransform="uppercase" letterSpacing="0.05em" mb={0.5}>Unidad</Typography>
            <Typography fontSize={13.5} color="#0F172A" fontWeight={500}>
              {paquete ? unidadLabel(paquete) : '—'}
            </Typography>
          </Box>
          <Box>
            <Typography fontSize={11.5} color="#94A3B8" fontWeight={600}
              textTransform="uppercase" letterSpacing="0.05em" mb={0.5}>Recibido</Typography>
            <Typography fontSize={13.5} color="#0F172A" fontWeight={500}>
              {paquete ? dayjs(paquete.fecha_recepcion).format('DD/MM/YY · HH:mm') : '—'}
            </Typography>
          </Box>
        </Box>

        <FormControl fullWidth size="small" disabled={loadingResidentes}>
          <InputLabel sx={{ fontSize: 13.5 }}>Retirado por</InputLabel>
          <Select
            value={retiradoPor}
            onChange={e => setRetiradoPor(e.target.value)}
            label="Retirado por"
            sx={{ fontSize: 13.5 }}
          >
            {residentes.map(r => (
              <MenuItem key={r.id} value={`${r.nombre} ${r.apellido}`.trim()} sx={{ fontSize: 13.5 }}>
                {r.nombre} {r.apellido}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={handleClose}
          sx={{ color: '#64748B', textTransform: 'none', fontSize: 13.5 }}>
          Cancelar
        </Button>
        <Button variant="contained" disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
          sx={{ bgcolor: '#2563EB', textTransform: 'none', fontSize: 13.5, fontWeight: 600,
            boxShadow: 'none', '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' } }}>
          {mutation.isPending ? 'Confirmando...' : 'Confirmar Retiro'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────
const PAGE_SIZE = 15;

export function PackagesPage() {
  const qc = useQueryClient();
  const [tab,          setTab]          = useState(0);
  const [search,       setSearch]       = useState('');
  const [page0,        setPage0]        = useState(0);
  const [page1,        setPage1]        = useState(0);
  const [selected,     setSelected]     = useState<PaqueteItem | null>(null);
  const [registrarOpen, setRegistrarOpen] = useState(false);

  const porteria = useQuery({
    queryKey: ['paquetes', 'porteria'],
    queryFn: packagesApi.listEnPorteria,
    refetchInterval: 30_000,
  });
  const retirados = useQuery({
    queryKey: ['paquetes', 'retirados'],
    queryFn: packagesApi.listRetiradosSemana,
    refetchInterval: 60_000,
  });

  const isLoading = porteria.isLoading || retirados.isLoading;

  const q = search.toLowerCase();

  const filteredPorteria = useMemo(() =>
    (porteria.data ?? []).filter(p =>
      !q || [p.numero_unidad, p.nombre_torre].some(f => f?.toLowerCase().includes(q))
    ), [porteria.data, q]);

  const filteredRetirados = useMemo(() =>
    (retirados.data ?? []).filter(p =>
      !q || [p.numero_unidad, p.nombre_torre, p.retirado_por_nombre].some(f => f?.toLowerCase().includes(q))
    ), [retirados.data, q]);

  return (
    <Box display="flex" flexDirection="column" gap={2.5}>

      {/* ── Toolbar ── */}
      <Box display="flex" alignItems="center" gap={1.5}>
        <SearchBar
          value={search}
          onChange={v => { setSearch(v); setPage0(0); setPage1(0); }}
          placeholder="Buscar por unidad o remitente..."
          width={280}
        />
        <Box flex={1} />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setRegistrarOpen(true)}
          sx={{
            bgcolor: '#0F172A', color: 'white', fontWeight: 700,
            fontSize: 13.5, px: 2.5, py: 1.1, borderRadius: '6px',
            boxShadow: 'none', textTransform: 'none',
            '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' },
          }}
        >
          Registrar Paquete
        </Button>
      </Box>

      {/* ── Card única con tabs + tablas ── */}
      <Box sx={{
        bgcolor: 'white', borderRadius: 2,
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}>
        <Tabs
          value={tab}
          onChange={(_, v) => { setTab(v); setSearch(''); setPage0(0); setPage1(0); }}
          sx={{
            px: 3, borderBottom: '1px solid #F1F5F9', minHeight: 44,
            '& .MuiTab-root': { fontSize: 13.5, fontWeight: 600, textTransform: 'none', minHeight: 44, color: '#64748B', px: 0, mr: 3 },
            '& .Mui-selected': { color: '#0F172A' },
            '& .MuiTabs-indicator': { bgcolor: '#2563EB', height: 2 },
          }}
        >
          <Tab label={`En Portería${porteria.data?.length ? ` (${porteria.data.length})` : ''}`} />
          <Tab label="Retirados (Semana)" />
        </Tabs>

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress size={28} sx={{ color: '#0F172A' }} />
          </Box>

        ) : tab === 0 ? (
          // ── Tab: En Portería ──
          filteredPorteria.length === 0 ? (
            <Box py={8} textAlign="center">
              <Inventory2Outlined sx={{ fontSize: 36, color: '#E2E8F0', mb: 1, display: 'block', mx: 'auto' }} />
              <Typography fontSize={13.5} color="#94A3B8">
                {q ? 'Sin resultados para tu búsqueda' : 'No hay paquetes en portería'}
              </Typography>
            </Box>
          ) : (
            <>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': TH_SX }}>
                  <TableCell>Unidad</TableCell>
                  <TableCell>Recibido</TableCell>
                  <TableCell>Antigüedad</TableCell>
                  <TableCell sx={{ width: 120 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPorteria.slice(page0 * PAGE_SIZE, (page0 + 1) * PAGE_SIZE).map(p => (
                  <TableRow key={p.id} sx={{
                    '&:hover': { bgcolor: '#F8FAFC' },
                    '& td': TD_SX,
                    '&:last-child td': { border: 0 },
                  }}>
                    <TableCell>
                      <Typography fontSize={13.5} fontWeight={600} color="#0F172A">
                        {unidadLabel(p)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {dayjs(p.fecha_recepcion).format('DD/MM/YY · HH:mm')}
                    </TableCell>
                    <TableCell><AntiguedadChip fecha={p.fecha_recepcion} /></TableCell>
                    <TableCell sx={{ pr: 3 }}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<MoveToInbox sx={{ fontSize: 15 }} />}
                        onClick={() => setSelected(p)}
                        sx={{
                          bgcolor: '#2563EB', fontWeight: 700, fontSize: 12.5,
                          textTransform: 'none', borderRadius: '6px', px: 2, py: 0.7,
                          boxShadow: 'none',
                          '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' },
                        }}
                      >
                        Entregar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredPorteria.length > PAGE_SIZE && (
              <TablePagination
                component="div"
                count={filteredPorteria.length}
                page={page0}
                onPageChange={(_, p) => setPage0(p)}
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
          )

        ) : (
          // ── Tab: Retirados semana ──
          filteredRetirados.length === 0 ? (
            <Box py={8} textAlign="center">
              <Inventory2Outlined sx={{ fontSize: 36, color: '#E2E8F0', mb: 1, display: 'block', mx: 'auto' }} />
              <Typography fontSize={13.5} color="#94A3B8">
                {q ? 'Sin resultados para tu búsqueda' : 'Sin paquetes retirados esta semana'}
              </Typography>
            </Box>
          ) : (
            <>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': TH_SX }}>
                  <TableCell>Unidad</TableCell>
                  <TableCell>Recibido</TableCell>
                  <TableCell>Fecha retiro</TableCell>
                  <TableCell>Retirado por</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRetirados.slice(page1 * PAGE_SIZE, (page1 + 1) * PAGE_SIZE).map(p => (
                  <TableRow key={p.id} sx={{
                    '&:hover': { bgcolor: '#F8FAFC' },
                    '& td': TD_SX,
                    '&:last-child td': { border: 0 },
                  }}>
                    <TableCell>
                      <Typography fontSize={13.5} fontWeight={600} color="#0F172A">
                        {unidadLabel(p)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {dayjs(p.fecha_recepcion).format('DD/MM/YY · HH:mm')}
                    </TableCell>
                    <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {p.fecha_entrega ? dayjs(p.fecha_entrega).format('DD/MM/YY · HH:mm') : '—'}
                    </TableCell>
                    <TableCell>{p.retirado_por_nombre ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredRetirados.length > PAGE_SIZE && (
              <TablePagination
                component="div"
                count={filteredRetirados.length}
                page={page1}
                onPageChange={(_, p) => setPage1(p)}
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
          )
        )}
      </Box>

      {/* ── Dialogs ── */}
      <ConfirmarRetiroDialog
        paquete={selected}
        onClose={() => setSelected(null)}
        onConfirmed={() => {
          setSelected(null);
          qc.invalidateQueries({ queryKey: ['paquetes'] });
        }}
      />
      <RegistrarPaqueteDialog
        open={registrarOpen}
        onClose={() => setRegistrarOpen(false)}
        onCreated={() => {
          setRegistrarOpen(false);
          qc.invalidateQueries({ queryKey: ['paquetes'] });
        }}
      />
    </Box>
  );
}
