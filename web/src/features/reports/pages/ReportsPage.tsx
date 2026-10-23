import { useState, useEffect } from 'react';
import {
  Box, Typography, Chip, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow, TablePagination,
  Select, MenuItem, Button, FormControl,
} from '@mui/material';
import { Add, FilterList } from '@mui/icons-material';
import { useQueries } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useLocation } from 'react-router-dom';
import { reportsApi, type EstadoIncidente, type SeveridadIncidente, type IncidenteListItem } from '../api/reportsApi';
import { NewReportDialog } from '../components/NewReportDialog';
import { IncidenteDrawer } from '../components/IncidenteDrawer';
import { SearchBar } from '@/shared/components/SearchBar';

// ─── Tokens de estado ─────────────────────────────────────────────────────────
const ESTADO_CONFIG: Record<EstadoIncidente, { label: string; bg: string; color: string }> = {
  abierta:    { label: 'Abierta',     bg: '#FEF9C3', color: '#854D0E' },
  en_proceso: { label: 'En atención', bg: '#FEF3C7', color: '#92400E' },
  resuelta:   { label: 'Resuelta',    bg: '#DCFCE7', color: '#15803D' },
  cerrada:    { label: 'Cerrada',     bg: '#F1F5F9', color: '#475569' },
  rechazada:  { label: 'Rechazada',   bg: '#FEF2F2', color: '#B91C1C' },
};

// ─── Tokens de severidad ──────────────────────────────────────────────────────
const SEVERIDAD_CONFIG: Record<SeveridadIncidente, { label: string; bg: string; color: string }> = {
  baja:    { label: 'Baja',    bg: '#F0FDF4', color: '#15803D' },
  media:   { label: 'Media',   bg: '#FEF9C3', color: '#854D0E' },
  alta:    { label: 'Alta',    bg: '#FFF7ED', color: '#C2410C' },
  critica: { label: 'Crítica', bg: '#FEF2F2', color: '#B91C1C' },
};

// ─── Chip de estado ───────────────────────────────────────────────────────────
function EstadoChip({ estado }: { estado: EstadoIncidente }) {
  const cfg = ESTADO_CONFIG[estado] ?? { label: estado, bg: '#F1F5F9', color: '#475569' };
  return (
    <Chip label={cfg.label} size="small" sx={{
      bgcolor: cfg.bg, color: cfg.color,
      fontWeight: 600, fontSize: 11.5,
      border: 'none', borderRadius: 1, height: 22,
    }} />
  );
}

