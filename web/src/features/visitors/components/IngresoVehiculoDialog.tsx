import { useState } from 'react';
import {
  Box, Button, Dialog, DialogContent, DialogTitle,
  Divider, FormControl, IconButton, InputBase,
  MenuItem, Select, Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';

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
  onConfirm: (tipo_vehiculo: string, placa: string) => void;
}

export function IngresoVehiculoDialog({ open, onClose, onConfirm }: Props) {
  const [tipo, setTipo]   = useState('carro');
  const [placa, setPlaca] = useState('');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 2, boxShadow: '0 8px 40px rgba(0,0,0,0.12)' } }}>
      <DialogTitle sx={{ px: 3, py: 2.5, pb: 0 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography fontWeight={700} fontSize={15} color="#0F172A">Datos del vehículo</Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: '#94A3B8' }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider sx={{ mx: 3, mt: 2, borderColor: '#F1F5F9' }} />

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Box display="flex" flexDirection="column" gap={2.5}>
          <Box>
            <FieldLabel>Tipo de vehículo</FieldLabel>
            <FormControl fullWidth size="small">
              <Select value={tipo} onChange={(e) => setTipo(e.target.value)}
                sx={{
                  fontSize: 13.5, bgcolor: '#F8FAFC', borderRadius: '6px',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                }}>
                <MenuItem value="carro" sx={{ fontSize: 13.5 }}>Carro</MenuItem>
                <MenuItem value="moto"  sx={{ fontSize: 13.5 }}>Moto</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <FieldLabel>Placa</FieldLabel>
            <StyledInput
              placeholder="Ej. ABC-123"
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
            />
          </Box>

          <Divider sx={{ borderColor: '#F1F5F9' }} />

          <Box display="flex" justifyContent="flex-end" gap={1.5}>
            <Button onClick={onClose} sx={{ fontSize: 13.5, fontWeight: 600, color: '#64748B', textTransform: 'none', px: 2.5 }}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              disabled={!placa.trim()}
              onClick={() => onConfirm(tipo, placa.trim())}
              sx={{
                bgcolor: '#0F172A', fontWeight: 700, fontSize: 13.5,
                textTransform: 'none', px: 3, borderRadius: '6px',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' },
                '&:disabled': { bgcolor: '#CBD5E1', color: 'white' },
              }}
            >
              Confirmar ingreso
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
