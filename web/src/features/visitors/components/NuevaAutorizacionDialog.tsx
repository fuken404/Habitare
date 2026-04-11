import { useState } from 'react';
import {
  Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle,
  Divider, FormControl, IconButton, InputBase,
  MenuItem, Select, Typography, Switch, FormControlLabel,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { apiClient } from '@/core/api/client';
import { visitorsApi } from '../api/visitorsApi';

interface Unidad { id: string; numero: string; torre_id: string | null; }

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{
      fontSize: 11, fontWeight: 700, color: '#64748B',
      textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75,
    }}>
      {children}
    </Typography>
  );
}

function StyledInput(props: React.ComponentProps<typeof InputBase>) {
  return (
    <InputBase
      {...props}
      sx={{
        border: '1px solid #E2E8F0', borderRadius: '6px',
        px: 1.75, py: 1.1, fontSize: 13.5, width: '100%',
        bgcolor: '#F8FAFC', color: '#0F172A',
        '&:hover': { borderColor: '#CBD5E1', bgcolor: 'white' },
        '&.Mui-focused': { borderColor: '#2563EB', bgcolor: 'white', boxShadow: '0 0 0 3px rgba(37,99,235,0.10)' },
        '& input::placeholder': { color: '#94A3B8', opacity: 1 },
        ...props.sx,
      }}
    />
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function NuevaAutorizacionDialog({ open, onClose, onCreated }: Props) {
  const [tipoDoc,   setTipoDoc]   = useState('CC');
  const [nDoc,      setNDoc]      = useState('');
  const [nombre,    setNombre]    = useState('');
  const [apellido,  setApellido]  = useState('');
  const [unidadId,  setUnidadId]  = useState('');
  const [fecha,     setFecha]     = useState(dayjs().format('YYYY-MM-DD'));
  const [parq,      setParq]      = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const { data: unidades = [] } = useQuery<Unidad[]>({
    queryKey: ['unidades-list'],
    queryFn: () => apiClient.get<Unidad[]>('/unidades').then((r) => r.data),
    staleTime: 5 * 60_000,
  });

  const canSubmit = nDoc.trim() && nombre.trim() && unidadId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      await visitorsApi.crearAutorizacion({
        visitante: {
          tipo_documento: tipoDoc,
          n_documento: nDoc.trim(),
          nombre: nombre.trim(),
          apellido: apellido.trim() || undefined,
        },
        unidad_id: unidadId,
        fecha_visita: fecha,
        requiere_parqueadero: parq,
      });
      onCreated();
    } catch {
      setError('No se pudo crear la autorización. Verifica los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 2, boxShadow: '0 8px 40px rgba(0,0,0,0.12)' } }}>
      <DialogTitle sx={{ px: 3, py: 2.5, pb: 0 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography fontWeight={700} fontSize={15.5} color="#0F172A">Nueva autorización de visita</Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: '#94A3B8' }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider sx={{ mx: 3, mt: 2, borderColor: '#F1F5F9' }} />

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        {error && (
          <Box sx={{ p: '10px 14px', borderRadius: 1.5, mb: 2.5, bgcolor: '#FEF2F2', border: '1px solid #FECACA' }}>
            <Typography fontSize={13} color="#B91C1C">{error}</Typography>
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2.5}>

          {/* Documento */}
          <Box>
            <FieldLabel>Tipo y número de documento *</FieldLabel>
            <Box display="flex" gap={1}>
              <FormControl size="small" sx={{ minWidth: 90 }}>
                <Select value={tipoDoc} onChange={(e) => setTipoDoc(e.target.value)}
                  sx={{ fontSize: 13.5, bgcolor: '#F8FAFC', borderRadius: '6px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' } }}>
                  {['CC', 'CE', 'TI', 'PP', 'NIT'].map((t) => (
                    <MenuItem key={t} value={t} sx={{ fontSize: 13.5 }}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <StyledInput placeholder="Número de documento" value={nDoc} onChange={(e) => setNDoc(e.target.value)} required />
            </Box>
          </Box>

          {/* Nombre */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <FieldLabel>Nombre *</FieldLabel>
              <StyledInput placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </Box>
            <Box>
              <FieldLabel>Apellido</FieldLabel>
              <StyledInput placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} />
            </Box>
          </Box>

          {/* Unidad y fecha */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <FieldLabel>Unidad *</FieldLabel>
              <FormControl fullWidth size="small">
                <Select value={unidadId} onChange={(e) => setUnidadId(e.target.value)} displayEmpty required
                  sx={{ fontSize: 13.5, bgcolor: '#F8FAFC', borderRadius: '6px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' } }}>
                  <MenuItem value="" disabled sx={{ fontSize: 13.5, color: '#94A3B8' }}>Seleccionar...</MenuItem>
                  {unidades.map((u) => (
                    <MenuItem key={u.id} value={u.id} sx={{ fontSize: 13.5 }}>Unidad {u.numero}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box>
              <FieldLabel>Fecha de visita *</FieldLabel>
              <StyledInput
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                inputProps={{ min: dayjs().format('YYYY-MM-DD') }}
              />
            </Box>
          </Box>

          {/* Parqueadero */}
          <FormControlLabel
            control={
              <Switch
                checked={parq}
                onChange={(e) => setParq(e.target.checked)}
                size="small"
                sx={{ '& .MuiSwitch-thumb': { bgcolor: parq ? '#2563EB' : '#94A3B8' } }}
              />
            }
            label={<Typography fontSize={13.5} color="#334155">Requiere parqueadero</Typography>}
            sx={{ mx: 0 }}
          />

          <Divider sx={{ borderColor: '#F1F5F9' }} />

          <Box display="flex" justifyContent="flex-end" gap={1.5}>
            <Button onClick={onClose} sx={{ fontSize: 13.5, fontWeight: 600, color: '#64748B', textTransform: 'none', px: 2.5 }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!canSubmit || loading}
              sx={{
                bgcolor: '#0F172A', fontWeight: 700, fontSize: 13.5,
                textTransform: 'none', px: 3, borderRadius: '6px',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' },
                '&:disabled': { bgcolor: '#CBD5E1', color: 'white' },
              }}
            >
              {loading ? <CircularProgress size={16} sx={{ color: 'rgba(255,255,255,0.6)' }} /> : 'Crear autorización'}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