// ─── Chip de severidad ────────────────────────────────────────────────────────
function SeveridadChip({ severidad }: { severidad: SeveridadIncidente }) {
  const cfg = SEVERIDAD_CONFIG[severidad] ?? { label: severidad, bg: '#F1F5F9', color: '#475569' };
  return (
    <Chip label={cfg.label} size="small" sx={{
      bgcolor: cfg.bg, color: cfg.color,
      fontWeight: 600, fontSize: 11.5,
      border: 'none', borderRadius: 1, height: 22,
    }} />
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────
export function ReportsPage() {
  const location = useLocation();
  const [estadoFiltro,    setEstadoFiltro]    = useState<EstadoIncidente | ''>('');
  const [severidadFiltro, setSeveridadFiltro] = useState<SeveridadIncidente | ''>('');
  const [dialogOpen, setDialogOpen]           = useState(false);
  const [selectedId, setSelectedId]           = useState<string | null>(null);
  const [search, setSearch]                   = useState('');
  const PAGE_SIZE = 15;
  const [page, setPage]                       = useState(0);

  useEffect(() => {
    if ((location.state as { openNew?: boolean } | null)?.openNew) {
      setDialogOpen(true);
      window.history.replaceState({}, '');
    }
  }, []);

  const [incidentesQ, tiposQ] = useQueries({
    queries: [
      {
        queryKey: ['incidentes', estadoFiltro],
        queryFn: () => reportsApi.getIncidentes(estadoFiltro || undefined),
        refetchInterval: 30_000,
      },
      {
        queryKey: ['tipos-incidente'],
        queryFn: reportsApi.getTipos,
        staleTime: 5 * 60_000,
      },
    ],
  });

  const allIncidentes: IncidenteListItem[] = incidentesQ.data ?? [];
  const tipos = tiposQ.data ?? [];

  const q = search.toLowerCase();
  const incidentes = allIncidentes.filter((i) => {
    if (severidadFiltro && i.severidad !== severidadFiltro) return false;
    if (q && ![ i.asunto, i.numero_radicado, i.nombre_radicador ]
      .some((f) => f?.toLowerCase().includes(q))) return false;
    return true;
  });

  const limpiar = () => { setEstadoFiltro(''); setSeveridadFiltro(''); setSearch(''); setPage(0); };
  const hasFiltros = estadoFiltro !== '' || severidadFiltro !== '';

  return (
    <Box display="flex" flexDirection="column" gap={2.5}>

      {/* ── Toolbar ── */}
      <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(0); }} placeholder="Buscar por título, radicado o reportado por..." width={320} />
        <Box flex={1} />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
          sx={{
            bgcolor: '#0F172A', color: 'white', fontWeight: 700,
            fontSize: 13.5, px: 2.5, py: 1.1, borderRadius: '6px',
            boxShadow: 'none', textTransform: 'none',
            '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' },
          }}
        >
          Registrar novedad
        </Button>

        {/* Filtro severidad */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={severidadFiltro}
            onChange={(e) => { setSeveridadFiltro(e.target.value as SeveridadIncidente | ''); setPage(0); }}
            displayEmpty
            startAdornment={<FilterList sx={{ fontSize: 15, color: '#94A3B8', mr: 0.5 }} />}
            sx={{
              fontSize: 13.5, bgcolor: 'white', borderRadius: '6px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
            }}
          >
            <MenuItem value=""><Typography fontSize={13.5} color="#94A3B8">Severidad</Typography></MenuItem>
            {(Object.entries(SEVERIDAD_CONFIG) as [SeveridadIncidente, { label: string }][]).map(([k, v]) => (
              <MenuItem key={k} value={k} sx={{ fontSize: 13.5 }}>{v.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Filtro estado */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={estadoFiltro}
            onChange={(e) => { setEstadoFiltro(e.target.value as EstadoIncidente | ''); setPage(0); }}
            displayEmpty
            startAdornment={<FilterList sx={{ fontSize: 15, color: '#94A3B8', mr: 0.5 }} />}
            sx={{
              fontSize: 13.5, bgcolor: 'white', borderRadius: '6px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
            }}
          >
            <MenuItem value=""><Typography fontSize={13.5} color="#94A3B8">Estado</Typography></MenuItem>
            {(Object.entries(ESTADO_CONFIG) as [EstadoIncidente, { label: string }][]).map(([k, v]) => (
              <MenuItem key={k} value={k} sx={{ fontSize: 13.5 }}>{v.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {hasFiltros && (
          <Typography
            onClick={limpiar}
            sx={{
              fontSize: 13, fontWeight: 600, color: '#2563EB', cursor: 'pointer',
              '&:hover': { color: '#1D4ED8' },
            }}
          >
            Limpiar filtros
          </Typography>
        )}
      </Box>

      {/* ── Tabla ── */}
      <Box sx={{
        bgcolor: 'white', borderRadius: 2,
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}>
        {incidentesQ.isLoading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress size={28} sx={{ color: '#0F172A' }} />
          </Box>
        ) : incidentes.length === 0 ? (
          <Box py={8} textAlign="center">
            <Typography fontSize={13.5} color="#94A3B8">Sin novedades registradas</Typography>
          </Box>
        ) : (
          <>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': {
                py: 1.25, px: 3, bgcolor: '#F8FAFC',
                fontSize: 11, fontWeight: 700, color: '#94A3B8',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                borderBottom: '1px solid #E2E8F0',
              }}}>
                <TableCell sx={{ width: 120 }}>Novedad</TableCell>
                <TableCell sx={{ width: 130 }}>Severidad</TableCell>
                <TableCell sx={{ width: 220 }}>Título</TableCell>
                <TableCell sx={{ width: 220 }}>Reportado por</TableCell>
                <TableCell sx={{ width: 150 }}>Fecha / Hora</TableCell>
                <TableCell sx={{ width: 130 }}>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incidentes.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((inc) => (
                <TableRow
                  key={inc.id}
                  onClick={() => setSelectedId(inc.id)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#F8FAFC' },
                    '& td': { py: 1.5, px: 3, fontSize: 13.5, borderColor: '#F1F5F9', color: '#334155' },
                    '&:last-child td': { border: 0 },
                  }}
                >
                  <TableCell>
                    <Typography fontSize={13} fontWeight={600} color="#64748B" fontFamily="monospace">
                      {inc.numero_radicado ?? '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>{inc.severidad ? <SeveridadChip severidad={inc.severidad} /> : '—'}</TableCell>
                  <TableCell>
                    <Typography fontSize={13.5} fontWeight={500} color="#0F172A">{inc.asunto}</Typography>
                  </TableCell>
                  <TableCell sx={{ color: '#64748B' }}>
                    {inc.nombre_radicador ?? '—'}
                  </TableCell>
                  <TableCell sx={{ color: '#64748B', fontVariantNumeric: 'tabular-nums' }}>
                    {dayjs(inc.created_at).format('DD/MM/YY · hh:mm A')}
                  </TableCell>
                  <TableCell><EstadoChip estado={inc.estado} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {incidentes.length > PAGE_SIZE && (
            <TablePagination
              component="div"
              count={incidentes.length}
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

      {/* ── Conteo ── */}
      {!incidentesQ.isLoading && incidentes.length > 0 && (
        <Typography fontSize={12} color="#94A3B8">
          {incidentes.length} {incidentes.length === 1 ? 'novedad' : 'novedades'} encontradas
        </Typography>
      )}

      {/* ── Drawer detalle ── */}
      <IncidenteDrawer
        incidenteId={selectedId}
        tipoNombre={(() => {
          if (!selectedId) return '';
          const inc = allIncidentes.find((i) => i.id === selectedId);
          if (!inc?.tipo_incidente_id) return '';
          return tipos.find((t) => t.id === inc.tipo_incidente_id)?.nombre ?? '';
        })()}
        onClose={() => setSelectedId(null)}
        onUpdated={() => incidentesQ.refetch()}
      />

      {/* ── Diálogo nuevo reporte ── */}
      {dialogOpen && (
        <NewReportDialog
          open={dialogOpen}
          tipos={tipos}
          onClose={() => setDialogOpen(false)}
          onCreated={() => {
            setDialogOpen(false);
            incidentesQ.refetch();
          }}
        />
      )}
    </Box>
  );
}
