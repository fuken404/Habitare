import { useState, useMemo } from 'react';
import {
  Box, Typography, Button, Tab, Tabs, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody, TablePagination,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField,
} from '@mui/material';
import { Add, Close, PersonOff } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { useAuthStore } from '@/core/auth/authStore';
import { SearchBar } from '@/shared/components/SearchBar';
import { securityApi } from '../api/securityApi';

dayjs.locale('es');

// ─── Tokens visuales ──────────────────────────────────────────────────────────
const TH_SX = {
  py: 1.25, px: 3, bgcolor: '#F8FAFC',
  fontSize: 11, fontWeight: 700, color: '#94A3B8',
  textTransform: 'uppercase' as const, letterSpacing: '0.06em',
  borderBottom: '1px solid #E2E8F0',
};
const TD_SX = {
  py: 1.5, px: 3, fontSize: 13.5, borderColor: '#F1F5F9', color: '#64748B',
};

const PAGE_SIZE = 15;

// ─── Diálogo registrar ingreso ────────────────────────────────────────────────
function RegistrarIngresoDialog({ open, onClose, onCreated }: {
  open: boolean; onClose: () => void; onCreated: () => void;
}) {
  const { user } = useAuthStore();
  const [nombre,   setNombre]   = useState('');
  const [empresa,  setEmpresa]  = useState('');
  const [motivo,   setMotivo]   = useState('');

  const mutation = useMutation({
    mutationFn: () => securityApi.registrarIngreso({
      nombre: nombre.trim(),
      empresa: empresa.trim() || undefined,
      motivo: motivo.trim(),
    }),
    onSuccess: onCreated,
  });

  const handleClose = () => {
    setNombre(''); setEmpresa(''); setMotivo('');
    onClose();
  };

  const registradoPor = [user?.nombre, user?.apellido].filter(Boolean).join(' ')
    + (user?.rol ? ` (${user.rol.charAt(0).toUpperCase() + user.rol.slice(1)})` : '');

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography fontWeight={700} fontSize={15.5}>Registrar Ingreso</Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: '#94A3B8' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '12px !important' }}>
        <TextField
          label="Nombre Completo *" size="small" value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Ej. Carlos Méndez"
          InputProps={{ sx: { fontSize: 13.5 } }}
          InputLabelProps={{ sx: { fontSize: 13.5 } }}
        />
        <TextField
          label="Empresa/Servicio" size="small" value={empresa}
          onChange={e => setEmpresa(e.target.value)}
          placeholder="Ej. Jardinería Los Pinos"
          InputProps={{ sx: { fontSize: 13.5 } }}
          InputLabelProps={{ sx: { fontSize: 13.5 } }}
        />
        <TextField
          label="Motivo *" size="small" value={motivo}
          onChange={e => setMotivo(e.target.value)}
          placeholder="Ej. Poda de árboles"
          InputProps={{ sx: { fontSize: 13.5 } }}
          InputLabelProps={{ sx: { fontSize: 13.5 } }}
        />
        <Box>
          <Typography fontSize={12} color="#94A3B8" mb={0.5}>Registrado por</Typography>
          <Typography fontSize={13.5} color="#334155" fontWeight={500}>{registradoPor}</Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={handleClose}
          sx={{ color: '#64748B', textTransform: 'none', fontSize: 13.5 }}>
          Cancelar
        </Button>
        <Button variant="contained"
          disabled={!nombre.trim() || !motivo.trim() || mutation.isPending}
          onClick={() => mutation.mutate()}
          sx={{ bgcolor: '#059669', textTransform: 'none', fontSize: 13.5, fontWeight: 600,
            boxShadow: 'none', '&:hover': { bgcolor: '#047857', boxShadow: 'none' } }}>
          {mutation.isPending ? 'Registrando...' : 'Registrar Ingreso'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────
export function SecurityPage() {
  const qc = useQueryClient();
  const [tab,           setTab]           = useState(0);
  const [search,        setSearch]        = useState('');
  const [page0,         setPage0]         = useState(0);
  const [page1,         setPage1]         = useState(0);
  const [dialogOpen,    setDialogOpen]    = useState(false);
  const [confirmId,     setConfirmId]     = useState<string | null>(null);

  const activosQ = useQuery({
    queryKey: ['ext-activos'],
    queryFn: securityApi.listActivos,
    refetchInterval: 30_000,
  });
  const historicoQ = useQuery({
    queryKey: ['ext-historico'],
    queryFn: securityApi.listHistoricoHoy,
    refetchInterval: 30_000,
  });

  const salidaMutation = useMutation({
    mutationFn: (id: string) => securityApi.registrarSalida(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ext-activos'] });
      qc.invalidateQueries({ queryKey: ['ext-historico'] });
      setConfirmId(null);
    },
  });

  const isLoading = activosQ.isLoading || historicoQ.isLoading;

  const q = search.toLowerCase();
  const filteredActivos = useMemo(() =>
    (activosQ.data ?? []).filter(i =>
      !q || [i.nombre, i.empresa, i.motivo].some(f => f?.toLowerCase().includes(q))
    ), [activosQ.data, q]);

  const filteredHistorico = useMemo(() =>
    (historicoQ.data ?? []).filter(i =>
      !q || [i.nombre, i.empresa, i.motivo].some(f => f?.toLowerCase().includes(q))
    ), [historicoQ.data, q]);

  return (
    <Box display="flex" flexDirection="column" gap={2.5}>

      {/* ── Toolbar ── */}
      <Box display="flex" alignItems="center" gap={1.5}>
        <SearchBar
          value={search}
          onChange={v => { setSearch(v); setPage0(0); setPage1(0); }}
          placeholder="Buscar por nombre o empresa..."
          width={280}
        />
        <Box flex={1} />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
          sx={{
            bgcolor: '#059669', color: 'white', fontWeight: 700,
            fontSize: 13.5, px: 2.5, py: 1.1, borderRadius: '6px',
            boxShadow: 'none', textTransform: 'none',
            '&:hover': { bgcolor: '#047857', boxShadow: 'none' },
          }}
        >
          Registrar Ingreso
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
          <Tab label={`En el Conjunto${activosQ.data?.length ? ` (${activosQ.data.length})` : ''}`} />
          <Tab label="Histórico de Hoy" />
        </Tabs>

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress size={28} sx={{ color: '#0F172A' }} />
          </Box>

        ) : tab === 0 ? (
          // ── Tab: En el Conjunto ──
          filteredActivos.length === 0 ? (
            <Box py={8} textAlign="center">
              <PersonOff sx={{ fontSize: 36, color: '#E2E8F0', mb: 1, display: 'block', mx: 'auto' }} />
              <Typography fontSize={13.5} color="#94A3B8">
                {q ? 'Sin resultados para tu búsqueda' : 'No hay personal externo en el conjunto'}
              </Typography>
            </Box>
          ) : (
            <>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': TH_SX }}>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Empresa / Servicio</TableCell>
                  <TableCell>Motivo</TableCell>
                  <TableCell>Hora Ingreso</TableCell>
                  <TableCell sx={{ width: 150 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredActivos.slice(page0 * PAGE_SIZE, (page0 + 1) * PAGE_SIZE).map(i => (
                  <TableRow key={i.id} sx={{
                    '&:hover': { bgcolor: '#F8FAFC' },
                    '& td': TD_SX,
                    '&:last-child td': { border: 0 },
                  }}>
                    <TableCell>
                      <Typography fontSize={13.5} fontWeight={600} color="#0F172A">{i.nombre}</Typography>
                    </TableCell>
                    <TableCell>{i.empresa ?? '—'}</TableCell>
                    <TableCell>{i.motivo}</TableCell>
                    <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {dayjs(i.fecha_hora_ingreso).format('hh:mm A')}
                    </TableCell>
                    <TableCell sx={{ pr: 3 }}>
                      {confirmId === i.id ? (
                        <Box display="flex" gap={1}>
                          <Button size="small" onClick={() => setConfirmId(null)}
                            sx={{ fontSize: 12, color: '#64748B', textTransform: 'none', minWidth: 0, px: 1 }}>
                            Cancelar
                          </Button>
                          <Button size="small" variant="contained"
                            disabled={salidaMutation.isPending}
                            onClick={() => salidaMutation.mutate(i.id)}
                            sx={{ fontSize: 12, bgcolor: '#DC2626', textTransform: 'none',
                              boxShadow: 'none', px: 1.5,
                              '&:hover': { bgcolor: '#B91C1C', boxShadow: 'none' } }}>
                            {salidaMutation.isPending ? '...' : 'Confirmar'}
                          </Button>
                        </Box>
                      ) : (
                        <Button size="small" variant="contained"
                          onClick={() => setConfirmId(i.id)}
                          sx={{ bgcolor: '#DC2626', fontWeight: 700, fontSize: 12.5,
                            textTransform: 'none', borderRadius: '6px', px: 2, py: 0.7,
                            boxShadow: 'none',
                            '&:hover': { bgcolor: '#B91C1C', boxShadow: 'none' } }}>
                          Registrar Salida
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredActivos.length > PAGE_SIZE && (
              <TablePagination
                component="div"
                count={filteredActivos.length}
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
          // ── Tab: Histórico de Hoy ──
          filteredHistorico.length === 0 ? (
            <Box py={8} textAlign="center">
              <PersonOff sx={{ fontSize: 36, color: '#E2E8F0', mb: 1, display: 'block', mx: 'auto' }} />
              <Typography fontSize={13.5} color="#94A3B8">
                {q ? 'Sin resultados para tu búsqueda' : 'Sin salidas registradas hoy'}
              </Typography>
            </Box>
          ) : (
            <>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': TH_SX }}>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Empresa / Servicio</TableCell>
                  <TableCell>Motivo</TableCell>
                  <TableCell>Hora Ingreso</TableCell>
                  <TableCell>Hora Salida</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHistorico.slice(page1 * PAGE_SIZE, (page1 + 1) * PAGE_SIZE).map(i => (
                  <TableRow key={i.id} sx={{
                    '&:hover': { bgcolor: '#F8FAFC' },
                    '& td': TD_SX,
                    '&:last-child td': { border: 0 },
                  }}>
                    <TableCell>
                      <Typography fontSize={13.5} fontWeight={600} color="#0F172A">{i.nombre}</Typography>
                    </TableCell>
                    <TableCell>{i.empresa ?? '—'}</TableCell>
                    <TableCell>{i.motivo}</TableCell>
                    <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {dayjs(i.fecha_hora_ingreso).format('hh:mm A')}
                    </TableCell>
                    <TableCell sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {i.fecha_hora_salida ? dayjs(i.fecha_hora_salida).format('hh:mm A') : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredHistorico.length > PAGE_SIZE && (
              <TablePagination
                component="div"
                count={filteredHistorico.length}
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

      {/* ── Dialog ── */}
      <RegistrarIngresoDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={() => {
          setDialogOpen(false);
          qc.invalidateQueries({ queryKey: ['ext-activos'] });
        }}
      />
    </Box>
  );
}
