import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Footer } from './Footer';

const SIDEBAR_EXPANDED = 256;
const SIDEBAR_COLLAPSED = 68;

interface AppShellProps {
  role: 'recepcion' | 'admin' | 'superadmin';
}

export function AppShell({ role }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F1F5F9' }}>
      <Sidebar
        role={role}
        width={sidebarWidth}
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
      />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar />
        <Box component="main" sx={{ flex: 1, p: '24px', minWidth: 0 }}>
          <Outlet />
        </Box>
        <Footer />
      </Box>
    </Box>
  );
}
