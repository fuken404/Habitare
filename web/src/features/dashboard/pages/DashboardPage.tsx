import {
  Box, Typography, Grid, Avatar, Chip, CircularProgress, Link,
  Table, TableBody, TableCell, TableHead, TableRow, TablePagination,
  Tabs, Tab, Button, Dialog, DialogContent, DialogActions,
} from '@mui/material';
import {
  PersonAdd, Inventory, EventAvailable, ReportProblem,
  PeopleAlt, AssignmentTurnedIn, LocalShipping, LocalParking,
  ArrowForward, Apartment, Inbox, MoneyOff, Campaign,
  CheckCircleOutline, PersonOff,
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IngresoRapidoDialog } from '@/features/visitors/components/IngresoRapidoDialog';
import { RegistrarPaqueteDialog } from '@/features/packages/components/RegistrarPaqueteDialog';
import { NewReportDialog } from '@/features/reports/components/NewReportDialog';
import { reportsApi } from '@/features/reports/api/reportsApi';
import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useAuthStore } from '@/core/auth/authStore';
import { dashboardApi } from '../api/dashboardApi';
import { adminDashboardApi } from '../api/adminDashboardApi';
import { CrearComunicadoDialog } from '@/features/communications/pages/CommunicationsPage';
import { pqrsApi } from '@/features/pqrs/api/pqrsApi';

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  subColor?: string;
  icon: React.ReactNode;
  accentColor: string;
  loading?: boolean;
}

