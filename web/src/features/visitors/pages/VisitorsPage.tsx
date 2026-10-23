import { useState } from 'react';
import {
  Box, Typography, Avatar, Chip, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow, TablePagination,
  InputBase, Button, Tab, Tabs,
} from '@mui/material';
import { Search, HowToReg } from '@mui/icons-material';
import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { visitorsApi, type Autorizacion, type Ingreso } from '../api/visitorsApi';
import { IngresoVehiculoDialog } from '../components/IngresoVehiculoDialog';
import { ConfirmIngresoDialog } from '../components/ConfirmIngresoDialog';
import { UserDetailDrawer } from '@/shared/components/UserDetailDrawer';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const today = dayjs().format('YYYY-MM-DD');

function nombreCompleto(v: { nombre: string; apellido?: string | null }) {
  return [v.nombre, v.apellido].filter(Boolean).join(' ');
}

function initials(v: { nombre: string; apellido?: string | null }) {
  return `${v.nombre[0] ?? ''}${v.apellido?.[0] ?? ''}`.toUpperCase();
}

// ─── Chip de parqueadero ──────────────────────────────────────────────────────
function ParkChip({ numero }: { numero?: string }) {
  return numero ? (
    <Chip label={numero} size="small" sx={{
      bgcolor: '#DCFCE7', color: '#15803D',
      fontWeight: 700, fontSize: 11, border: 'none', borderRadius: 1, height: 22,
    }} />
  ) : (
    <Chip label="N/A" size="small" sx={{
      bgcolor: '#F1F5F9', color: '#94A3B8',
      fontWeight: 500, fontSize: 11, border: 'none', borderRadius: 1, height: 22,
    }} />
  );
}

// ─── Fila de visitante con avatar ─────────────────────────────────────────────
function VisitanteCell({ v }: { v: Autorizacion['visitante'] }) {
  return (
    <Box display="flex" alignItems="center" gap={1.25}>
      <Avatar sx={{ width: 28, height: 28, fontSize: 10, fontWeight: 700, bgcolor: '#0F172A' }}>
        {initials(v)}
      </Avatar>
      <Typography fontSize={13.5} fontWeight={600} color="#0F172A">{nombreCompleto(v)}</Typography>
    </Box>
  );
}

// ─── Barra de búsqueda ────────────────────────────────────────────────────────
function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1,
      border: '1px solid #E2E8F0', borderRadius: '6px',
      px: 1.5, py: 0.75, bgcolor: '#F8FAFC', width: 280,
      '&:focus-within': { borderColor: '#2563EB', bgcolor: 'white', boxShadow: '0 0 0 3px rgba(37,99,235,0.10)' },
    }}>
      <Search sx={{ fontSize: 16, color: '#94A3B8' }} />
      <InputBase
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar por nombre o documento..."
        sx={{ fontSize: 13.5, flex: 1, '& input::placeholder': { color: '#94A3B8' } }}
      />
    </Box>
  );
}

// ─── Cabecera de tabla ────────────────────────────────────────────────────────
const TH_SX = {
  py: 1.25, px: 3, bgcolor: '#F8FAFC',
  fontSize: 11, fontWeight: 700, color: '#94A3B8',
  textTransform: 'uppercase' as const, letterSpacing: '0.06em',
  borderBottom: '1px solid #E2E8F0',
};
const TD_SX = {
  py: 1.5, px: 3, fontSize: 13.5, borderColor: '#F1F5F9', color: '#64748B',
};

