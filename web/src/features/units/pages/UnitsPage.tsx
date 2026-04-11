import { useState, useMemo } from 'react';
import {
  Box, Typography, Button, Avatar, AvatarGroup, Chip, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody, TablePagination,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Alert, Tooltip,
} from '@mui/material';
import { Add, Close, HomeWork, Edit, Delete } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SearchBar } from '@/shared/components/SearchBar';
import { useAuthStore } from '@/core/auth/authStore';
import { unitsApi, type CrearUnidadPayload, type EditarUnidadPayload, type UnidadDetalle } from '../api/unitsApi';

// ─── Visual tokens ────────────────────────────────────────────────────────────
const TH_SX = {
  py: 1.25, px: 3, bgcolor: '#F8FAFC',
  fontSize: 11, fontWeight: 700, color: '#94A3B8',
  textTransform: 'uppercase' as const, letterSpacing: '0.06em',
  borderBottom: '1px solid #E2E8F0',
};
const TD_SX = { py: 1.5, px: 3, fontSize: 13.5, borderColor: '#F1F5F9', color: '#64748B' };
const PAGE_SIZE = 15;

const TIPOS_UNIDAD = [
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'casa',        label: 'Casa' },
  { value: 'local',       label: 'Local' },
  { value: 'oficina',     label: 'Oficina' },
];

const TIPO_LABEL: Record<string, string> = {
  apartamento: 'Apto',
  casa:        'Casa',
  local:       'Local',
  oficina:     'Oficina',
};