function StatCard({ label, value, sub, subColor, icon, accentColor, loading }: StatCardProps) {
  return (
    <Box
      sx={{
        minWidth: 0,
        bgcolor: 'white',
        borderRadius: 2,
        border: '1px solid #E2E8F0',
        borderTop: `3px solid ${accentColor}`,
        p: 2.5,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
        <Typography variant="caption" color="#64748B" fontWeight={600}
          sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </Typography>
        <Box sx={{
          width: 36, height: 36, borderRadius: 1.5,
          bgcolor: `${accentColor}14`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          '& svg': { fontSize: 18, color: accentColor },
        }}>
          {icon}
        </Box>
      </Box>

      {loading ? (
        <CircularProgress size={24} sx={{ color: accentColor }} />
      ) : (
        <Typography variant="h4" fontWeight={800} color="#0F172A" lineHeight={1} mb={0.75}>
          {value}
        </Typography>
      )}
      <Typography variant="body2" color={subColor ?? '#64748B'} fontSize={12}>
        {sub}
      </Typography>
    </Box>
  );
}

// ─── Quick Action ─────────────────────────────────────────────────────────────
function QuickAction({ label, icon, accentColor, onClick }: {
  label: string; icon: React.ReactNode; accentColor: string; onClick: () => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        p: '12px 16px', borderRadius: 1.5, cursor: 'pointer',
        border: '1px solid #E2E8F0', bgcolor: 'white',
        transition: 'all 0.15s ease',
        '&:hover': {
          borderColor: accentColor,
          bgcolor: `${accentColor}08`,
          '& .arrow': { color: accentColor, transform: 'translateX(2px)' },
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={1.5}>
        <Box sx={{
          width: 34, height: 34, borderRadius: 1.5,
          bgcolor: `${accentColor}14`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          '& svg': { fontSize: 17, color: accentColor },
        }}>
          {icon}
        </Box>
        <Typography fontSize={13.5} fontWeight={600} color="#1E293B">{label}</Typography>
      </Box>
      <ArrowForward className="arrow" sx={{ fontSize: 15, color: '#CBD5E1', transition: 'all 0.15s ease' }} />
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [ingresoOpen,   setIngresoOpen]   = useState(false);
  const [paqueteOpen,   setPaqueteOpen]   = useState(false);
  const [novedadOpen,   setNovedadOpen]   = useState(false);
  const [tablaPage, setTablaPage] = useState(0);
  const PAGE_SIZE = 15;

  if (user?.rol !== 'recepcion') return <AdminDashboard />;

  const [ingresosQ, autorizacionesQ, paquetesQ, lugaresQ, parkingActivoQ, tiposQ] = useQueries({
    queries: [
      { queryKey: ['ingresos-hoy'],        queryFn: dashboardApi.getIngresos,             refetchInterval: 30_000 },
      { queryKey: ['autorizaciones-dash'],  queryFn: dashboardApi.getAutorizaciones,       refetchInterval: 30_000 },
      { queryKey: ['paquetes-dash'],        queryFn: dashboardApi.getPaquetes,             refetchInterval: 30_000 },
      { queryKey: ['lugares-dash'],         queryFn: dashboardApi.getLugares,              refetchInterval: 30_000 },
      { queryKey: ['parking-activo-dash'],  queryFn: dashboardApi.getParqueaderosActivos,  refetchInterval: 30_000 },
      { queryKey: ['tipos-incidente'],      queryFn: reportsApi.getTipos,                  staleTime: 5 * 60_000 },
    ],
  });

  const ingresos       = ingresosQ.data ?? [];
  const autorizaciones = autorizacionesQ.data ?? [];
  const paquetes       = paquetesQ.data ?? [];
  const lugares        = lugaresQ.data ?? [];
  const parkingActivo  = parkingActivoQ.data ?? [];
  const tiposIncidente = tiposQ.data ?? [];

  const today                    = dayjs().format('YYYY-MM-DD');
  const visitantesHoy            = ingresos.filter((i) => dayjs(i.fecha_hora_ingreso).format('YYYY-MM-DD') === today);
  const visitantesHoyPagina      = visitantesHoy.slice(tablaPage * PAGE_SIZE, (tablaPage + 1) * PAGE_SIZE);
  const autorizacionesPendientes = autorizaciones.filter((a) => a.estado === 'pendiente');
  const paquetesPendientes       = paquetes.filter((p) => p.estado === 'pendiente');
  const lugaresActivos           = lugares.filter((l) => l.is_activo);
  const lugaresOcupados          = lugaresActivos.filter((l) => l.is_ocupado);
  const pctOcupacion             = lugaresActivos.length > 0
    ? Math.round((lugaresOcupados.length / lugaresActivos.length) * 100) : 0;

  const parkingPorIngreso = new Map(parkingActivo.map((p) => [p.ingreso_visita_id, p.numero]));
  const autorizacionMap   = new Map(autorizaciones.map((a) => [a.id, a]));

  return (
    <>
    <Grid container spacing={2.5} alignItems="stretch">

        {/* Columna izquierda: stats 2x2 + acciones rápidas */}
        <Grid item xs={12} lg={4}>
          <Box display="flex" flexDirection="column" gap={2.5}>

            {/* Stats 2x2 */}
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <StatCard label="Visitantes Hoy"
                value={String(visitantesHoy.length)} sub="hoy"
                icon={<PeopleAlt />} accentColor="#2563EB"
                loading={ingresosQ.isLoading} />
              <StatCard label="Autorizaciones"
                value={String(autorizacionesPendientes.length)} sub="pendientes"
                icon={<AssignmentTurnedIn />} accentColor="#7C3AED"
                loading={autorizacionesQ.isLoading} />
              <StatCard label="Paquetes"
                value={String(paquetesPendientes.length)} sub="sin entregar"
                subColor={paquetesPendientes.length > 0 ? '#EA580C' : '#64748B'}
                icon={<LocalShipping />} accentColor="#EA580C"
                loading={paquetesQ.isLoading} />
              <StatCard label="Parqueaderos"
                value={lugaresQ.isLoading ? '—' : `${lugaresOcupados.length}/${lugaresActivos.length}`}
                sub={`${pctOcupacion}% ocup.`}
                icon={<LocalParking />} accentColor="#0891B2"
                loading={lugaresQ.isLoading} />
            </Box>

            {/* Acciones rápidas */}
            <Box sx={{
              bgcolor: 'white', borderRadius: 2,
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              overflow: 'hidden',
            }}>
              <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #F1F5F9' }}>
                <Typography fontWeight={700} fontSize={14} color="#0F172A">Acciones Rápidas</Typography>
              </Box>
              <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <QuickAction label="Ingresar Visitante" icon={<PersonAdd />}
                  accentColor="#2563EB" onClick={() => setIngresoOpen(true)} />
                <QuickAction label="Registrar Paquete" icon={<Inventory />}
                  accentColor="#EA580C" onClick={() => setPaqueteOpen(true)} />
                <QuickAction label="Ver Autorizaciones" icon={<EventAvailable />}
                  accentColor="#059669" onClick={() => navigate('/recepcion/visitantes')} />
                <QuickAction label="Reportar Novedad" icon={<ReportProblem />}
                  accentColor="#DC2626" onClick={() => setNovedadOpen(true)} />
              </Box>
            </Box>

          </Box>
        </Grid>

        {/* Columna derecha: tabla visitantes */}
        <Grid item xs={12} lg={8} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{
            bgcolor: 'white', borderRadius: 2,
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column', flex: 1,
          }}>
            <Box sx={{
              px: 3, py: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '1px solid #F1F5F9',
            }}>
              <Typography fontWeight={700} fontSize={14} color="#0F172A">
                Visitantes de Hoy
              </Typography>
              <Link component="button" variant="body2" underline="none" color="#2563EB"
                onClick={() => navigate('/recepcion/visitantes')}
                sx={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5,
                  '&:hover': { color: '#1d4ed8' } }}>
                Ver todos <ArrowForward sx={{ fontSize: 13 }} />
              </Link>
            </Box>

            {ingresosQ.isLoading ? (
              <Box display="flex" justifyContent="center" py={6}><CircularProgress size={28} /></Box>
            ) : visitantesHoy.length === 0 ? (
              <Box py={6} textAlign="center">
                <Typography variant="body2" color="#94A3B8">Sin ingresos registrados hoy</Typography>
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow sx={{ '& th': {
                    py: 1.25, px: 3, bgcolor: '#F8FAFC',
                    fontSize: 11, fontWeight: 700, color: '#94A3B8',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    borderBottom: '1px solid #E2E8F0',
                  }}}>
                    <TableCell>Visitante</TableCell>
                    <TableCell>Documento</TableCell>
                    <TableCell>Autorizado por</TableCell>
                    <TableCell>Ingreso</TableCell>
                    <TableCell>Parqueadero</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visitantesHoyPagina.map((ingreso) => {
                    const aut    = ingreso.autorizacion_id ? autorizacionMap.get(ingreso.autorizacion_id) : undefined;
                    const park   = parkingPorIngreso.get(ingreso.id);
                    const nombre = [ingreso.visitante.nombre, ingreso.visitante.apellido].filter(Boolean).join(' ');
                    const unidad = aut
                      ? [aut.nombre_autorizado_por, aut.numero_unidad, aut.nombre_torre].filter(Boolean).join(' – ')
                      : '—';
                    const initials = `${ingreso.visitante.nombre?.[0] ?? ''}${ingreso.visitante.apellido?.[0] ?? ''}`.toUpperCase();

                    return (
                      <TableRow key={ingreso.id} sx={{
                        '&:hover': { bgcolor: '#F8FAFC' },
                        '& td': { py: 1.5, px: 3, fontSize: 13.5, borderColor: '#F1F5F9' },
                        '&:last-child td': { border: 0 },
                      }}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1.25}>
                            <Avatar sx={{
                              width: 28, height: 28, fontSize: 10, fontWeight: 700,
                              bgcolor: '#0F172A', color: 'white',
                            }}>
                              {initials}
                            </Avatar>
                            <Typography fontSize={13.5} fontWeight={600} color="#0F172A">{nombre}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#64748B' }}>
                          {ingreso.visitante.tipo_documento}. {ingreso.visitante.n_documento}
                        </TableCell>
                        <TableCell sx={{ color: '#64748B' }}>{unidad}</TableCell>
                        <TableCell sx={{ color: '#64748B' }}>
                          {dayjs(ingreso.fecha_hora_ingreso).format('hh:mm A')}
                        </TableCell>
                        <TableCell>
                          {park ? (
                            <Chip label={park} size="small" sx={{
                              bgcolor: '#DCFCE7', color: '#15803D',
                              fontWeight: 700, fontSize: 11, border: 'none', borderRadius: 1,
                            }} />
                          ) : (
                            <Chip label="N/A" size="small" sx={{
                              bgcolor: '#F1F5F9', color: '#94A3B8',
                              fontWeight: 500, fontSize: 11, border: 'none', borderRadius: 1,
                            }} />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
            {visitantesHoy.length > PAGE_SIZE && (
              <TablePagination
                component="div"
                count={visitantesHoy.length}
                page={tablaPage}
                onPageChange={(_, p) => setTablaPage(p)}
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
          </Box>
        </Grid>
      </Grid>
      <IngresoRapidoDialog open={ingresoOpen} onClose={() => setIngresoOpen(false)} />
      <RegistrarPaqueteDialog
        open={paqueteOpen}
        onClose={() => setPaqueteOpen(false)}
        onCreated={() => setPaqueteOpen(false)}
      />
      {novedadOpen && (
        <NewReportDialog
          open={novedadOpen}
          tipos={tiposIncidente}
          onClose={() => setNovedadOpen(false)}
          onCreated={() => setNovedadOpen(false)}
        />
      )}
    </>
  );
}

// ─── Tokens visuales compartidos ──────────────────────────────────────────────
const TH_SX = {
  py: 1.25, px: 3, bgcolor: '#F8FAFC',
  fontSize: 11, fontWeight: 700, color: '#94A3B8',
  textTransform: 'uppercase' as const, letterSpacing: '0.06em',
  borderBottom: '1px solid #E2E8F0',
};
const TD_SX = { py: 1.5, px: 3, fontSize: 13.5, borderColor: '#F1F5F9', color: '#64748B' };

const ESTADO_INCIDENTE: Record<string, { label: string; color: string; bg: string }> = {
  abierta:    { label: 'Abierta',     color: '#2563EB', bg: '#DBEAFE' },
  en_proceso: { label: 'En Atención', color: '#D97706', bg: '#FEF3C7' },
  resuelta:   { label: 'Resuelta',    color: '#059669', bg: '#D1FAE5' },
  cerrada:    { label: 'Cerrada',     color: '#64748B', bg: '#F1F5F9' },
  rechazada:  { label: 'Rechazada',   color: '#DC2626', bg: '#FEE2E2' },
};
const SEVERIDAD_INCIDENTE: Record<string, { label: string; color: string; bg: string }> = {
  baja:    { label: 'Baja',    color: '#059669', bg: '#D1FAE5' },
  media:   { label: 'Media',   color: '#D97706', bg: '#FEF3C7' },
  alta:    { label: 'Alta',    color: '#DC2626', bg: '#FEE2E2' },
  critica: { label: 'Crítica', color: '#7F1D1D', bg: '#FECACA' },
};
const ESTADO_PQRS: Record<string, { label: string; color: string; bg: string }> = {
  abierta:    { label: 'Abierta',    color: '#DC2626', bg: '#FEE2E2' },
  en_proceso: { label: 'En Proceso', color: '#D97706', bg: '#FEF3C7' },
  resuelta:   { label: 'Resuelta',   color: '#059669', bg: '#D1FAE5' },
  cerrada:    { label: 'Cerrada',    color: '#64748B', bg: '#F1F5F9' },
  rechazada:  { label: 'Rechazada',  color: '#64748B', bg: '#F1F5F9' },
};
const PRIORIDAD_PQRS: Record<string, { label: string; color: string; bg: string }> = {
  baja:  { label: 'Baja',  color: '#64748B', bg: '#F1F5F9' },
  media: { label: 'Media', color: '#D97706', bg: '#FEF3C7' },
  alta:  { label: 'Alta',  color: '#DC2626', bg: '#FEE2E2' },
};

function StatusChip({ map, value }: { map: Record<string, { label: string; color: string; bg: string }>; value: string }) {
  const s = map[value] ?? { label: value, color: '#64748B', bg: '#F1F5F9' };
  return (
    <Chip label={s.label} size="small" sx={{
      bgcolor: s.bg, color: s.color, fontWeight: 700,
      fontSize: 11, border: 'none', borderRadius: 1,
    }} />
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <Box py={7} textAlign="center">
      <PersonOff sx={{ fontSize: 34, color: '#E2E8F0', mb: 1, display: 'block', mx: 'auto' }} />
      <Typography fontSize={13.5} color="#94A3B8">{text}</Typography>
    </Box>
  );
}

function AdminDashboard() {
  const navigate  = useNavigate();
  const qc        = useQueryClient();
  const [tab, setTab] = useState(0);
  const [comunicadoOpen, setComunicadoOpen] = useState(false);
  const [incidenteOpen, setIncidenteOpen] = useState(false);
  const [sinPqrsOpen,     setSinPqrsOpen]     = useState(false);
  const [sinReservasOpen, setSinReservasOpen] = useState(false);

  const [usuariosQ, unidadesQ, pqrsQ, facturasQ, reservasQ, incidentesQ, zonasQ, tiposIncQ] = useQueries({
    queries: [
      { queryKey: ['adm-usuarios'],       queryFn: adminDashboardApi.getUsuarios,          staleTime: 60_000 },
      { queryKey: ['adm-unidades'],       queryFn: adminDashboardApi.getUnidades,           staleTime: 60_000 },
      { queryKey: ['adm-pqrs'],           queryFn: adminDashboardApi.getPqrs,               refetchInterval: 60_000 },
      { queryKey: ['adm-facturas'],       queryFn: adminDashboardApi.getFacturasVencidas,   refetchInterval: 60_000 },
      { queryKey: ['adm-reservas'],       queryFn: adminDashboardApi.getReservasPendientes, refetchInterval: 30_000 },
      { queryKey: ['adm-incidentes'],     queryFn: adminDashboardApi.getIncidentes,         refetchInterval: 30_000 },
      { queryKey: ['adm-zonas'],          queryFn: adminDashboardApi.getZonas,              staleTime: 5 * 60_000 },
      { queryKey: ['pqrs-tipos-incidente'], queryFn: pqrsApi.getTiposIncidente,               staleTime: 5 * 60_000 },
    ],
  });

  const usuarios  = usuariosQ.data  ?? [];
  const unidades  = unidadesQ.data  ?? [];
  const pqrs      = pqrsQ.data      ?? [];
  const facturas  = facturasQ.data  ?? [];
  const reservas  = reservasQ.data  ?? [];
  const incidentes = incidentesQ.data ?? [];
  const zonas     = zonasQ.data     ?? [];
  const tiposInc  = tiposIncQ.data  ?? [];

  const pqrsAbiertos       = pqrs.filter(p => p.estado === 'abierta' || p.estado === 'en_proceso');
  const pqrsSoloAbiertos   = pqrs.filter(p => p.estado === 'abierta');
  const incidentesAbiertos = incidentes.filter(i => i.estado === 'abierta' || i.estado === 'en_proceso');
  const carteraTotal       = facturas.reduce((s, f) => s + Number(f.monto_total), 0);
  const zonaMap            = new Map(zonas.map(z => [z.id, z.nombre]));
  const reservaMasAntigua  = reservas.length > 0
    ? reservas.reduce((a, b) => a.fecha_reserva <= b.fecha_reserva ? a : b)
    : null;

  const confirmarMutation = useMutation({
    mutationFn: adminDashboardApi.confirmarReserva,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adm-reservas'] }),
  });

  const fmtCOP = (n: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

  const fmtCOPCompact = (n: number) => {
    if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toLocaleString('es-CO', { maximumFractionDigits: 1 })}B`;
    if (n >= 1_000_000)     return `$${(n / 1_000_000).toLocaleString('es-CO', { maximumFractionDigits: 1 })}M`;
    if (n >= 1_000)         return `$${(n / 1_000).toLocaleString('es-CO', { maximumFractionDigits: 0 })}K`;
    return fmtCOP(n);
  };

  return (
    <>
    <Grid container spacing={2.5} alignItems="stretch">

      {/* ── Columna izquierda: KPIs + acciones ── */}
      <Grid item xs={12} lg={4}>
        <Box display="flex" flexDirection="column" gap={2.5}>

          {/* KPIs 2×2 */}
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <StatCard
              label="Residentes" sub="activos en el conjunto"
              value={String(usuarios.length)}
              icon={<PeopleAlt />} accentColor="#2563EB"
              loading={usuariosQ.isLoading}
            />
            <StatCard
              label="Unidades" sub="registradas"
              value={String(unidades.length)}
              icon={<Apartment />} accentColor="#7C3AED"
              loading={unidadesQ.isLoading}
            />
            <StatCard
              label="PQRS" sub="sin resolver"
              value={String(pqrsAbiertos.length)}
              subColor={pqrsAbiertos.length > 0 ? '#EA580C' : '#64748B'}
              icon={<Inbox />} accentColor="#EA580C"
              loading={pqrsQ.isLoading}
            />
            <StatCard
              label="Cartera Vencida"
              value={carteraTotal > 0 ? fmtCOPCompact(carteraTotal) : '$0'}
              sub={facturas.length > 0 ? `${facturas.length} factura${facturas.length !== 1 ? 's' : ''} vencida${facturas.length !== 1 ? 's' : ''}` : 'Al día'}
              subColor={carteraTotal > 0 ? '#DC2626' : '#64748B'}
              icon={<MoneyOff />} accentColor="#DC2626"
              loading={facturasQ.isLoading}
            />
          </Box>

          {/* Acciones rápidas */}
          <Box sx={{
            bgcolor: 'white', borderRadius: 2,
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            overflow: 'hidden',
          }}>
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #F1F5F9' }}>
              <Typography fontWeight={700} fontSize={14} color="#0F172A">Acciones Rápidas</Typography>
            </Box>
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <QuickAction label="Crear Comunicado"    icon={<Campaign />}       accentColor="#2563EB" onClick={() => setComunicadoOpen(true)} />
              <QuickAction label="Registrar Incidente" icon={<ReportProblem />}  accentColor="#EA580C" onClick={() => setIncidenteOpen(true)} />
              <QuickAction label="Ver PQRS Nuevas"   icon={<Inbox />}          accentColor="#7C3AED" onClick={() => pqrsSoloAbiertos.length > 0 ? navigate('/admin/pqrs', { state: { estadoFilter: 'abierta' } }) : setSinPqrsOpen(true)} />
              <QuickAction label="Aprobar Reservas"    icon={<EventAvailable />} accentColor="#059669"
                onClick={() => reservaMasAntigua
                  ? navigate('/admin/zonas-comunes', { state: { zonaId: reservaMasAntigua.zona_comun_id } })
                  : setSinReservasOpen(true)
                } />
            </Box>
          </Box>

        </Box>
      </Grid>

      {/* ── Columna derecha: tabs con datos ── */}
      <Grid item xs={12} lg={8} sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box sx={{
          bgcolor: 'white', borderRadius: 2,
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column', flex: 1,
        }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              px: 3, borderBottom: '1px solid #F1F5F9', minHeight: 44,
              '& .MuiTab-root': { fontSize: 13.5, fontWeight: 600, textTransform: 'none', minHeight: 44, color: '#64748B', px: 0, mr: 3 },
              '& .Mui-selected': { color: '#0F172A' },
              '& .MuiTabs-indicator': { bgcolor: '#2563EB', height: 2 },
            }}
          >
            <Tab label={`Incidentes abiertos${incidentesAbiertos.length ? ` (${incidentesAbiertos.length})` : ''}`} />
            <Tab label={`PQRS sin resolver${pqrsAbiertos.length ? ` (${pqrsAbiertos.length})` : ''}`} />
            <Tab label={`Reservas pendientes${reservas.length ? ` (${reservas.length})` : ''}`} />
          </Tabs>

          {/* ── Tab 0: Incidentes ── */}
          {tab === 0 && (
            incidentesQ.isLoading ? (
              <Box display="flex" justifyContent="center" py={8}><CircularProgress size={28} sx={{ color: '#0F172A' }} /></Box>
            ) : incidentesAbiertos.length === 0 ? (
              <EmptyRow text="No hay incidentes abiertos" />
            ) : (
              <>
                <Table>
                  <TableHead>
                    <TableRow sx={{ '& th': TH_SX }}>
                      <TableCell>Título</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Severidad</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Fecha</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {incidentesAbiertos.map(i => (
                      <TableRow key={i.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' }, '& td': TD_SX, '&:last-child td': { border: 0 } }}>
                        <TableCell>
                          <Typography fontSize={13.5} fontWeight={600} color="#0F172A">{i.asunto}</Typography>
                        </TableCell>
                        <TableCell>
                          {i.tipo_incidente_id
                            ? (tiposInc.find(t => t.id === i.tipo_incidente_id)?.nombre ?? '—')
                            : '—'}
                        </TableCell>
                        <TableCell>{i.severidad ? <StatusChip map={SEVERIDAD_INCIDENTE} value={i.severidad} /> : '—'}</TableCell>
                        <TableCell><StatusChip map={ESTADO_INCIDENTE}    value={i.estado}    /></TableCell>
                        <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>
                          {dayjs(i.created_at).format('DD/MM/YY')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Box sx={{ px: 3, py: 1.5, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end' }}>
                  <Link component="button" underline="none" color="#2563EB"
                    onClick={() => navigate('/admin/pqrs')}
                    sx={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, '&:hover': { color: '#1D4ED8' } }}>
                    Ver todos <ArrowForward sx={{ fontSize: 13 }} />
                  </Link>
                </Box>
              </>
            )
          )}

          {/* ── Tab 1: PQRS ── */}
          {tab === 1 && (
            pqrsQ.isLoading ? (
              <Box display="flex" justifyContent="center" py={8}><CircularProgress size={28} sx={{ color: '#0F172A' }} /></Box>
            ) : pqrsAbiertos.length === 0 ? (
              <EmptyRow text="No hay PQRS pendientes de atención" />
            ) : (
              <>
                <Table>
                  <TableHead>
                    <TableRow sx={{ '& th': TH_SX }}>
                      <TableCell>Asunto</TableCell>
                      <TableCell>Prioridad</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Fecha</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pqrsAbiertos.map(p => (
                      <TableRow key={p.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' }, '& td': TD_SX, '&:last-child td': { border: 0 } }}>
                        <TableCell>
                          <Typography fontSize={13.5} fontWeight={600} color="#0F172A">{p.asunto}</Typography>
                        </TableCell>
                        <TableCell><StatusChip map={PRIORIDAD_PQRS}  value={p.prioridad} /></TableCell>
                        <TableCell><StatusChip map={ESTADO_PQRS}     value={p.estado}    /></TableCell>
                        <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>
                          {dayjs(p.created_at).format('DD/MM/YY')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Box sx={{ px: 3, py: 1.5, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end' }}>
                  <Link component="button" underline="none" color="#2563EB"
                    onClick={() => navigate('/admin/pqrs')}
                    sx={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, '&:hover': { color: '#1D4ED8' } }}>
                    Ver todos <ArrowForward sx={{ fontSize: 13 }} />
                  </Link>
                </Box>
              </>
            )
          )}

          {/* ── Tab 2: Reservas pendientes ── */}
          {tab === 2 && (
            reservasQ.isLoading ? (
              <Box display="flex" justifyContent="center" py={8}><CircularProgress size={28} sx={{ color: '#0F172A' }} /></Box>
            ) : reservas.length === 0 ? (
              <EmptyRow text="No hay reservas pendientes de aprobación" />
            ) : (
              <Table>
                <TableHead>
                  <TableRow sx={{ '& th': TH_SX }}>
                    <TableCell>Zona</TableCell>
                    <TableCell>Unidad</TableCell>
                    <TableCell>Residente</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Horario</TableCell>
                    <TableCell sx={{ width: 120 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reservas.map(r => (
                    <TableRow key={r.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' }, '& td': TD_SX, '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        <Typography fontSize={13.5} fontWeight={600} color="#0F172A">
                          {zonaMap.get(r.zona_comun_id) ?? '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {[r.nombre_torre, r.numero_unidad].filter(Boolean).join(' / ') || '—'}
                      </TableCell>
                      <TableCell>{r.nombre_residente ?? '—'}</TableCell>
                      <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {dayjs(r.fecha_reserva).format('DD/MM/YY')}
                      </TableCell>
                      <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {r.hora_inicio.slice(0, 5)} – {r.hora_fin.slice(0, 5)}
                      </TableCell>
                      <TableCell sx={{ pr: 3 }}>
                        <Button
                          size="small" variant="contained"
                          disabled={confirmarMutation.isPending}
                          onClick={() => confirmarMutation.mutate(r.id)}
                          startIcon={<CheckCircleOutline sx={{ fontSize: 14 }} />}
                          sx={{
                            bgcolor: '#059669', textTransform: 'none', fontWeight: 600,
                            fontSize: 12, boxShadow: 'none', px: 1.5,
                            '&:hover': { bgcolor: '#047857', boxShadow: 'none' },
                          }}
                        >
                          Aprobar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          )}

        </Box>
      </Grid>

    </Grid>

    <CrearComunicadoDialog open={comunicadoOpen} onClose={() => setComunicadoOpen(false)} />
    <NewReportDialog open={incidenteOpen} tipos={tiposInc} onClose={() => setIncidenteOpen(false)} onCreated={() => { setIncidenteOpen(false); qc.invalidateQueries({ queryKey: ['adm-incidentes'] }); }} />

    <Dialog open={sinReservasOpen} onClose={() => setSinReservasOpen(false)} PaperProps={{ sx: { borderRadius: 2, p: 1, maxWidth: 360 } }}>
      <DialogContent sx={{ textAlign: 'center', pt: 3, pb: 1 }}>
        <EventAvailable sx={{ fontSize: 44, color: '#CBD5E1', mb: 1.5, display: 'block', mx: 'auto' }} />
        <Typography fontWeight={700} fontSize={15} color="#0F172A" mb={0.75}>
          Sin reservas pendientes
        </Typography>
        <Typography fontSize={13.5} color="#64748B">
          No hay reservas esperando aprobación en este momento.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2.5 }}>
        <Button variant="contained" disableElevation onClick={() => setSinReservasOpen(false)}
          sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, px: 3 }}>
          Entendido
        </Button>
      </DialogActions>
    </Dialog>

    <Dialog open={sinPqrsOpen} onClose={() => setSinPqrsOpen(false)} PaperProps={{ sx: { borderRadius: 2, p: 1, maxWidth: 360 } }}>
      <DialogContent sx={{ textAlign: 'center', pt: 3, pb: 1 }}>
        <Inbox sx={{ fontSize: 44, color: '#CBD5E1', mb: 1.5, display: 'block', mx: 'auto' }} />
        <Typography fontWeight={700} fontSize={15} color="#0F172A" mb={0.75}>
          Sin PQRS nuevas
        </Typography>
        <Typography fontSize={13.5} color="#64748B">
          No hay PQRS nuevas en este momento. Todo está al día.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2.5 }}>
        <Button variant="contained" disableElevation onClick={() => setSinPqrsOpen(false)}
          sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, px: 3 }}>
          Entendido
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
}