// ─── Página ───────────────────────────────────────────────────────────────────
export function VisitorsPage() {
  const qc = useQueryClient();
  const PAGE_SIZE = 15;
  const [tab, setTab]                   = useState(0);
  const [search, setSearch]             = useState('');
  const [pageAut, setPageAut]           = useState(0);
  const [pageHist, setPageHist]         = useState(0);
  const [pendingId, setPendingId]           = useState<string | null>(null);
  const [confirmAut, setConfirmAut]         = useState<Autorizacion | null>(null);
  const [userDrawer, setUserDrawer]         = useState<{ userId: string; unidadLabel: string | null } | null>(null);

  const [autorizacionesQ, ingresosQ, parkingQ] = useQueries({
    queries: [
      { queryKey: ['autorizaciones'], queryFn: () => visitorsApi.getAutorizaciones(), refetchInterval: 30_000 },
      { queryKey: ['ingresos-hoy'],   queryFn: () => visitorsApi.getIngresos(today),  refetchInterval: 30_000 },
      { queryKey: ['parking-activo'], queryFn: visitorsApi.getParqueaderosActivos,     refetchInterval: 30_000 },
    ],
  });

  const ingresoMutation = useMutation({
    mutationFn: visitorsApi.registrarIngreso,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['autorizaciones'] });
      qc.invalidateQueries({ queryKey: ['ingresos-hoy'] });
      qc.invalidateQueries({ queryKey: ['parking-activo'] });
    },
  });

  const autorizaciones: Autorizacion[] = autorizacionesQ.data ?? [];
  const ingresos: Ingreso[]            = ingresosQ.data ?? [];
  const parking                        = parkingQ.data ?? [];
  const parkingMap = new Map(parking.map((p) => [p.ingreso_visita_id, p.numero]));

  // Autorizaciones pendientes (estado pendiente/aprobada, fecha visita hoy o futura)
  const pendientes = autorizaciones.filter(
    (a) => a.estado === 'pendiente' || a.estado === 'activa'
  );

  const filtered = (list: Autorizacion[]) =>
    search.trim()
      ? list.filter((a) => {
          const q = search.toLowerCase();
          return nombreCompleto(a.visitante).toLowerCase().includes(q)
            || a.visitante.n_documento.includes(q);
        })
      : list;

  const filteredIngresos = search.trim()
    ? ingresos.filter((i) => {
        const q = search.toLowerCase();
        return nombreCompleto(i.visitante).toLowerCase().includes(q)
          || i.visitante.n_documento.includes(q);
      })
    : ingresos;

  // Mapa de autorizacion_id → autorizacion (para Autorizado Por en historial)
  const autMap = new Map(autorizaciones.map((a) => [a.id, a]));

  const handleMarcarIngreso = (aut: Autorizacion) => {
    if (aut.requiere_parqueadero) {
      setPendingId(aut.id);
    } else {
      setConfirmAut(aut);
    }
  };

  const isLoading = autorizacionesQ.isLoading || ingresosQ.isLoading;

  return (
    <Box display="flex" flexDirection="column" gap={2.5}>

      {/* ── Toolbar ── */}
      <Box>
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPageAut(0); setPageHist(0); }} />
      </Box>

      {/* ── Card con tabs ── */}
      <Box sx={{
        bgcolor: 'white', borderRadius: 2,
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}>
        <Tabs
          value={tab}
          onChange={(_, v) => { setTab(v); setSearch(''); setPageAut(0); setPageHist(0); }}
          sx={{
            px: 3, borderBottom: '1px solid #F1F5F9', minHeight: 44,
            '& .MuiTab-root': { fontSize: 13.5, fontWeight: 600, textTransform: 'none', minHeight: 44, color: '#64748B', px: 0, mr: 3 },
            '& .Mui-selected': { color: '#0F172A' },
            '& .MuiTabs-indicator': { bgcolor: '#2563EB', height: 2 },
          }}
        >
          <Tab label={`Autorizaciones Pendientes${pendientes.length ? ` (${pendientes.length})` : ''}`} />
          <Tab label="Historial de Hoy" />
        </Tabs>

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress size={28} sx={{ color: '#0F172A' }} />
          </Box>
        ) : tab === 0 ? (
          // ── Tab: Autorizaciones pendientes ──
          filtered(pendientes).length === 0 ? (
            <Box py={8} textAlign="center">
              <Typography fontSize={13.5} color="#94A3B8">Sin autorizaciones pendientes</Typography>
            </Box>
          ) : (
            <>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': TH_SX }}>
                  <TableCell>Visitante</TableCell>
                  <TableCell>Documento</TableCell>
                  <TableCell>Autorizado por</TableCell>
                  <TableCell>Fecha visita</TableCell>
                  <TableCell>Parqueadero</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered(pendientes).slice(pageAut * PAGE_SIZE, (pageAut + 1) * PAGE_SIZE).map((aut) => (
                  <TableRow key={aut.id} sx={{
                    '&:hover': { bgcolor: '#F8FAFC' },
                    '& td': TD_SX,
                    '&:last-child td': { border: 0 },
                  }}>
                    <TableCell><VisitanteCell v={aut.visitante} /></TableCell>
                    <TableCell>{aut.visitante.tipo_documento}. {aut.visitante.n_documento}</TableCell>
                    <TableCell>
                      {aut.nombre_autorizado_por ? (
                        <Button size="small" variant="text"
                          onClick={() => {
                            const label = [aut.numero_unidad && `Apto ${aut.numero_unidad}`, aut.nombre_torre]
                              .filter(Boolean).join(' · ') || null;
                            setUserDrawer({ userId: aut.autorizado_por, unidadLabel: label });
                          }}
                          sx={{ p: 0, minWidth: 0, fontSize: 13.5, color: '#64748B', textTransform: 'none',
                            '&:hover': { color: '#2563EB', bgcolor: 'transparent' } }}>
                          {[aut.nombre_autorizado_por, aut.numero_unidad, aut.nombre_torre].filter(Boolean).join(' – ')}
                        </Button>
                      ) : '—'}
                    </TableCell>
                    <TableCell>{dayjs(aut.fecha_visita).format('DD/MM/YYYY')}</TableCell>
                    <TableCell>
                      {aut.requiere_parqueadero ? (
                        <Chip label="Requiere" size="small" sx={{
                          bgcolor: '#EFF6FF', color: '#2563EB',
                          fontWeight: 600, fontSize: 11, border: 'none', borderRadius: 1, height: 22,
                        }} />
                      ) : <ParkChip />}
                    </TableCell>
                    <TableCell sx={{ pr: 3 }}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<HowToReg sx={{ fontSize: 15 }} />}
                        onClick={() => handleMarcarIngreso(aut)}
                        disabled={ingresoMutation.isPending}
                        sx={{
                          bgcolor: '#2563EB', fontWeight: 700, fontSize: 12.5,
                          textTransform: 'none', borderRadius: '6px', px: 2, py: 0.7,
                          boxShadow: 'none',
                          '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' },
                        }}
                      >
                        Marcar ingreso
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filtered(pendientes).length > PAGE_SIZE && (
              <TablePagination
                component="div"
                count={filtered(pendientes).length}
                page={pageAut}
                onPageChange={(_, p) => setPageAut(p)}
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
          // ── Tab: Historial de hoy ──
          filteredIngresos.length === 0 ? (
            <Box py={8} textAlign="center">
              <Typography fontSize={13.5} color="#94A3B8">Sin ingresos registrados hoy</Typography>
            </Box>
          ) : (
            <>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': TH_SX }}>
                  <TableCell>Visitante</TableCell>
                  <TableCell>Documento</TableCell>
                  <TableCell>Autorizado por</TableCell>
                  <TableCell>Hora ingreso</TableCell>
                  <TableCell>Parqueadero</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredIngresos.slice(pageHist * PAGE_SIZE, (pageHist + 1) * PAGE_SIZE).map((ing) => {
                  const aut  = ing.autorizacion_id ? autMap.get(ing.autorizacion_id) : undefined;
                  const park = parkingMap.get(ing.id);
                  const autPor = aut
                    ? [aut.nombre_autorizado_por, aut.numero_unidad, aut.nombre_torre].filter(Boolean).join(' – ')
                    : '—';
                  return (
                    <TableRow key={ing.id} sx={{
                      '&:hover': { bgcolor: '#F8FAFC' },
                      '& td': TD_SX,
                      '&:last-child td': { border: 0 },
                    }}>
                      <TableCell><VisitanteCell v={ing.visitante} /></TableCell>
                      <TableCell>{ing.visitante.tipo_documento}. {ing.visitante.n_documento}</TableCell>
                      <TableCell>{autPor}</TableCell>
                      <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {dayjs(ing.fecha_hora_ingreso).format('hh:mm A')}
                      </TableCell>
                      <TableCell><ParkChip numero={park} /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filteredIngresos.length > PAGE_SIZE && (
              <TablePagination
                component="div"
                count={filteredIngresos.length}
                page={pageHist}
                onPageChange={(_, p) => setPageHist(p)}
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

      {/* ── Diálogo: confirmación de ingreso ── */}
      <ConfirmIngresoDialog
        open={!!confirmAut}
        visitante={confirmAut ? nombreCompleto(confirmAut.visitante) : ''}
        autorizadoPor={confirmAut
          ? [confirmAut.nombre_autorizado_por, confirmAut.numero_unidad, confirmAut.nombre_torre]
              .filter(Boolean).join(' – ')
          : ''}
        loading={ingresoMutation.isPending}
        onConfirm={() => {
          if (!confirmAut) return;
          ingresoMutation.mutate(
            { autorizacion_id: confirmAut.id },
            { onSuccess: () => setConfirmAut(null) },
          );
        }}
        onClose={() => setConfirmAut(null)}
      />

      {/* ── Diálogo: ingreso con vehículo ── */}
      {pendingId && (
        <IngresoVehiculoDialog
          open={!!pendingId}
          onClose={() => setPendingId(null)}
          onConfirm={(tipo_vehiculo, placa) => {
            ingresoMutation.mutate({ autorizacion_id: pendingId!, tipo_vehiculo, placa });
            setPendingId(null);
          }}
        />
      )}

      {/* ── Drawer detalle de residente ── */}
      <UserDetailDrawer
        userId={userDrawer?.userId ?? null}
        unidadLabel={userDrawer?.unidadLabel}
        onClose={() => setUserDrawer(null)}
      >
        {userDrawer && autorizaciones
          .filter(a => a.autorizado_por === userDrawer.userId)
          .slice(0, 10)
          .map(a => (
            <Box key={a.id} sx={{ p: 1.5, borderRadius: 1.5, border: '1px solid #E2E8F0',
              bgcolor: 'white' }}>
              <Typography fontSize={13} fontWeight={600} color="#0F172A">
                {nombreCompleto(a.visitante)}
              </Typography>
              <Typography fontSize={11.5} color="#94A3B8" mt={0.25}>
                {dayjs(a.fecha_visita).format('DD/MM/YYYY')}
                {a.estado !== 'pendiente' && ` · ${a.estado}`}
              </Typography>
            </Box>
          ))}
      </UserDetailDrawer>

    </Box>
  );
}
