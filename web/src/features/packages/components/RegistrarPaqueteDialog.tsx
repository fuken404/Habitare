import { useState } from 'react';
import {
  Box, Typography, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/core/api/client';
import dayjs from 'dayjs';
import { packagesApi } from '../api/packagesApi';

interface Unidad { id: string; numero: string; torre_id: string | null; }
interface Torre  { id: string; nombre: string; }

export function RegistrarPaqueteDialog({ open, onClose, onCreated }: {
  open: boolean; onClose: () => void; onCreated: () => void;
}) {
  const qc = useQueryClient();
  const [torreId,  setTorreId]  = useState('');
  const [unidadId, setUnidadId] = useState('');

  const { data: unidades = [] } = useQuery<Unidad[]>({
    queryKey: ['unidades'],
    queryFn: () => apiClient.get<Unidad[]>('/unidades').then(r => r.data),
    staleTime: 5 * 60_000,
  });
  const { data: torres = [] } = useQuery<Torre[]>({
    queryKey: ['torres'],
    queryFn: () => apiClient.get<Torre[]>('/torres').then(r => r.data),
    staleTime: 5 * 60_000,
  });

  const hasTorres = torres.length > 0;
  const unidadesFiltradas = torreId
    ? unidades.filter(u => u.torre_id === torreId)
    : unidades;

  const mutation = useMutation({
    mutationFn: () => packagesApi.registrar({ unidad_id: unidadId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['paquetes'] });
      onCreated();
    },
  });

  const handleClose = () => { setTorreId(''); setUnidadId(''); onClose(); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography fontWeight={700} fontSize={15.5}>Registrar Llegada de Paquete</Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: '#94A3B8' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '12px !important' }}>
        {hasTorres && (
          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontSize: 13.5 }}>Torre *</InputLabel>
            <Select
              value={torreId}
              onChange={e => { setTorreId(e.target.value); setUnidadId(''); }}
              label="Torre *"
              sx={{ fontSize: 13.5 }}
            >
              {torres.map(t => (
                <MenuItem key={t.id} value={t.id} sx={{ fontSize: 13.5 }}>{t.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <FormControl fullWidth size="small" disabled={hasTorres && !torreId}>
          <InputLabel sx={{ fontSize: 13.5 }}>Unidad *</InputLabel>
          <Select
            value={unidadId}
            onChange={e => setUnidadId(e.target.value)}
            label="Unidad *"
            sx={{ fontSize: 13.5 }}
          >
            {unidadesFiltradas.map(u => (
              <MenuItem key={u.id} value={u.id} sx={{ fontSize: 13.5 }}>
                Apto {u.numero}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box>
          <Typography fontSize={12} color="#94A3B8" mb={0.5}>Fecha y hora</Typography>
          <Typography fontSize={13.5} color="#334155" fontWeight={500}>
            {dayjs().format('DD/MM/YYYY · HH:mm')}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={handleClose}
          sx={{ color: '#64748B', textTransform: 'none', fontSize: 13.5 }}>
          Cancelar
        </Button>
        <Button variant="contained"
          disabled={!unidadId || (hasTorres && !torreId) || mutation.isPending}
          onClick={() => mutation.mutate()}
          sx={{ bgcolor: '#2563EB', textTransform: 'none', fontSize: 13.5, fontWeight: 600,
            boxShadow: 'none', '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' } }}>
          {mutation.isPending ? 'Guardando...' : 'Confirmar Paquete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
