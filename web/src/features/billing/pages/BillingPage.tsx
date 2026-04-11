import { useState } from 'react';
import {
  Box, Typography, Chip, CircularProgress, Drawer, IconButton,
  Button, TableContainer, Table, TableHead, TableRow, TableCell,
  TableBody, TablePagination, FormControl, Select, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, InputAdornment, Divider,
} from '@mui/material';
import {
  FilterList, Close, Add, CalendarToday, AttachMoney,
  CheckCircle, Cancel, Inventory2,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { SearchBar } from '@/shared/components/SearchBar';
import { useAuthStore } from '@/core/auth/authStore';
import {
  billingApi,
  type FacturaListItem, type EstadoFactura, type MetodoPago,
} from '../api/billingApi';

dayjs.locale('es');

// ─── Visual tokens ────────────────────────────────────────────────────────────
const FACTURA_ESTADO: Record<EstadoFactura, { label: string; bg: string; color: string }> = {
  pendiente: { label: 'Pendiente', bg: '#DBEAFE', color: '#1D4ED8' },
  pagada:    { label: 'Pagada',    bg: '#DCFCE7', color: '#15803D' },
  vencida:   { label: 'Vencida',   bg: '#FFEDD5', color: '#C2410C' },
  anulada:   { label: 'Anulada',   bg: '#F1F5F9', color: '#94A3B8' },
};

const PAGO_ESTADO: Record<string, { label: string; bg: string; color: string }> = {
  pendiente: { label: 'Por aprobar', bg: '#FEF9C3', color: '#A16207' },
  aprobado:  { label: 'Aprobado',    bg: '#DCFCE7', color: '#15803D' },
  rechazado: { label: 'Rechazado',   bg: '#FEE2E2', color: '#DC2626' },
};

const METODO_LABEL: Record<MetodoPago, string> = {
  efectivo:      'Efectivo',
  transferencia: 'Transferencia',
  tarjeta:       'Tarjeta',
  cheque:        'Cheque',
};

const TH_SX = {
  bgcolor: '#F8FAFC', color: '#94A3B8', fontSize: 11, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.06em', py: 1.5, px: 2,
  borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap',
} as const;

const TD_SX = { py: 1.5, px: 2, borderBottom: '1px solid #F1F5F9', fontSize: 13.5 } as const;

const PAGE_SIZE = 15;

// ─── EmitirFacturaDialog ──────────────────────────────────────────────────────
function EmitirFacturaDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    unidad_id:         '',
    numero_factura:    '',
    periodo:           '',
    fecha_emision:     dayjs().format('YYYY-MM-DD'),
    fecha_vencimiento: '',
    monto_total:       '',
    descripcion:       '',
  });

  const { data: unidades = [] } = useQuery({
    queryKey: ['unidades-detalle'],
    queryFn:  billingApi.listUnidades,
    enabled:  open,
  });

  const mut = useMutation({
    mutationFn: () =>
      billingApi.crearFactura({
        unidad_id:         form.unidad_id,
        numero_factura:    form.numero_factura,
        periodo:           form.periodo,
        fecha_emision:     form.fecha_emision,
        fecha_vencimiento: form.fecha_vencimiento,
        monto_total:       Number(form.monto_total),
        descripcion:       form.descripcion || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['facturas'] });
      onClose();
      setForm({ unidad_id: '', numero_factura: '', periodo: '', fecha_emision: dayjs().format('YYYY-MM-DD'), fecha_vencimiento: '', monto_total: '', descripcion: '' });
    },
  });

  const valid =
    form.unidad_id && form.numero_factura && form.periodo &&
    form.fecha_emision && form.fecha_vencimiento && Number(form.monto_total) > 0;

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography fontWeight={700} fontSize={15.5}>Emitir factura</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: '8px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl fullWidth size="small">
          <Select
            displayEmpty
            value={form.unidad_id}
            onChange={e => setForm(f => ({ ...f, unidad_id: e.target.value }))}
            renderValue={v =>
              v
                ? unidades.find(u => u.id === v)?.numero ?? v
                : <span style={{ color: '#94A3B8' }}>Unidad *</span>
            }
            sx={{ fontSize: 13.5 }}
          >
            {unidades.map(u => (
              <MenuItem key={u.id} value={u.id}>
                <Box>
                  <Typography fontSize={13.5}>{u.numero}</Typography>
                  {u.nombre_torre && (
                    <Typography fontSize={11.5} color="#94A3B8">{u.nombre_torre}</Typography>
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box display="flex" gap={2}>
          <TextField size="small" label="No. Factura *" fullWidth
            value={form.numero_factura} onChange={set('numero_factura')}
            inputProps={{ style: { fontSize: 13.5 } }} InputLabelProps={{ style: { fontSize: 13.5 } }}
          />
          <TextField size="small" label="Período *" fullWidth placeholder="Ej: Enero 2026"
            value={form.periodo} onChange={set('periodo')}
            inputProps={{ style: { fontSize: 13.5 } }} InputLabelProps={{ style: { fontSize: 13.5 } }}
          />
        </Box>

        <Box display="flex" gap={2}>
          <TextField size="small" label="Fecha emisión *" type="date" fullWidth
            value={form.fecha_emision} onChange={set('fecha_emision')}
            InputLabelProps={{ shrink: true, style: { fontSize: 13.5 } }}
            inputProps={{ style: { fontSize: 13.5 } }}
          />
          <TextField size="small" label="Vencimiento *" type="date" fullWidth
            value={form.fecha_vencimiento} onChange={set('fecha_vencimiento')}
            InputLabelProps={{ shrink: true, style: { fontSize: 13.5 } }}
            inputProps={{ style: { fontSize: 13.5 } }}
          />
        </Box>

        <TextField size="small" label="Monto total *" type="number" fullWidth
          value={form.monto_total} onChange={set('monto_total')}
          InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
          inputProps={{ style: { fontSize: 13.5 } }} InputLabelProps={{ style: { fontSize: 13.5 } }}
        />

        <TextField size="small" label="Descripción (opcional)" fullWidth multiline rows={2}
          value={form.descripcion} onChange={set('descripcion')}
          inputProps={{ style: { fontSize: 13.5 } }} InputLabelProps={{ style: { fontSize: 13.5 } }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: '#64748B', textTransform: 'none', fontSize: 13.5 }}>
          Cancelar
        </Button>
        <Button variant="contained" disabled={!valid || mut.isPending} onClick={() => mut.mutate()}
          sx={{ bgcolor: '#0F172A', textTransform: 'none', fontSize: 13.5, borderRadius: 1.5,
            boxShadow: 'none', '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' } }}>
          {mut.isPending ? 'Emitiendo...' : 'Emitir factura'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── RegistrarPagoDialog ──────────────────────────────────────────────────────
function RegistrarPagoDialog({
  facturaId, open, onClose,
}: { facturaId: string; open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    monto:      '',
    fecha_pago: dayjs().format('YYYY-MM-DD'),
    metodo_pago: '' as MetodoPago | '',
    referencia: '',
  });

  const mut = useMutation({
    mutationFn: () =>
      billingApi.registrarPago(facturaId, {
        monto:       Number(form.monto),
        fecha_pago:  form.fecha_pago,
        metodo_pago: form.metodo_pago as MetodoPago,
        referencia:  form.referencia || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['factura-detalle', facturaId] });
      qc.invalidateQueries({ queryKey: ['facturas'] });
      onClose();
      setForm({ monto: '', fecha_pago: dayjs().format('YYYY-MM-DD'), metodo_pago: '', referencia: '' });
    },
  });

  const valid = Number(form.monto) > 0 && form.fecha_pago && form.metodo_pago;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography fontWeight={700} fontSize={15.5}>Registrar pago</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: '8px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField size="small" label="Monto *" type="number" fullWidth
          value={form.monto}
          onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
          InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
          inputProps={{ style: { fontSize: 13.5 } }} InputLabelProps={{ style: { fontSize: 13.5 } }}
        />
        <TextField size="small" label="Fecha de pago *" type="date" fullWidth
          value={form.fecha_pago}
          onChange={e => setForm(f => ({ ...f, fecha_pago: e.target.value }))}
          InputLabelProps={{ shrink: true, style: { fontSize: 13.5 } }}
          inputProps={{ style: { fontSize: 13.5 } }}
        />
        <FormControl size="small" fullWidth>
          <Select
            displayEmpty
            value={form.metodo_pago}
            onChange={e => setForm(f => ({ ...f, metodo_pago: e.target.value as MetodoPago }))}
            renderValue={v =>
              v
                ? METODO_LABEL[v as MetodoPago]
                : <span style={{ color: '#94A3B8' }}>Método de pago *</span>
            }
            sx={{ fontSize: 13.5 }}
          >
            {(Object.keys(METODO_LABEL) as MetodoPago[]).map(m => (
              <MenuItem key={m} value={m} sx={{ fontSize: 13.5 }}>{METODO_LABEL[m]}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField size="small" label="Referencia (opcional)" fullWidth
          value={form.referencia}
          onChange={e => setForm(f => ({ ...f, referencia: e.target.value }))}
          inputProps={{ style: { fontSize: 13.5 } }} InputLabelProps={{ style: { fontSize: 13.5 } }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: '#64748B', textTransform: 'none', fontSize: 13.5 }}>
          Cancelar
        </Button>
        <Button variant="contained" disabled={!valid || mut.isPending} onClick={() => mut.mutate()}
          sx={{ bgcolor: '#0F172A', textTransform: 'none', fontSize: 13.5, borderRadius: 1.5,
            boxShadow: 'none', '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' } }}>
          {mut.isPending ? 'Registrando...' : 'Registrar'}
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

// ─── FacturaDrawer ────────────────────────────────────────────────────────────
function FacturaDrawer({
  factura, isAdmin, onClose,
}: { factura: FacturaListItem | null; isAdmin: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [pagoDialog, setPagoDialog] = useState(false);

  const { data: detalle, isLoading } = useQuery({
    queryKey: ['factura-detalle', factura?.id],
    queryFn:  () => billingApi.getFactura(factura!.id),
    enabled:  !!factura,
  });

  const anularMut = useMutation({
    mutationFn: () => billingApi.anularFactura(factura!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['facturas'] });
      qc.invalidateQueries({ queryKey: ['factura-detalle', factura?.id] });
    },
  });

  const aprobarMut = useMutation({
    mutationFn: (pagoId: string) => billingApi.aprobarPago(factura!.id, pagoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['factura-detalle', factura?.id] });
      qc.invalidateQueries({ queryKey: ['facturas'] });
    },
  });

  const rechazarMut = useMutation({
    mutationFn: (pagoId: string) => billingApi.rechazarPago(factura!.id, pagoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['factura-detalle', factura?.id] });
      qc.invalidateQueries({ queryKey: ['facturas'] });
    },
  });

  const estadoCfg       = factura ? FACTURA_ESTADO[factura.estado] : null;
  const canRegisterPago = isAdmin && factura && ['pendiente', 'vencida'].includes(factura.estado);
  const canAnular       = isAdmin && factura && !['anulada', 'pagada'].includes(factura.estado);

  return (
    <Drawer anchor="right" open={!!factura} onClose={onClose}
      PaperProps={{ sx: { width: 480, display: 'flex', flexDirection: 'column',
        bgcolor: '#F8FAFC', borderLeft: '1px solid #E2E8F0' } }}>

      {/* Header */}
      {factura && (
        <Box sx={{ px: 3, py: 2.5, bgcolor: 'white', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
          <Box display="flex" alignItems="flex-start" gap={1}>
            <Box flex={1} minWidth={0}>
              <Typography fontSize={11} color="#94A3B8" fontWeight={700}
                textTransform="uppercase" letterSpacing="0.08em" fontFamily="monospace">
                {factura.numero_factura}
              </Typography>
              <Typography fontSize={15.5} fontWeight={700} color="#0F172A" mt={0.5}>
                {factura.periodo}
              </Typography>
              {estadoCfg && (
                <Chip label={estadoCfg.label} size="small"
                  sx={{ mt: 1, bgcolor: estadoCfg.bg, color: estadoCfg.color,
                    fontWeight: 700, fontSize: 11.5, borderRadius: 1, border: 'none' }} />
              )}
            </Box>
            <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8', flexShrink: 0 }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>
        {isLoading || !factura ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress size={24} sx={{ color: '#0F172A' }} />
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Info */}
            <Box display="flex" flexDirection="column" gap={2}>
              <InfoRow
                icon={<Inventory2 sx={{ fontSize: 16 }} />}
                label="Unidad"
                value={[factura.numero_unidad, factura.nombre_torre].filter(Boolean).join(' · ') || '—'}
              />
              <InfoRow
                icon={<CalendarToday sx={{ fontSize: 16 }} />}
                label="Emisión"
                value={detalle ? dayjs(detalle.fecha_emision).format('DD/MM/YYYY') : '—'}
              />
              <InfoRow
                icon={<CalendarToday sx={{ fontSize: 16 }} />}
                label="Vencimiento"
                value={dayjs(factura.fecha_vencimiento).format('DD/MM/YYYY')}
              />
              <InfoRow
                icon={<AttachMoney sx={{ fontSize: 16 }} />}
                label="Monto total"
                value={`$${Number(factura.monto_total).toLocaleString('es-CO')}`}
              />
              {detalle?.descripcion && (
                <InfoRow
                  icon={<Inventory2 sx={{ fontSize: 16 }} />}
                  label="Descripción"
                  value={detalle.descripcion}
                />
              )}
            </Box>

            <Divider sx={{ borderColor: '#E2E8F0' }} />

            {/* Pagos */}
            <Box>
              <Typography fontSize={12} color="#94A3B8" fontWeight={700}
                textTransform="uppercase" letterSpacing="0.06em" mb={1.5}>
                Pagos registrados
              </Typography>

              {!detalle?.pagos.length ? (
                <Box py={3} textAlign="center">
                  <Typography fontSize={13} color="#94A3B8">Sin pagos registrados</Typography>
                </Box>
              ) : (
                <Box display="flex" flexDirection="column" gap={1.5}>
                  {detalle.pagos.map(p => {
                    const pagoEst = PAGO_ESTADO[p.estado] ?? PAGO_ESTADO.pendiente;
                    return (
                      <Box key={p.id} sx={{ bgcolor: 'white', border: '1px solid #E2E8F0', borderRadius: 2, p: 2 }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.75}>
                          <Typography fontWeight={700} fontSize={14} color="#0F172A">
                            ${Number(p.monto).toLocaleString('es-CO')}
                          </Typography>
                          <Chip label={pagoEst.label} size="small"
                            sx={{ bgcolor: pagoEst.bg, color: pagoEst.color,
                              fontWeight: 600, fontSize: 11, borderRadius: 1, border: 'none' }} />
                        </Box>
                        <Typography fontSize={12} color="#64748B">
                          {METODO_LABEL[p.metodo_pago]} · {dayjs(p.fecha_pago).format('DD/MM/YYYY')}
                          {p.referencia ? ` · Ref: ${p.referencia}` : ''}
                        </Typography>
                        {p.estado === 'pendiente' && isAdmin && (
                          <Box display="flex" gap={0.75} mt={1.25}>
                            <Button size="small" startIcon={<CheckCircle sx={{ fontSize: 14 }} />}
                              disabled={aprobarMut.isPending}
                              onClick={() => aprobarMut.mutate(p.id)}
                              sx={{ fontSize: 12, color: '#059669', textTransform: 'none',
                                '&:hover': { bgcolor: '#F0FDF4' } }}>
                              Aprobar
                            </Button>
                            <Button size="small" startIcon={<Cancel sx={{ fontSize: 14 }} />}
                              disabled={rechazarMut.isPending}
                              onClick={() => rechazarMut.mutate(p.id)}
                              sx={{ fontSize: 12, color: '#DC2626', textTransform: 'none',
                                '&:hover': { bgcolor: '#FEF2F2' } }}>
                              Rechazar
                            </Button>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* Footer */}
      {isAdmin && (canRegisterPago || canAnular) && factura && (
        <Box sx={{ px: 3, py: 2, bgcolor: 'white', borderTop: '1px solid #E2E8F0',
          flexShrink: 0, display: 'flex', gap: 1.5, alignItems: 'center' }}>
          {canRegisterPago && (
            <Button fullWidth variant="contained" onClick={() => setPagoDialog(true)}
              sx={{ bgcolor: '#0F172A', textTransform: 'none', fontSize: 13.5, borderRadius: 1.5,
                boxShadow: 'none', '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' } }}>
              Registrar pago
            </Button>
          )}
          {canAnular && (
            <Button disabled={anularMut.isPending} onClick={() => anularMut.mutate()}
              sx={{ textTransform: 'none', fontSize: 13, color: '#DC2626',
                '&:hover': { bgcolor: '#FEF2F2' },
                ...(canRegisterPago ? {} : { flex: 1 }) }}>
              {anularMut.isPending ? 'Anulando...' : 'Anular factura'}
            </Button>
          )}
        </Box>
      )}

      {factura && (
        <RegistrarPagoDialog
          facturaId={factura.id}
          open={pagoDialog}
          onClose={() => setPagoDialog(false)}
        />
      )}
    </Drawer>
  );
}

// ─── BillingPage ──────────────────────────────────────────────────────────────
export function BillingPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.rol === 'administracion' || user?.rol === 'superadmin';

  const [search,       setSearch]       = useState('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoFactura | ''>('');
  const [page,         setPage]         = useState(0);
  const [selected,     setSelected]     = useState<FacturaListItem | null>(null);
  const [emitirOpen,   setEmitirOpen]   = useState(false);

  const { data: facturas = [], isLoading } = useQuery({
    queryKey: ['facturas', estadoFilter],
    queryFn:  () => billingApi.listFacturas(estadoFilter || undefined),
  });

  const q = search.toLowerCase();
  const filtered = facturas.filter(f =>
    !q || [f.numero_factura, f.numero_unidad, f.nombre_torre, f.periodo]
      .some(v => v?.toLowerCase().includes(q))
  );

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <Box display="flex" flexDirection="column" gap={2.5}>

      {/* Toolbar */}
      <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar factura, unidad, período..."
          width={300}
        />
        <Box flex={1} />
        {isAdmin && (
          <Button startIcon={<Add />} variant="contained"
            onClick={() => setEmitirOpen(true)}
            sx={{ bgcolor: '#0F172A', textTransform: 'none', fontSize: 13.5, borderRadius: 1.5,
              boxShadow: 'none', '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' } }}>
            Emitir factura
          </Button>
        )}
        <FormControl size="small" sx={{
          minWidth: 160,
          '& .MuiOutlinedInput-root': {
            borderRadius: 1.5, fontSize: 13.5,
            '& fieldset': { borderColor: '#E2E8F0' },
            '&:hover fieldset': { borderColor: '#CBD5E1' },
          },
        }}>
          <Select
            displayEmpty
            value={estadoFilter}
            onChange={e => { setEstadoFilter(e.target.value as EstadoFactura | ''); setPage(0); }}
            startAdornment={<FilterList sx={{ fontSize: 16, color: '#94A3B8', mr: 0.5 }} />}
            renderValue={v => v ? FACTURA_ESTADO[v as EstadoFactura].label : 'Estado'}
          >
            <MenuItem value="" sx={{ fontSize: 13.5 }}>Todos</MenuItem>
            {(Object.keys(FACTURA_ESTADO) as EstadoFactura[]).map(e => (
              <MenuItem key={e} value={e} sx={{ fontSize: 13.5 }}>{FACTURA_ESTADO[e].label}</MenuItem>
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
                {['Factura', 'Unidad', 'Período', 'Vencimiento', 'Monto', 'Estado'].map(h => (
                  <TableCell key={h} sx={TH_SX}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={26} sx={{ color: '#0F172A' }} />
                  </TableCell>
                </TableRow>
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center"
                    sx={{ py: 8, color: '#94A3B8', fontSize: 13.5 }}>
                    Sin facturas encontradas
                  </TableCell>
                </TableRow>
              ) : paginated.map(f => {
                const est = FACTURA_ESTADO[f.estado];
                return (
                  <TableRow key={f.id} onClick={() => setSelected(f)}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#F8FAFC' },
                      '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell sx={TD_SX}>
                      <Typography fontFamily="monospace" fontWeight={700} fontSize={13} color="#0F172A">
                        {f.numero_factura}
                      </Typography>
                    </TableCell>
                    <TableCell sx={TD_SX}>
                      <Typography fontSize={13.5} fontWeight={600} color="#0F172A">
                        {f.numero_unidad ?? '—'}
                      </Typography>
                      {f.nombre_torre && (
                        <Typography fontSize={12} color="#94A3B8">{f.nombre_torre}</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ ...TD_SX, color: '#0F172A' }}>{f.periodo}</TableCell>
                    <TableCell sx={{ ...TD_SX, color: '#64748B' }}>
                      {dayjs(f.fecha_vencimiento).format('DD/MM/YY')}
                    </TableCell>
                    <TableCell sx={TD_SX}>
                      <Typography fontWeight={600} fontSize={13.5} color="#0F172A">
                        ${Number(f.monto_total).toLocaleString('es-CO')}
                      </Typography>
                    </TableCell>
                    <TableCell sx={TD_SX}>
                      <Chip label={est.label} size="small"
                        sx={{ bgcolor: est.bg, color: est.color,
                          fontWeight: 700, fontSize: 11.5, borderRadius: 1, border: 'none' }} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 0.5,
          borderTop: filtered.length > PAGE_SIZE ? '1px solid #F1F5F9' : 'none' }}>
          <Typography fontSize={12} color="#94A3B8">
            {filtered.length} factura{filtered.length !== 1 ? 's' : ''}
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

      <FacturaDrawer factura={selected} isAdmin={isAdmin} onClose={() => setSelected(null)} />
      <EmitirFacturaDialog open={emitirOpen} onClose={() => setEmitirOpen(false)} />
    </Box>
  );
}
