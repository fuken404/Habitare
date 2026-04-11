import { useState } from 'react';
import {
  Box, Button, CircularProgress, Dialog, DialogContent,
  DialogTitle, Divider, FormControl, IconButton, InputBase,
  MenuItem, Select, Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { reportsApi, type TipoIncidente, type SeveridadIncidente } from '../api/reportsApi';

const SEVERIDADES: { value: SeveridadIncidente; label: string }[] = [
  { value: 'baja',    label: 'Baja' },
  { value: 'media',   label: 'Media' },
  { value: 'alta',    label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
];

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
        transition: 'all 0.15s ease',
        '&:hover': { borderColor: '#CBD5E1', bgcolor: 'white' },
        '&.Mui-focused': { borderColor: '#2563EB', bgcolor: 'white', boxShadow: '0 0 0 3px rgba(37,99,235,0.10)' },
        '& input::placeholder, & textarea::placeholder': { color: '#94A3B8', opacity: 1 },
        ...props.sx,
      }}
    />
  );
}

interface Props {
  open: boolean;
  tipos: TipoIncidente[];
  onClose: () => void;
  onCreated: () => void;
}

export function NewReportDialog({ open, tipos, onClose, onCreated }: Props) {
  const [tipoId, setTipoId]         = useState('');
  const [titulo, setTitulo]         = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [severidad, setSeveridad]   = useState<SeveridadIncidente>('media');
  const [ubicacion, setUbicacion]   = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const canSubmit = tipoId && titulo.trim() && descripcion.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      await reportsApi.crearIncidente({
        tipo_id: tipoId,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        severidad,
        ubicacion: ubicacion.trim() || undefined,
      });
      onCreated();
    } catch {
      setError('No se pudo registrar la novedad. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 2, boxShadow: '0 8px 40px rgba(0,0,0,0.12)' } }}>
      <DialogTitle sx={{ px: 3, py: 2.5, pb: 0 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography fontWeight={700} fontSize={15.5} color="#0F172A">
            Registrar novedad
          </Typography>
          <IconButton size="small" onClick={onClose}
            sx={{ color: '#94A3B8', '&:hover': { color: '#64748B' } }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider sx={{ mx: 3, mt: 2, borderColor: '#F1F5F9' }} />

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        {error && (
          <Box sx={{
            p: '10px 14px', borderRadius: 1.5, mb: 2.5,
            bgcolor: '#FEF2F2', border: '1px solid #FECACA',
          }}>
            <Typography fontSize={13} color="#B91C1C">{error}</Typography>
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2.5}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {/* Categoría */}
            <Box>
              <FieldLabel>Categoría *</FieldLabel>
              <FormControl fullWidth size="small">
                <Select
                  value={tipoId}
                  onChange={(e) => setTipoId(e.target.value)}
                  displayEmpty
                  required
                  sx={{
                    fontSize: 13.5, bgcolor: '#F8FAFC', borderRadius: '6px',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563EB' },
                  }}
                >
                  <MenuItem value="" disabled sx={{ fontSize: 13.5, color: '#94A3B8' }}>
                    Seleccionar...
                  </MenuItem>
                  {tipos.map((t) => (
                    <MenuItem key={t.id} value={t.id} sx={{ fontSize: 13.5 }}>{t.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Severidad */}
            <Box>
              <FieldLabel>Severidad</FieldLabel>
              <FormControl fullWidth size="small">
                <Select
                  value={severidad}
                  onChange={(e) => setSeveridad(e.target.value as SeveridadIncidente)}
                  sx={{
                    fontSize: 13.5, bgcolor: '#F8FAFC', borderRadius: '6px',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563EB' },
                  }}
                >
                  {SEVERIDADES.map((s) => (
                    <MenuItem key={s.value} value={s.value} sx={{ fontSize: 13.5 }}>{s.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Título */}
          <Box>
            <FieldLabel>Título *</FieldLabel>
            <StyledInput
              placeholder="Ej. Persona sospechosa en parqueadero"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </Box>

          {/* Descripción */}
          <Box>
            <FieldLabel>Descripción *</FieldLabel>
            <StyledInput
              multiline
              rows={3}
              placeholder="Describe los detalles de la novedad..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              sx={{ alignItems: 'flex-start', py: 1.25 }}
            />
          </Box>

          {/* Ubicación */}
          <Box>
            <FieldLabel>Ubicación</FieldLabel>
            <StyledInput
              placeholder="Ej. Torre B – Piso 3, Zona de parqueadero"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
            />
          </Box>

          <Divider sx={{ borderColor: '#F1F5F9' }} />

          <Box display="flex" justifyContent="flex-end" gap={1.5}>
            <Button
              onClick={onClose}
              sx={{
                fontSize: 13.5, fontWeight: 600, color: '#64748B',
                textTransform: 'none', px: 2.5,
                '&:hover': { bgcolor: '#F1F5F9' },
              }}
            >
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
              {loading ? <CircularProgress size={16} sx={{ color: 'rgba(255,255,255,0.6)' }} /> : 'Registrar'}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
