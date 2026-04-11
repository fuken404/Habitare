import { Box, Typography, Link } from '@mui/material';
import { useAuthStore } from '@/core/auth/authStore';

export function Footer() {
  const { user } = useAuthStore();
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        px: '24px', py: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 1,
        borderTop: '1px solid #E2E8F0',
        bgcolor: '#F1F5F9',
      }}
    >
      <Box display="flex" alignItems="center" gap={0.75}>
        <Typography fontSize={12.5} fontWeight={700} color="#0F172A">Habitare</Typography>
        {user?.nombre_conjunto && (
          <>
            <Typography fontSize={12.5} color="#CBD5E1">·</Typography>
            <Typography fontSize={12.5} color="#64748B">{user.nombre_conjunto}</Typography>
          </>
        )}
      </Box>

      <Box display="flex" alignItems="center" gap={2}>
        <Link href="mailto:soporte@habitare.app" underline="hover"
          sx={{ fontSize: 12.5, color: '#64748B', '&:hover': { color: '#0F172A' } }}>
          Soporte
        </Link>
        <Link href="#" underline="hover"
          sx={{ fontSize: 12.5, color: '#64748B', '&:hover': { color: '#0F172A' } }}>
          Términos de uso
        </Link>
        <Typography fontSize={12.5} color="#94A3B8">
          © {year} Habitare
        </Typography>
      </Box>
    </Box>
  );
}
