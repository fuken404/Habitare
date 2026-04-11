import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box, Typography, Avatar, Button, TextField, IconButton,
  CircularProgress, Divider, Alert, Menu, MenuItem, ListItemIcon,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { CameraAlt, PhotoCamera, UploadFile, DeleteOutline, Visibility, VisibilityOff, CheckCircle, Close, FiberManualRecord } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/core/auth/authStore';
import { profileApi } from '../api/profileApi';

// ─── Diálogo cámara ───────────────────────────────────────────────────────────
function CameraDialog({ open, onClose, onCapture }: {
  open: boolean;
  onClose: () => void;
  onCapture: (base64: string) => void;
}) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState('');

  const startCamera = useCallback(async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setError('No se pudo acceder a la cámara. Verifica los permisos del navegador.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (open) startCamera();
    else stopCamera();
    return stopCamera;
  }, [open, startCamera, stopCamera]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.9);
    stopCamera();
    onCapture(base64);
    onClose();
  };

  return (
    <Dialog open={open} onClose={() => { stopCamera(); onClose(); }} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography fontWeight={700} fontSize={15.5}>Tomar foto</Typography>
        <IconButton size="small" onClick={() => { stopCamera(); onClose(); }} sx={{ color: '#94A3B8' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, bgcolor: '#000', lineHeight: 0 }}>
        {error ? (
          <Box py={6} px={3}>
            <Alert severity="error" sx={{ fontSize: 13 }}>{error}</Alert>
          </Box>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', display: 'block', maxHeight: 400, objectFit: 'cover' }}
          />
        )}
      </DialogContent>
      {!error && (
        <DialogActions sx={{ justifyContent: 'center', py: 2.5 }}>
          <Button
            variant="contained"
            startIcon={<FiberManualRecord />}
            onClick={handleCapture}
            sx={{
              bgcolor: '#DC2626', textTransform: 'none', fontWeight: 600,
              fontSize: 14, px: 4, borderRadius: '8px', boxShadow: 'none',
              '&:hover': { bgcolor: '#B91C1C', boxShadow: 'none' },
            }}
          >
            Capturar
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

const roleLabel: Record<string, string> = {
  recepcion:      'Recepción',
  administracion: 'Administración',
  superadmin:     'Superadmin',
};

// ─── Sección reutilizable ─────────────────────────────────────────────────────
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{
      bgcolor: 'white', borderRadius: 2,
      border: '1px solid #E2E8F0',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      overflow: 'hidden',
    }}>
      <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #F1F5F9' }}>
        <Typography fontWeight={700} fontSize={14} color="#0F172A">{title}</Typography>
      </Box>
      <Box sx={{ px: 3, py: 3 }}>{children}</Box>
    </Box>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────
export function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarAnchor, setAvatarAnchor] = useState<null | HTMLElement>(null);
  const [cameraOpen,   setCameraOpen]   = useState(false);

  // ── Perfil completo ──
  const profileQ = useQuery({
    queryKey: ['profile-me'],
    queryFn: profileApi.getMe,
  });

  // ── Estado email ──
  const [email, setEmail]         = useState('');
  const [emailOk, setEmailOk]     = useState(false);

  useEffect(() => {
    if (profileQ.data) setEmail(profileQ.data.email);
  }, [profileQ.data]);

  const emailMutation = useMutation({
    mutationFn: () => profileApi.update(user!.id, { email: email.trim() }),
    onSuccess: (data) => {
      updateUser({ email: data.email });
      setEmailOk(true);
      qc.invalidateQueries({ queryKey: ['profile-me'] });
      setTimeout(() => setEmailOk(false), 3000);
    },
  });

  // ── Estado contraseña ──
  const [pwActual,   setPwActual]   = useState('');
  const [pwNueva,    setPwNueva]    = useState('');
  const [pwConfirm,  setPwConfirm]  = useState('');
  const [showPw,     setShowPw]     = useState({ actual: false, nueva: false, confirm: false });
  const [pwOk,       setPwOk]       = useState(false);
  const [pwError,    setPwError]    = useState('');

  const pwMutation = useMutation({
    mutationFn: () => profileApi.changePassword(pwActual, pwNueva),
    onSuccess: () => {
      setPwActual(''); setPwNueva(''); setPwConfirm('');
      setPwError('');
      setPwOk(true);
      setTimeout(() => setPwOk(false), 3000);
    },
    onError: (err: any) => {
      const detail = err?.response?.data?.detail;
      setPwError(detail ?? 'Error al cambiar la contraseña');
    },
  });

  const handlePassword = () => {
    setPwError('');
    if (pwNueva !== pwConfirm) { setPwError('Las contraseñas nuevas no coinciden'); return; }
    if (pwNueva.length < 6) { setPwError('La contraseña debe tener al menos 6 caracteres'); return; }
    pwMutation.mutate();
  };

  // ── Foto de perfil ──
  const avatarMutation = useMutation({
    mutationFn: (base64: string | null) => profileApi.update(user!.id, { avatar_url: base64 }),
    onSuccess: (data) => {
      updateUser({ avatar_url: data.avatar_url ?? '' });
      qc.invalidateQueries({ queryKey: ['profile-me'] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => avatarMutation.mutate(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeleteAvatar = () => {
    setAvatarAnchor(null);
    avatarMutation.mutate(null);
  };

  const avatarSrc = user?.avatar_url || profileQ.data?.avatar_url || undefined;
  const initials  = user ? `${user.nombre[0]}${user.apellido[0]}`.toUpperCase() : '';
  const fullName  = user ? `${user.nombre} ${user.apellido}` : '';
  const rol       = roleLabel[user?.rol ?? ''] ?? '';

  return (
    <Box display="flex" flexDirection="column" gap={3} maxWidth={600}>

      {/* ── Encabezado con avatar ── */}
      <Box sx={{
        bgcolor: 'white', borderRadius: 2,
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        px: 3, py: 3,
        display: 'flex', alignItems: 'center', gap: 3,
      }}>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <Avatar
            src={avatarSrc}
            sx={{
              width: 72, height: 72,
              bgcolor: '#0F172A',
              fontSize: 22, fontWeight: 700, letterSpacing: '0.5px',
            }}
          >
            {!avatarSrc && initials}
          </Avatar>
          <IconButton
            size="small"
            onClick={e => setAvatarAnchor(e.currentTarget)}
            disabled={avatarMutation.isPending}
            sx={{
              position: 'absolute', bottom: -4, right: -4,
              bgcolor: 'white', border: '1.5px solid #E2E8F0',
              width: 28, height: 28,
              '&:hover': { bgcolor: '#F8FAFC' },
            }}
          >
            {avatarMutation.isPending
              ? <CircularProgress size={14} />
              : <CameraAlt sx={{ fontSize: 15, color: '#64748B' }} />
            }
          </IconButton>

          {/* Input oculto para subir */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {/* Menú de opciones */}
          <Menu
            anchorEl={avatarAnchor}
            open={Boolean(avatarAnchor)}
            onClose={() => setAvatarAnchor(null)}
            transformOrigin={{ horizontal: 'left', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            slotProps={{
              paper: {
                sx: {
                  mt: 1, minWidth: 190, borderRadius: 2,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                },
              },
            }}
          >
            <MenuItem
              onClick={() => { setAvatarAnchor(null); fileInputRef.current?.click(); }}
              sx={{ fontSize: 13.5, py: 1.25, px: 2, gap: 1.5 }}
            >
              <ListItemIcon sx={{ minWidth: 0 }}>
                <UploadFile fontSize="small" sx={{ color: '#64748B' }} />
              </ListItemIcon>
              Subir foto
            </MenuItem>
            <MenuItem
              onClick={() => { setAvatarAnchor(null); setCameraOpen(true); }}
              sx={{ fontSize: 13.5, py: 1.25, px: 2, gap: 1.5 }}
            >
              <ListItemIcon sx={{ minWidth: 0 }}>
                <PhotoCamera fontSize="small" sx={{ color: '#64748B' }} />
              </ListItemIcon>
              Tomar foto
            </MenuItem>
            {avatarSrc && (
              <MenuItem
                onClick={handleDeleteAvatar}
                sx={{ fontSize: 13.5, py: 1.25, px: 2, gap: 1.5, color: '#DC2626' }}
              >
                <ListItemIcon sx={{ minWidth: 0 }}>
                  <DeleteOutline fontSize="small" sx={{ color: '#DC2626' }} />
                </ListItemIcon>
                Eliminar foto
              </MenuItem>
            )}
          </Menu>
        </Box>

        <Box>
          <Typography fontWeight={700} fontSize={17} color="#0F172A" lineHeight={1.3}>
            {fullName}
          </Typography>
          {profileQ.data && (
            <Typography fontSize={13} color="#64748B" mt={0.3}>
              {profileQ.data.tipo_documento.toUpperCase()} · {profileQ.data.n_documento}
            </Typography>
          )}
          <Typography fontSize={13} color="#94A3B8" mt={0.2}>{rol}</Typography>
        </Box>
      </Box>

      {/* ── Cambiar correo ── */}
      <SectionCard title="Correo electrónico">
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Correo electrónico"
            size="small"
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setEmailOk(false); }}
            InputProps={{ sx: { fontSize: 13.5 } }}
            InputLabelProps={{ sx: { fontSize: 13.5 } }}
          />
          {emailMutation.isError && (
            <Alert severity="error" sx={{ fontSize: 13, py: 0.5 }}>
              {(emailMutation.error as any)?.response?.data?.detail ?? 'Error al actualizar el correo'}
            </Alert>
          )}
          {emailOk && (
            <Alert severity="success" icon={<CheckCircle fontSize="small" />} sx={{ fontSize: 13, py: 0.5 }}>
              Correo actualizado correctamente
            </Alert>
          )}
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              size="small"
              disabled={
                !email.trim() ||
                email.trim() === (profileQ.data?.email ?? '') ||
                emailMutation.isPending
              }
              onClick={() => emailMutation.mutate()}
              sx={{
                bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600,
                fontSize: 13.5, boxShadow: 'none', px: 2.5,
                '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' },
              }}
            >
              {emailMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </Box>
        </Box>
      </SectionCard>

      {/* ── Cambiar contraseña ── */}
      <SectionCard title="Cambiar contraseña">
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Contraseña actual"
            size="small"
            type={showPw.actual ? 'text' : 'password'}
            value={pwActual}
            onChange={e => setPwActual(e.target.value)}
            InputProps={{
              sx: { fontSize: 13.5 },
              endAdornment: (
                <IconButton size="small" onClick={() => setShowPw(s => ({ ...s, actual: !s.actual }))}>
                  {showPw.actual ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              ),
            }}
            InputLabelProps={{ sx: { fontSize: 13.5 } }}
          />
          <Divider sx={{ borderColor: '#F1F5F9' }} />
          <TextField
            label="Nueva contraseña"
            size="small"
            type={showPw.nueva ? 'text' : 'password'}
            value={pwNueva}
            onChange={e => setPwNueva(e.target.value)}
            InputProps={{
              sx: { fontSize: 13.5 },
              endAdornment: (
                <IconButton size="small" onClick={() => setShowPw(s => ({ ...s, nueva: !s.nueva }))}>
                  {showPw.nueva ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              ),
            }}
            InputLabelProps={{ sx: { fontSize: 13.5 } }}
          />
          <TextField
            label="Confirmar nueva contraseña"
            size="small"
            type={showPw.confirm ? 'text' : 'password'}
            value={pwConfirm}
            onChange={e => setPwConfirm(e.target.value)}
            InputProps={{
              sx: { fontSize: 13.5 },
              endAdornment: (
                <IconButton size="small" onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}>
                  {showPw.confirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              ),
            }}
            InputLabelProps={{ sx: { fontSize: 13.5 } }}
          />
          {pwError && (
            <Alert severity="error" sx={{ fontSize: 13, py: 0.5 }}>{pwError}</Alert>
          )}
          {pwOk && (
            <Alert severity="success" icon={<CheckCircle fontSize="small" />} sx={{ fontSize: 13, py: 0.5 }}>
              Contraseña actualizada correctamente
            </Alert>
          )}
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              size="small"
              disabled={!pwActual || !pwNueva || !pwConfirm || pwMutation.isPending}
              onClick={handlePassword}
              sx={{
                bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600,
                fontSize: 13.5, boxShadow: 'none', px: 2.5,
                '&:hover': { bgcolor: '#1D4ED8', boxShadow: 'none' },
              }}
            >
              {pwMutation.isPending ? 'Guardando...' : 'Cambiar contraseña'}
            </Button>
          </Box>
        </Box>
      </SectionCard>

      <CameraDialog
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={base64 => avatarMutation.mutate(base64)}
      />

    </Box>
  );
}
