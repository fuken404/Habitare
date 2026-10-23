import { useState } from 'react';
import {
  AppBar, Toolbar, Box, Avatar, Typography, Divider,
  Menu, MenuItem, ListItemIcon, ButtonBase,
} from '@mui/material';
import { ManageAccounts, Logout } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/core/auth/authStore';

const routeTitles: Record<string, string> = {
  '/recepcion/dashboard':        'Dashboard',
  '/recepcion/reportes':         'Novedades',
  '/recepcion/visitantes':       'Visitantes',
  '/recepcion/parqueadero':      'Parqueaderos',
  '/recepcion/zonas-comunes':    'Zonas Comunes',
  '/recepcion/paquetes':         'Correspondencia',
  '/recepcion/servicios-externos': 'Servicios Externos',
  '/admin/dashboard':              'Dashboard',
  '/admin/residentes':             'Residentes',
  '/admin/unidades':               'Unidades',
  '/admin/usuarios':               'Usuarios',
  '/admin/zonas-comunes':          'Zonas Comunes',
  '/admin/facturacion':            'Facturación',
  '/admin/comunicaciones':         'Comunicaciones',
  '/admin/pqrs':                   'PQRS',
  '/admin/parqueaderos':           'Parqueaderos',
  '/admin/servicios-externos':     'Servicios Externos',
  '/superadmin/conjuntos':       'Conjuntos Residenciales',
  '/recepcion/perfil':           'Mi Perfil',
  '/admin/perfil':               'Mi Perfil',
  '/superadmin/perfil':          'Mi Perfil',
};

const roleLabel: Record<string, string> = {
  recepcion:      'Recepción',
  administracion: 'Administración',
  superadmin:     'Superadmin',
};

export function TopBar() {
  const { user, logout } = useAuthStore();
  const { pathname }     = useLocation();
  const navigate         = useNavigate();

  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const initials = user ? `${user.nombre[0]}${user.apellido[0]}`.toUpperCase() : '';
  const fullName = user ? `${user.nombre} ${user.apellido}` : '';
  const title    = routeTitles[pathname] ?? '';
  const rol      = roleLabel[user?.rol ?? ''] ?? '';

  const rolePrefix: Record<string, string> = {
    recepcion:      '/recepcion',
    administracion: '/admin',
    superadmin:     '/superadmin',
  };

  const handlePerfil = () => {
    setAnchor(null);
    const prefix = rolePrefix[user?.rol ?? ''] ?? '';
    navigate(`${prefix}/perfil`);
  };

  const handleLogout = () => {
    setAnchor(null);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ bgcolor: 'white', borderBottom: '1px solid #E2E8F0', color: 'text.primary' }}
    >
      <Toolbar sx={{ minHeight: '60px !important', px: '24px !important' }}>
        <Typography variant="h6" fontWeight={700} color="#0F172A" sx={{ flex: 1, letterSpacing: '-0.3px' }}>
          {title}
        </Typography>

        {user?.nombre_conjunto && (
          <Typography
            fontSize={13.5} fontWeight={600} color="#64748B"
            sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
          >
            {user.nombre_conjunto}
          </Typography>
        )}

        <ButtonBase
          onClick={e => setAnchor(e.currentTarget)}
          sx={{ borderRadius: 2, px: 1, py: 0.5, '&:hover': { bgcolor: '#F8FAFC' } }}
          disableRipple={false}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Box textAlign="right">
              <Typography variant="body2" fontWeight={600} color="#0F172A" lineHeight={1.3}>
                {fullName}
              </Typography>
              <Typography variant="caption" color="#64748B" lineHeight={1}>
                {rol}
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ borderColor: '#E2E8F0', my: 1 }} />

            <Avatar
              src={user?.avatar_url ?? undefined}
              sx={{
                width: 34, height: 34,
                bgcolor: '#0F172A',
                fontSize: 12, fontWeight: 700,
                letterSpacing: '0.5px',
              }}
            >
              {initials}
            </Avatar>
          </Box>
        </ButtonBase>

        <Menu
          anchorEl={anchor}
          open={Boolean(anchor)}
          onClose={() => setAnchor(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          slotProps={{
            paper: {
              sx: {
                mt: 1, minWidth: 180, borderRadius: 2,
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              },
            },
          }}
        >
          <MenuItem
            onClick={handlePerfil}
            sx={{ fontSize: 13.5, py: 1.25, px: 2, color: '#0F172A', gap: 1.5 }}
          >
            <ListItemIcon sx={{ minWidth: 0 }}>
              <ManageAccounts fontSize="small" sx={{ color: '#64748B' }} />
            </ListItemIcon>
            Ajustar perfil
          </MenuItem>
          <MenuItem
            onClick={handleLogout}
            sx={{ fontSize: 13.5, py: 1.25, px: 2, color: '#DC2626', gap: 1.5 }}
          >
            <ListItemIcon sx={{ minWidth: 0 }}>
              <Logout fontSize="small" sx={{ color: '#DC2626' }} />
            </ListItemIcon>
            Cerrar sesión
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
