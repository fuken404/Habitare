import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/core/auth/authStore';
import { AppShell } from '@/shared/layout/AppShell';
import type { UserRole } from '@/types/models';

// Auth
import { LoginPage } from '@/features/auth/pages/LoginPage';

// Shared pages
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { VisitorsPage } from '@/features/visitors/pages/VisitorsPage';
import { PackagesPage } from '@/features/packages/pages/PackagesPage';
import { ReportsPage } from '@/features/reports/pages/ReportsPage';
import { ParkingPage } from '@/features/parking/pages/ParkingPage';

// Admin
import { ResidentsPage } from '@/features/residents/pages/ResidentsPage';
import { UnitsPage } from '@/features/units/pages/UnitsPage';
import { UsersPage } from '@/features/users/pages/UsersPage';
import { CommonAreasPage } from '@/features/common-areas/pages/CommonAreasPage';
import { SecurityPage } from '@/features/security/pages/SecurityPage';
import { BillingPage } from '@/features/billing/pages/BillingPage';
import { CommunicationsPage } from '@/features/communications/pages/CommunicationsPage';
import { PqrsPage } from '@/features/pqrs/pages/PqrsPage';

// Superadmin
import { TenantsPage } from '@/features/superadmin/pages/TenantsPage';

// Trasteos
import { TrasteosPage } from '@/features/trasteos/pages/TrasteosPage';

// Citas Admin
import { AppointmentsPage } from '@/features/appointments/pages/AppointmentsPage';

// Profile
import { ProfilePage } from '@/features/profile/pages/ProfilePage';

function RequireAuth({ children, roles }: { children: JSX.Element; roles?: UserRole[] }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.rol)) return <Navigate to="/login" replace />;
  return children;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Recepción */}
        <Route
          path="/recepcion"
          element={
            <RequireAuth roles={['recepcion', 'superadmin']}>
              <AppShell role="recepcion" />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="visitantes" element={<VisitorsPage />} />
          <Route path="paquetes" element={<PackagesPage />} />
          <Route path="parqueadero" element={<ParkingPage />} />
          <Route path="zonas-comunes" element={<CommonAreasPage />} />
          <Route path="reportes" element={<ReportsPage />} />
          <Route path="servicios-externos" element={<SecurityPage />} />
          <Route path="trasteos" element={<TrasteosPage />} />
          <Route path="perfil" element={<ProfilePage />} />
        </Route>

        {/* Administración */}
        <Route
          path="/admin"
          element={
            <RequireAuth roles={['administracion', 'superadmin']}>
              <AppShell role="admin" />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="residentes" element={<ResidentsPage />} />
          <Route path="unidades" element={<UnitsPage />} />
          <Route path="usuarios" element={<UsersPage />} />
          <Route path="zonas-comunes" element={<CommonAreasPage />} />
          <Route path="parqueaderos" element={<ParkingPage />} />
          <Route path="facturacion" element={<BillingPage />} />
          <Route path="comunicaciones" element={<CommunicationsPage />} />
          <Route path="pqrs" element={<PqrsPage />} />
          <Route path="servicios-externos" element={<SecurityPage />} />
          <Route path="trasteos" element={<TrasteosPage />} />
          <Route path="citas" element={<AppointmentsPage />} />
          <Route path="perfil" element={<ProfilePage />} />
        </Route>

        {/* Superadmin */}
        <Route
          path="/superadmin"
          element={
            <RequireAuth roles={['superadmin']}>
              <AppShell role="superadmin" />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="conjuntos" replace />} />
          <Route path="conjuntos" element={<TenantsPage />} />
          <Route path="perfil" element={<ProfilePage />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<RoleRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

function RoleRedirect() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.rol === 'superadmin') return <Navigate to="/superadmin" replace />;
  if (user.rol === 'administracion') return <Navigate to="/admin" replace />;
  if (user.rol === 'recepcion') return <Navigate to="/recepcion" replace />;
  return <Navigate to="/login" replace />;
}
