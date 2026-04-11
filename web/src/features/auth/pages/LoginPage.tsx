import { useState } from 'react';
import {
  Box,
  Button,
  InputBase,
  Typography,
  CircularProgress,
  Link,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, ErrorOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/core/auth/authStore';
import { authApi } from '../api/authApi';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: 12, fontWeight: 600, color: '#64748B',
        textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.75,
      }}
    >
      {children}
    </Typography>
  );
}

function StyledInput(props: React.ComponentProps<typeof InputBase>) {
  return (
    <InputBase
      {...props}
      sx={{
        border: '1px solid #E2E8F0',
        borderRadius: '6px',
        px: 1.75,
        py: 1.15,
        fontSize: 14,
        width: '100%',
        bgcolor: '#F8FAFC',
        color: '#0F172A',
        transition: 'all 0.15s ease',
        '&:hover': { borderColor: '#CBD5E1', bgcolor: 'white' },
        '&.Mui-focused': {
          borderColor: '#2563EB',
          bgcolor: 'white',
          boxShadow: '0 0 0 3px rgba(37,99,235,0.10)',
        },
        '& input::placeholder': { color: '#94A3B8', opacity: 1 },
        ...props.sx,
      }}
    />
  );
}

export function LoginPage() {
  const navigate  = useNavigate();
  const setAuth   = useAuthStore((s) => s.setAuth);
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const tokens = await authApi.login(email, password);
      useAuthStore.setState({ accessToken: tokens.access_token });
      const user = await authApi.getMe();
      setAuth(user, tokens.access_token);

      if (user.rol === 'superadmin')       navigate('/superadmin');
      else if (user.rol === 'administracion') navigate('/admin');
      else if (user.rol === 'recepcion')   navigate('/recepcion');
      else {
        useAuthStore.getState().logout();
        setError('Este portal es solo para personal administrativo. Usa la app móvil.');
      }
    } catch {
      setError('Credenciales incorrectas. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: '#0F172A',
      }}
    >
      {/* Left panel — branding */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: 420,
          flexShrink: 0,
          p: '48px 52px',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo + name */}
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box component="img" src="/logo.png" alt="Habitare" sx={{ height: 30, width: 'auto' }} />
          <Typography fontWeight={700} fontSize={17} color="white" letterSpacing="-0.3px">
            Habitare
          </Typography>
        </Box>

        {/* Center copy */}
        <Box>
          <Typography
            sx={{
              fontSize: 30, fontWeight: 800, color: 'white',
              lineHeight: 1.2, letterSpacing: '-0.5px', mb: 2,
            }}
          >
            Gestión residencial<br />inteligente
          </Typography>
          <Typography sx={{ fontSize: 14, color: '#64748B', lineHeight: 1.6 }}>
            Administra visitantes, parqueaderos,<br />
            correspondencia y mucho más desde<br />
            un solo lugar.
          </Typography>
        </Box>

        {/* Footer */}
        <Typography sx={{ fontSize: 12, color: '#334155' }}>
          © 2026 Habitare
        </Typography>
      </Box>

      {/* Right panel — form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#F1F5F9',
          p: { xs: 3, md: 6 },
        }}
      >
        {/* Mobile logo */}
        <Box
          sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 5 }}
        >
          <Box component="img" src="/logo.png" alt="Habitare" sx={{ height: 28 }} />
          <Typography fontWeight={700} fontSize={16} color="#0F172A">Habitare</Typography>
        </Box>

        <Box sx={{ width: '100%', maxWidth: 380 }}>
          <Typography
            sx={{ fontSize: 22, fontWeight: 800, color: '#0F172A', mb: 0.5, letterSpacing: '-0.3px' }}
          >
            Iniciar sesión
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: '#64748B', mb: 4 }}>
            Ingresa tus credenciales para continuar
          </Typography>

          {/* Error */}
          {error && (
            <Box
              sx={{
                display: 'flex', alignItems: 'flex-start', gap: 1.25,
                p: '12px 14px', borderRadius: 1.5, mb: 3,
                bgcolor: '#FEF2F2', border: '1px solid #FECACA',
              }}
            >
              <ErrorOutline sx={{ fontSize: 16, color: '#DC2626', mt: '1px', flexShrink: 0 }} />
              <Typography sx={{ fontSize: 13, color: '#B91C1C', lineHeight: 1.5 }}>{error}</Typography>
            </Box>
          )}

          <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={0}>
            {/* Email */}
            <Box mb={2.5}>
              <FieldLabel>Correo electrónico</FieldLabel>
              <StyledInput
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </Box>

            {/* Password */}
            <Box mb={1.5}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.75}>
                <FieldLabel>Contraseña</FieldLabel>
                <Link
                  href="#"
                  underline="none"
                  sx={{
                    fontSize: 12, fontWeight: 600, color: '#2563EB',
                    '&:hover': { color: '#1d4ed8' },
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </Box>
              <StyledInput
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                endAdornment={
                  <IconButton
                    onClick={() => setShowPassword((v) => !v)}
                    edge="end"
                    size="small"
                    tabIndex={-1}
                    sx={{ mr: -0.5, color: '#94A3B8', '&:hover': { color: '#64748B' } }}
                  >
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                }
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{
                mt: 2,
                py: 1.35,
                fontSize: 14,
                fontWeight: 700,
                borderRadius: '6px',
                bgcolor: '#0F172A',
                letterSpacing: '0.02em',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' },
                '&:disabled': { bgcolor: '#CBD5E1', color: 'white' },
              }}
            >
              {loading ? <CircularProgress size={18} sx={{ color: 'rgba(255,255,255,0.6)' }} /> : 'Iniciar sesión'}
            </Button>
          </Box>

          <Typography sx={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', mt: 4 }}>
            ¿Necesitas ayuda?{' '}
            <Link
              href="#"
              underline="none"
              sx={{ color: '#64748B', fontWeight: 600, '&:hover': { color: '#0F172A' } }}
            >
              Contáctanos
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
