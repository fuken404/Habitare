import {
  Box, Button, CircularProgress, Dialog, DialogContent,
  DialogTitle, Divider, Typography,
} from '@mui/material';
import { HowToReg } from '@mui/icons-material';

interface Props {
  open: boolean;
  visitante: string;
  autorizadoPor: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmIngresoDialog({ open, visitante, autorizadoPor, loading, onConfirm, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 2, boxShadow: '0 8px 40px rgba(0,0,0,0.12)' } }}>
      <DialogTitle sx={{ px: 3, py: 2.5, pb: 0 }}>
        <Box display="flex" alignItems="center" gap={1.25}>
          <Box sx={{
            width: 34, height: 34, borderRadius: 1.5, flexShrink: 0,
            bgcolor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <HowToReg sx={{ fontSize: 18, color: '#15803D' }} />
          </Box>
          <Typography fontWeight={700} fontSize={15} color="#0F172A">Confirmar ingreso</Typography>
        </Box>
      </DialogTitle>

      <Divider sx={{ mx: 3, mt: 2, borderColor: '#F1F5F9' }} />

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Typography fontSize={13.5} color="#334155" lineHeight={1.6}>
          ¿Confirmas el ingreso de{' '}
          <Box component="span" fontWeight={700} color="#0F172A">{visitante}</Box>
          {autorizadoPor && (
            <>, autorizado por <Box component="span" fontWeight={600}>{autorizadoPor}</Box></>
          )}
          ?
        </Typography>

        <Divider sx={{ my: 2.5, borderColor: '#F1F5F9' }} />

        <Box display="flex" justifyContent="flex-end" gap={1.5}>
          <Button onClick={onClose} disabled={loading}
            sx={{ fontSize: 13.5, fontWeight: 600, color: '#64748B', textTransform: 'none', px: 2.5 }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={onConfirm}
            disabled={loading}
            sx={{
              bgcolor: '#0F172A', fontWeight: 700, fontSize: 13.5,
              textTransform: 'none', px: 3, borderRadius: '6px',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' },
            }}
          >
            {loading
              ? <CircularProgress size={16} sx={{ color: 'rgba(255,255,255,0.6)' }} />
              : 'Confirmar ingreso'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
