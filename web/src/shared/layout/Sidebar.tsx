import {
  Box, Drawer, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Tooltip, IconButton, Typography,
} from '@mui/material';
import {
  Dashboard, ReportProblem, People, LocalParking, Pool,
  Inventory, Home, Group, Receipt,
  Campaign, Forum, Business, Logout, ChevronLeft, ChevronRight,
  EngineeringOutlined, LocalShipping, CalendarMonth,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/core/auth/authStore';

interface NavItem { label: string; icon: React.ReactNode; path: string; }

const recepcionNav: NavItem[] = [
  { label: 'Dashboard',          icon: <Dashboard />,    path: '/recepcion/dashboard' },
  { label: 'Novedades',          icon: <ReportProblem />, path: '/recepcion/reportes' },
  { label: 'Visitantes',         icon: <People />,       path: '/recepcion/visitantes' },
  { label: 'Parqueaderos',       icon: <LocalParking />, path: '/recepcion/parqueadero' },
  { label: 'Zonas Comunes',      icon: <Pool />,         path: '/recepcion/zonas-comunes' },
  { label: 'Correspondencia',    icon: <Inventory />,    path: '/recepcion/paquetes' },
  { label: 'Servicios Externos', icon: <EngineeringOutlined />, path: '/recepcion/servicios-externos' },
  { label: 'Trasteos',           icon: <LocalShipping />,       path: '/recepcion/trasteos' },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard',      icon: <Dashboard />,    path: '/admin/dashboard' },
  { label: 'Residentes',     icon: <People />,       path: '/admin/residentes' },
  { label: 'Unidades',       icon: <Home />,         path: '/admin/unidades' },
  { label: 'Usuarios',       icon: <Group />,        path: '/admin/usuarios' },
  { label: 'Zonas Comunes',  icon: <Pool />,          path: '/admin/zonas-comunes' },
  { label: 'Parqueaderos',   icon: <LocalParking />,  path: '/admin/parqueaderos' },
  { label: 'Facturación',    icon: <Receipt />,       path: '/admin/facturacion' },
  { label: 'Comunicaciones', icon: <Campaign />,     path: '/admin/comunicaciones' },
  { label: 'PQRS',              icon: <Forum />,              path: '/admin/pqrs' },
  { label: 'Servicios Externos', icon: <EngineeringOutlined />, path: '/admin/servicios-externos' },
  { label: 'Trasteos',           icon: <LocalShipping />,       path: '/admin/trasteos' },
  { label: 'Citas',              icon: <CalendarMonth />,        path: '/admin/citas' },
];

const superadminNav: NavItem[] = [
  { label: 'Conjuntos', icon: <Business />, path: '/superadmin/conjuntos' },
];

const navByRole = { recepcion: recepcionNav, admin: adminNav, superadmin: superadminNav };

interface SidebarProps {
  role: 'recepcion' | 'admin' | 'superadmin';
  width: number;
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ role, width, collapsed, onToggle }: SidebarProps) {
  const navigate  = useNavigate();
  const { pathname } = useLocation();
  const logout    = useAuthStore((s) => s.logout);
  const items     = navByRole[role];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          border: 'none',
          bgcolor: '#0F172A',
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
          transition: 'width 0.25s ease',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: collapsed ? 0 : 2.5,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {collapsed ? (
          <Box component="img" src="/logo.png" alt="H" sx={{ height: 26 }} />
        ) : (
          <>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box component="img" src="/logo.png" alt="H" sx={{ height: 28 }} />
              <Typography fontWeight={700} fontSize={15} color="white" letterSpacing="-0.2px">
                Habitare
              </Typography>
            </Box>
            <IconButton size="small" onClick={onToggle}
              sx={{ color: '#475569', '&:hover': { color: '#94A3B8', bgcolor: 'rgba(255,255,255,0.05)' } }}>
              <ChevronLeft fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>

      {/* Expand button when collapsed */}
      {collapsed && (
        <Box display="flex" justifyContent="center" pt={1.5} pb={0.5}>
          <IconButton size="small" onClick={onToggle}
            sx={{ color: '#475569', '&:hover': { color: '#94A3B8', bgcolor: 'rgba(255,255,255,0.05)' } }}>
            <ChevronRight fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* Nav */}
      <List sx={{ px: 1.5, pt: 1.5, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
        {items.map((item) => {
          const active = pathname.startsWith(item.path);
          const btn = (
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 1.5,
                px: collapsed ? 1.25 : 1.5,
                py: 0.875,
                justifyContent: collapsed ? 'center' : 'flex-start',
                position: 'relative',
                bgcolor: active ? 'rgba(37,99,235,0.15)' : 'transparent',
                color: active ? '#60A5FA' : '#64748B',
                borderLeft: active ? '2px solid #2563EB' : '2px solid transparent',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.04)',
                  color: '#CBD5E1',
                },
                transition: 'all 0.15s ease',
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: collapsed ? 0 : 32, '& svg': { fontSize: 18 } }}>
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: 13, fontWeight: active ? 600 : 400, color: 'inherit' }}
                />
              )}
            </ListItemButton>
          );

          return (
            <ListItem key={item.path} disablePadding>
              {collapsed
                ? <Tooltip title={item.label} placement="right" arrow>{btn}</Tooltip>
                : btn}
            </ListItem>
          );
        })}
      </List>

      {/* Logout */}
      <Box sx={{ mx: 2, height: '1px', bgcolor: 'rgba(255,255,255,0.06)' }} />
      <List sx={{ px: 1.5, py: 1.5 }}>
        <ListItem disablePadding>
          {collapsed ? (
            <Tooltip title="Cerrar sesión" placement="right" arrow>
              <ListItemButton onClick={handleLogout}
                sx={{
                  borderRadius: 1.5, justifyContent: 'center', py: 0.875,
                  color: '#475569',
                  '&:hover': { bgcolor: 'rgba(239,68,68,0.1)', color: '#F87171' },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 0, '& svg': { fontSize: 18 } }}>
                  <Logout />
                </ListItemIcon>
              </ListItemButton>
            </Tooltip>
          ) : (
            <ListItemButton onClick={handleLogout}
              sx={{
                borderRadius: 1.5, px: 1.5, py: 0.875,
                color: '#475569',
                '&:hover': { bgcolor: 'rgba(239,68,68,0.1)', color: '#F87171' },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 32, '& svg': { fontSize: 18 } }}>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Cerrar sesión" primaryTypographyProps={{ fontSize: 13 }} />
            </ListItemButton>
          )}
        </ListItem>
      </List>
    </Drawer>
  );
}
