import { useState, useMemo } from 'react';
import {
  Avatar, Box, Button, CircularProgress, Dialog, DialogContent,
  DialogTitle, Divider, IconButton, InputBase, Typography,
} from '@mui/material';
import { Close, Search, HowToReg, ArrowBack, CheckCircle } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visitorsApi, type Autorizacion } from '../api/visitorsApi';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function nombreCompleto(v: Autorizacion['visitante']) {
  return [v.nombre, v.apellido].filter(Boolean).join(' ');
}
function initials(v: Autorizacion['visitante']) {
  return `${v.nombre[0] ?? ''}${v.apellido?.[0] ?? ''}`.toUpperCase();
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = 'search' | 'confirm' | 'success';

export function IngresoRapidoDialog({ open, onClose }: Props) {
  const qc = useQueryClient();
  const [query, setQuery]         = useState('');
  const [selected, setSelected]   = useState<Autorizacion | null>(null);
  const [step, setStep]           = useState<Step>('search');

  const { data: autorizaciones = [], isLoading } = useQuery({
    queryKey: ['autorizaciones-rapido'],
    queryFn:  () => visitorsApi.getAutorizaciones(),
    enabled:  open,
    staleTime: 30_000,
  });

  const pendientes = useMemo(
    () => autorizaciones.filter((a) => a.estado === 'pendiente' || a.estado === 'activa'),
    [autorizaciones],
  );

  const resultados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return pendientes.filter(
      (a) =>
        a.visitante.n_documento.includes(q) ||
        nombreCompleto(a.visitante).toLowerCase().includes(q),
    );
  }, [query, pendientes]);

  const ingresoMutation = useMutation({
    mutationFn: visitorsApi.registrarIngreso,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['autorizaciones'] });
      qc.invalidateQueries({ queryKey: ['ingresos-hoy'] });
      qc.invalidateQueries({ queryKey: ['autorizaciones-rapido'] });
      setStep('success');
    },
  });

  const handleClose = () => {
    onClose();
    setTimeout(() => { setQuery(''); setSelected(null); setStep('search'); }, 300);
  };

  const autPor = selected
    ? [selected.nombre_autorizado_por, selected.numero_unidad, selected.nombre_torre]
        .filter(Boolean).join(' – ')
    : '';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 2, boxShadow: '0 8px 40px rgba(0,0,0,0.14)' } }}>

      {/* ── Header ── */}
      <DialogTitle sx={{ px: 3, py: 2.5, pb: 0 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1.25}>
            {step === 'confirm' && (
              <IconButton size="small" onClick={() => setStep('search')}
                sx={{ color: '#94A3B8', mr: 0.5, '&:hover': { color: '#64748B' } }}>
                <ArrowBack fontSize="small" />
              </IconButton>
            )}
            <Typography fontWeight={700} fontSize={15} color="#0F172A">
              {step === 'search'  && 'Ingresar visitante'}
              {step === 'confirm' && 'Confirmar ingreso'}
              {step === 'success' && 'Ingreso registrado'}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleClose}
            sx={{ color: '#94A3B8', '&:hover': { color: '#64748B' } }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider sx={{ mx: 3, mt: 2, borderColor: '#F1F5F9' }} />

      <DialogContent sx={{ px: 3, py: 2.5 }}>

        {/* ── Step: búsqueda ── */}
        {step === 'search' && (
          <Box display="flex" flexDirection="column" gap={2}>
            {/* Input de búsqueda */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              border: '1px solid #E2E8F0', borderRadius: '6px',
              px: 1.5, py: 1, bgcolor: '#F8FAFC',
              '&:focus-within': { borderColor: '#2563EB', bgcolor: 'white', boxShadow: '0 0 0 3px rgba(37,99,235,0.10)' },
            }}>
              <Search sx={{ fontSize: 16, color: '#94A3B8', flexShrink: 0 }} />
              <InputBase
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Número de documento o nombre..."
                sx={{ fontSize: 13.5, flex: 1, '& input::placeholder': { color: '#94A3B8' } }}
              />
              {query && (
                <IconButton size="small" onClick={() => setQuery('')}
                  sx={{ p: 0.25, color: '#94A3B8', '&:hover': { color: '#64748B' } }}>
                  <Close sx={{ fontSize: 14 }} />
                </IconButton>
              )}
            </Box>

            {/* Resultados */}
            {isLoading ? (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress size={24} sx={{ color: '#0F172A' }} />
              </Box>
            ) : query.trim() === '' ? (
              <Typography fontSize={13} color="#94A3B8" textAlign="center" py={2}>
                Escribe un documento o nombre para buscar
              </Typography>
            ) : resultados.length === 0 ? (
              <Typography fontSize={13} color="#94A3B8" textAlign="center" py={2}>
                Sin autorizaciones activas para "{query}"
              </Typography>
            ) : (
              <Box display="flex" flexDirection="column" gap={0.75}>
                {resultados.map((aut) => (
                  <Box
                    key={aut.id}
                    onClick={() => { setSelected(aut); setStep('confirm'); }}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5,
                      p: '10px 14px', borderRadius: 1.5,
                      border: '1px solid #E2E8F0', cursor: 'pointer',
                      transition: 'all 0.12s ease',
                      '&:hover': { borderColor: '#2563EB', bgcolor: '#EFF6FF' },
                    }}
                  >
                    <Avatar sx={{ width: 32, height: 32, fontSize: 11, fontWeight: 700, bgcolor: '#0F172A', flexShrink: 0 }}>
                      {initials(aut.visitante)}
                    </Avatar>
                    <Box flex={1} minWidth={0}>
                      <Typography fontSize={13.5} fontWeight={600} color="#0F172A" noWrap>
                        {nombreCompleto(aut.visitante)}
                      </Typography>
                      <Typography fontSize={12} color="#94A3B8" noWrap>
                        {aut.visitante.tipo_documento}. {aut.visitante.n_documento}
                        {autPor && ` · ${[aut.nombre_autorizado_por, aut.numero_unidad].filter(Boolean).join(' – ')}`}
                      </Typography>
                    </Box>
                    <HowToReg sx={{ fontSize: 16, color: '#CBD5E1', flexShrink: 0 }} />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* ── Step: confirmación ── */}
        {step === 'confirm' && selected && (
          <Box display="flex" flexDirection="column" gap={2.5}>
            {/* Card del visitante */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              p: '14px 16px', borderRadius: 1.5, bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}>
              <Avatar sx={{ width: 38, height: 38, fontSize: 13, fontWeight: 700, bgcolor: '#0F172A' }}>
                {initials(selected.visitante)}
              </Avatar>
              <Box>
                <Typography fontSize={14} fontWeight={700} color="#0F172A">
                  {nombreCompleto(selected.visitante)}
                </Typography>
                <Typography fontSize={12.5} color="#64748B">
                  {selected.visitante.tipo_documento}. {selected.visitante.n_documento}
                </Typography>
                {autPor && (
                  <Typography fontSize={12} color="#94A3B8" mt={0.25}>
                    Autorizado por {autPor}
                  </Typography>
                )}
              </Box>
            </Box>

            <Typography fontSize={13.5} color="#334155" lineHeight={1.6}>
              ¿Confirmas el ingreso de este visitante al conjunto?
            </Typography>

            <Divider sx={{ borderColor: '#F1F5F9' }} />

            <Box display="flex" justifyContent="flex-end" gap={1.5}>
              <Button onClick={() => setStep('search')}
                sx={{ fontSize: 13.5, fontWeight: 600, color: '#64748B', textTransform: 'none', px: 2.5 }}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                disabled={ingresoMutation.isPending}
                onClick={() => ingresoMutation.mutate({ autorizacion_id: selected.id })}
                sx={{
                  bgcolor: '#0F172A', fontWeight: 700, fontSize: 13.5,
                  textTransform: 'none', px: 3, borderRadius: '6px',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' },
                }}
              >
                {ingresoMutation.isPending
                  ? <CircularProgress size={16} sx={{ color: 'rgba(255,255,255,0.6)' }} />
                  : 'Confirmar ingreso'}
              </Button>
            </Box>
          </Box>
        )}

        {/* ── Step: éxito ── */}
        {step === 'success' && selected && (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={1}>
            <Box sx={{
              width: 52, height: 52, borderRadius: '50%',
              bgcolor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircle sx={{ fontSize: 28, color: '#15803D' }} />
            </Box>
            <Box textAlign="center">
              <Typography fontWeight={700} fontSize={15} color="#0F172A" mb={0.5}>
                Ingreso registrado
              </Typography>
              <Typography fontSize={13.5} color="#64748B">
                {nombreCompleto(selected.visitante)} ha ingresado correctamente.
              </Typography>
            </Box>
            <Button
              fullWidth
              variant="contained"
              onClick={handleClose}
              sx={{
                mt: 1, bgcolor: '#0F172A', fontWeight: 700, fontSize: 13.5,
                textTransform: 'none', borderRadius: '6px', boxShadow: 'none',
                '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' },
              }}
            >
              Cerrar
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