// ─── Dialog nueva unidad ──────────────────────────────────────────────────────
function NuevaUnidadDialog({ open, onClose, onCreated }: {
  open: boolean; onClose: () => void; onCreated: () => void;
}) {
  const [form, setForm] = useState<CrearUnidadPayload>({ numero: '', tipo: 'apartamento' });
  const [error, setError] = useState('');

  const torresQ = useQuery({
    queryKey: ['torres-select'],
    queryFn: unitsApi.getTorres,
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: () => {
      const payload: CrearUnidadPayload = {
        numero: form.numero.trim(),
        tipo:   form.tipo,
        ...(form.torre_id && { torre_id: form.torre_id }),
        ...(form.piso     && { piso:    Number(form.piso) }),
        ...(form.area_m2  && { area_m2: Number(form.area_m2) }),
      };
      return unitsApi.crear(payload);
    },
    onSuccess: () => { onCreated(); handleClose(); },
    onError:   (err: any) => setError(err?.response?.data?.detail ?? 'Error al crear la unidad'),
  });

  const handleClose = () => {
    setForm({ numero: '', tipo: 'apartamento' });
    setError('');
    onClose();
  };

  const hasTorres = (torresQ.data ?? []).length > 0;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography fontWeight={700} fontSize={15.5}>Nueva Unidad</Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: '#94A3B8' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '12px !important' }}>
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
          <TextField label="Número *" size="small" value={form.numero}
            onChange={e => setForm(f => ({ ...f, numero: e.target.value }))}
            placeholder="Ej. 101"
            InputProps={{ sx: { fontSize: 13.5 } }} InputLabelProps={{ sx: { fontSize: 13.5 } }} />
          <TextField select label="Tipo *" size="small" value={form.tipo}
            onChange={e => setForm(f => ({ ...f, tipo: e.target.value as CrearUnidadPayload['tipo'] }))}
            InputProps={{ sx: { fontSize: 13.5 } }} InputLabelProps={{ sx: { fontSize: 13.5 } }}>
            {TIPOS_UNIDAD.map(t => (
              <MenuItem key={t.value} value={t.value} sx={{ fontSize: 13.5 }}>{t.label}</MenuItem>
            ))}
          </TextField>
        </Box>

        {hasTorres && (
          <TextField select label="Torre" size="small" value={form.torre_id ?? ''}
            onChange={e => setForm(f => ({ ...f, torre_id: e.target.value || undefined }))}
            InputProps={{ sx: { fontSize: 13.5 } }} InputLabelProps={{ sx: { fontSize: 13.5 } }}>
            <MenuItem value="" sx={{ fontSize: 13.5 }}>Sin torre</MenuItem>
            {torresQ.data!.map(t => (
              <MenuItem key={t.id} value={t.id} sx={{ fontSize: 13.5 }}>{t.nombre}</MenuItem>
            ))}
          </TextField>
        )}

        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
          <TextField label="Piso" size="small" type="number"
            value={form.piso ?? ''}
            onChange={e => setForm(f => ({ ...f, piso: e.target.value ? Number(e.target.value) : undefined }))}
            InputProps={{ sx: { fontSize: 13.5 } }} InputLabelProps={{ sx: { fontSize: 13.5 } }} />
          <TextField label="Área m²" size="small" type="number"
            value={form.area_m2 ?? ''}
            onChange={e => setForm(f => ({ ...f, area_m2: e.target.value ? Number(e.target.value) : undefined }))}
            InputProps={{ sx: { fontSize: 13.5 } }} InputLabelProps={{ sx: { fontSize: 13.5 } }} />
        </Box>

        {error && <Alert severity="error" sx={{ fontSize: 13, py: 0.5 }}>{error}</Alert>}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={handleClose} sx={{ color: '#64748B', textTransform: 'none', fontSize: 13.5 }}>
          Cancelar
        </Button>
        <Button variant="contained"
          disabled={!form.numero.trim() || mutation.isPending}
          onClick={() => mutation.mutate()}
          sx={{
            bgcolor: '#2563EB', textTransform: 'none', fontSize: 13.5, fontWeight: 600,
            boxShadow: 'none', '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' },
          }}>
          {mutation.isPending ? 'Creando...' : 'Crear unidad'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Dialog editar unidad ─────────────────────────────────────────────────────
function EditarUnidadDialog({ unidad, onClose, onSaved }: {
  unidad: UnidadDetalle; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState<EditarUnidadPayload>({
    numero:   unidad.numero,
    tipo:     unidad.tipo,
    torre_id: unidad.torre_id ?? undefined,
    piso:     unidad.piso    ?? undefined,
    area_m2:  unidad.area_m2 ?? undefined,
  });
  const [error, setError] = useState('');

  const torresQ = useQuery({
    queryKey: ['torres-select'],
    queryFn: unitsApi.getTorres,
  });

  const mutation = useMutation({
    mutationFn: () => {
      const payload: EditarUnidadPayload = {
        numero:   form.numero?.trim(),
        tipo:     form.tipo,
        torre_id: form.torre_id || null,
        piso:     form.piso    != null ? Number(form.piso)    : null,
        area_m2:  form.area_m2 != null ? Number(form.area_m2) : null,
      };
      return unitsApi.editar(unidad.id, payload);
    },
    onSuccess: () => { onSaved(); onClose(); },
    onError:   (err: any) => setError(err?.response?.data?.detail ?? 'Error al guardar cambios'),
  });

  const hasTorres = (torresQ.data ?? []).length > 0;

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography fontWeight={700} fontSize={15.5}>Editar Unidad</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '12px !important' }}>
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
          <TextField label="Número *" size="small" value={form.numero ?? ''}
            onChange={e => setForm(f => ({ ...f, numero: e.target.value }))}
            InputProps={{ sx: { fontSize: 13.5 } }} InputLabelProps={{ sx: { fontSize: 13.5 } }} />
          <TextField select label="Tipo *" size="small" value={form.tipo ?? 'apartamento'}
            onChange={e => setForm(f => ({ ...f, tipo: e.target.value as UnidadDetalle['tipo'] }))}
            InputProps={{ sx: { fontSize: 13.5 } }} InputLabelProps={{ sx: { fontSize: 13.5 } }}>
            {TIPOS_UNIDAD.map(t => (
              <MenuItem key={t.value} value={t.value} sx={{ fontSize: 13.5 }}>{t.label}</MenuItem>
            ))}
          </TextField>
        </Box>

        {hasTorres && (
          <TextField select label="Torre" size="small" value={form.torre_id ?? ''}
            onChange={e => setForm(f => ({ ...f, torre_id: e.target.value || undefined }))}
            InputProps={{ sx: { fontSize: 13.5 } }} InputLabelProps={{ sx: { fontSize: 13.5 } }}>
            <MenuItem value="" sx={{ fontSize: 13.5 }}>Sin torre</MenuItem>
            {torresQ.data!.map(t => (
              <MenuItem key={t.id} value={t.id} sx={{ fontSize: 13.5 }}>{t.nombre}</MenuItem>
            ))}
          </TextField>
        )}

        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
          <TextField label="Piso" size="small" type="number"
            value={form.piso ?? ''}
            onChange={e => setForm(f => ({ ...f, piso: e.target.value ? Number(e.target.value) : null }))}
            InputProps={{ sx: { fontSize: 13.5 } }} InputLabelProps={{ sx: { fontSize: 13.5 } }} />
          <TextField label="Área m²" size="small" type="number"
            value={form.area_m2 ?? ''}
            onChange={e => setForm(f => ({ ...f, area_m2: e.target.value ? Number(e.target.value) : null }))}
            InputProps={{ sx: { fontSize: 13.5 } }} InputLabelProps={{ sx: { fontSize: 13.5 } }} />
        </Box>

        {error && <Alert severity="error" sx={{ fontSize: 13, py: 0.5 }}>{error}</Alert>}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: '#64748B', textTransform: 'none', fontSize: 13.5 }}>
          Cancelar
        </Button>
        <Button variant="contained"
          disabled={!form.numero?.trim() || mutation.isPending}
          onClick={() => mutation.mutate()}
          sx={{
            bgcolor: '#2563EB', textTransform: 'none', fontSize: 13.5, fontWeight: 600,
            boxShadow: 'none', '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' },
          }}>
          {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Dialog confirmar eliminar ────────────────────────────────────────────────
function EliminarDialog({ unidad, onConfirm, onClose, loading, error }: {
  unidad: UnidadDetalle; onConfirm: () => void; onClose: () => void; loading: boolean; error?: string;
}) {
  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography fontWeight={700} fontSize={15.5}>Eliminar unidad</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: '8px !important', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography fontSize={13.5} color="#64748B">
          ¿Deseas eliminar la unidad <strong style={{ color: '#0F172A' }}>{unidad.numero}</strong>?
          {unidad.residentes.length > 0 && (
            <> Tiene {unidad.residentes.length} residente(s) asociado(s).</>
          )}
        </Typography>
        {error && <Alert severity="error" sx={{ fontSize: 13, py: 0.5 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: '#64748B', textTransform: 'none', fontSize: 13.5 }}>
          Cancelar
        </Button>
        <Button variant="contained" disabled={loading} onClick={onConfirm}
          sx={{
            bgcolor: '#DC2626', textTransform: 'none', fontSize: 13.5, fontWeight: 600,
            boxShadow: 'none', '&:hover': { bgcolor: '#B91C1C', boxShadow: 'none' },
          }}>
          {loading ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────
export function UnitsPage() {
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);
  const isSuperadmin = user?.rol === 'superadmin';

  const [search,      setSearch]      = useState('');
  const [page,        setPage]        = useState(0);
  const [dialogOpen,  setDialogOpen]  = useState(false);
  const [editTarget,   setEditTarget]   = useState<UnidadDetalle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UnidadDetalle | null>(null);
  const [deleteError,  setDeleteError]  = useState('');

  const { data = [], isLoading } = useQuery({
    queryKey: ['unidades-detalle'],
    queryFn: unitsApi.listDetalle,
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: string) => unitsApi.eliminar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['unidades-detalle'] });
      setDeleteTarget(null);
      setDeleteError('');
    },
    onError: (err: any) => setDeleteError(err?.response?.data?.detail ?? 'Error al eliminar la unidad'),
  });

  const q = search.toLowerCase();
  const filtered = useMemo(() =>
    data.filter(u =>
      !q || [
        u.numero, u.nombre_torre,
        ...u.residentes.map(r => `${r.nombre} ${r.apellido}`),
      ].some(f => f?.toLowerCase().includes(q))
    ), [data, q]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const libres    = data.filter(u => !u.habitada).length;
  const ocupadas  = data.filter(u =>  u.habitada).length;

  const refresh = () => qc.invalidateQueries({ queryKey: ['unidades-detalle'] });

  return (
    <Box display="flex" flexDirection="column" gap={2.5}>

      {/* ── Toolbar ── */}
      <Box display="flex" alignItems="center" gap={1.5}>
        <SearchBar
          value={search}
          onChange={v => { setSearch(v); setPage(0); }}
          placeholder="Buscar por número, torre o residente..."
          width={300}
        />
        <Box flex={1} />
        {!isLoading && data.length > 0 && (
          <Typography fontSize={13} color="#64748B">
            <strong style={{ color: '#059669' }}>{ocupadas}</strong> ocupadas ·{' '}
            <strong style={{ color: '#94A3B8' }}>{libres}</strong> libres
          </Typography>
        )}
        {isSuperadmin && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
            sx={{
              bgcolor: '#2563EB', color: 'white', fontWeight: 700,
              fontSize: 13.5, px: 2.5, py: 1.1, borderRadius: '6px',
              boxShadow: 'none', textTransform: 'none',
              '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' },
            }}
          >
            Nueva unidad
          </Button>
        )}
      </Box>

      {/* ── Tabla ── */}
      <Box sx={{
        bgcolor: 'white', borderRadius: 2,
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress size={28} sx={{ color: '#0F172A' }} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box py={8} textAlign="center">
            <HomeWork sx={{ fontSize: 36, color: '#E2E8F0', mb: 1, display: 'block', mx: 'auto' }} />
            <Typography fontSize={13.5} color="#94A3B8">
              {q ? 'Sin resultados para tu búsqueda' : 'No hay unidades registradas'}
            </Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': TH_SX }}>
                  <TableCell>Unidad</TableCell>
                  <TableCell>Torre</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Piso</TableCell>
                  <TableCell>Área</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Ocupada por</TableCell>
                  {isSuperadmin && <TableCell sx={{ width: 90 }} />}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map(u => (
                  <TableRow key={u.id} sx={{
                    '&:hover': { bgcolor: '#F8FAFC' },
                    '& td': TD_SX,
                    '&:last-child td': { border: 0 },
                  }}>
                    <TableCell>
                      <Typography fontSize={13.5} fontWeight={700} color="#0F172A">
                        {u.numero}
                      </Typography>
                    </TableCell>

                    <TableCell>{u.nombre_torre ?? '—'}</TableCell>

                    <TableCell>
                      <Chip label={TIPO_LABEL[u.tipo]} size="small" sx={{
                        bgcolor: '#F1F5F9', color: '#475569',
                        fontWeight: 600, fontSize: 11, border: 'none', borderRadius: 1,
                      }} />
                    </TableCell>

                    <TableCell>{u.piso != null ? `Piso ${u.piso}` : '—'}</TableCell>

                    <TableCell>{u.area_m2 != null ? `${u.area_m2} m²` : '—'}</TableCell>

                    <TableCell>
                      <Chip
                        label={u.habitada ? 'Ocupada' : 'Libre'}
                        size="small"
                        sx={{
                          bgcolor: u.habitada ? '#D1FAE5' : '#F1F5F9',
                          color:   u.habitada ? '#059669' : '#94A3B8',
                          fontWeight: 700, fontSize: 11, border: 'none', borderRadius: 1,
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      {u.residentes.length === 0 ? (
                        <Typography fontSize={13} color="#CBD5E1">Sin residentes</Typography>
                      ) : (
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <AvatarGroup max={3} sx={{
                            '& .MuiAvatar-root': {
                              width: 26, height: 26, fontSize: 10, fontWeight: 700,
                              border: '1.5px solid white',
                            },
                          }}>
                            {u.residentes.map(r => (
                              <Tooltip key={r.id} title={`${r.nombre} ${r.apellido}`} arrow>
                                <Avatar src={r.avatar_url ?? undefined} sx={{ bgcolor: '#0F172A' }}>
                                  {!r.avatar_url && `${r.nombre[0]}${r.apellido[0]}`}
                                </Avatar>
                              </Tooltip>
                            ))}
                          </AvatarGroup>
                          <Box>
                            {u.residentes.slice(0, 2).map(r => (
                              <Typography key={r.id} fontSize={12.5} color="#334155" lineHeight={1.4}>
                                {r.nombre} {r.apellido}
                              </Typography>
                            ))}
                            {u.residentes.length > 2 && (
                              <Typography fontSize={12} color="#94A3B8">
                                +{u.residentes.length - 2} más
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      )}
                    </TableCell>

                    {/* ── Acciones (solo superadmin) ── */}
                    {isSuperadmin && (
                      <TableCell sx={{ pr: 2 }}>
                        <Box display="flex" gap={0.5} justifyContent="flex-end">
                          <Tooltip title="Editar" arrow>
                            <IconButton size="small" onClick={() => setEditTarget(u)}
                              sx={{ color: '#64748B', '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar" arrow>
                            <IconButton size="small" onClick={() => setDeleteTarget(u)}
                              sx={{ color: '#64748B', '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' } }}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filtered.length > PAGE_SIZE && (
              <TablePagination
                component="div"
                count={filtered.length}
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

      {/* ── Dialogs ── */}
      <NuevaUnidadDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={() => { refresh(); setDialogOpen(false); }}
      />

      {editTarget && (
        <EditarUnidadDialog
          unidad={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => { refresh(); setEditTarget(null); }}
        />
      )}

      {deleteTarget && (
        <EliminarDialog
          unidad={deleteTarget}
          loading={eliminarMutation.isPending}
          error={deleteError}
          onConfirm={() => eliminarMutation.mutate(deleteTarget.id)}
          onClose={() => { setDeleteTarget(null); setDeleteError(''); }}
        />
      )}

    </Box>
  );
}
