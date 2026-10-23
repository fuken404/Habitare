import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:habitare/features/auth/presentation/providers/auth_provider.dart';
import 'package:habitare/features/auth/presentation/screens/forgot_password_screen.dart';
import 'package:habitare/features/auth/presentation/screens/login_screen.dart';
import 'package:habitare/features/billing/presentation/screens/billing_screen.dart';
import 'package:habitare/features/common_areas/presentation/screens/reserve_area_screen.dart';
import 'package:habitare/features/common_areas/presentation/screens/reserve_success_screen.dart';
import 'package:habitare/features/common_areas/presentation/screens/reserved_areas_screen.dart';
import 'package:habitare/features/communications/presentation/screens/communication_detail_screen.dart';
import 'package:habitare/features/communications/presentation/screens/communications_screen.dart';
import 'package:habitare/features/dashboard/presentation/screens/dashboard_screen.dart';
import 'package:habitare/features/incidents/presentation/screens/incident_success_screen.dart';
import 'package:habitare/features/incidents/presentation/screens/report_incident_screen.dart';
import 'package:habitare/features/packages/presentation/screens/packages_screen.dart';
import 'package:habitare/features/parking/presentation/screens/parking_raffle_screen.dart';
import 'package:habitare/features/parking/presentation/screens/raffle_confirm_screen.dart';
import 'package:habitare/features/profile/presentation/screens/more_menu_screen.dart';
import 'package:habitare/features/profile/presentation/screens/profile_screen.dart';
import 'package:habitare/features/pqrs/presentation/screens/pqrs_detail_screen.dart';
import 'package:habitare/features/pqrs/presentation/screens/pqrs_form_screen.dart';
import 'package:habitare/features/pqrs/presentation/screens/pqrs_list_screen.dart';
import 'package:habitare/features/pqrs/presentation/screens/pqrs_success_screen.dart';
import 'package:habitare/features/security/domain/security_models.dart';
import 'package:habitare/features/security/presentation/screens/security_common_areas_screen.dart';
import 'package:habitare/features/security/presentation/screens/security_dashboard_screen.dart';
import 'package:habitare/features/security/presentation/screens/security_profile_screen.dart';
import 'package:habitare/features/security/presentation/screens/security_reportes_screen.dart';
import 'package:habitare/features/security/presentation/screens/security_qr_scanner_screen.dart';
import 'package:habitare/features/security/presentation/screens/security_visitor_detail_screen.dart';
import 'package:habitare/features/security/presentation/screens/security_visitors_screen.dart';
import 'package:habitare/features/external_personnel/presentation/screens/external_personnel_screen.dart';
import 'package:habitare/features/appointments/presentation/screens/appointments_screen.dart';
import 'package:habitare/features/visitors/domain/visitor_model.dart';
import 'package:habitare/features/visitors/presentation/screens/create_visit_screen.dart';
import 'package:habitare/features/visitors/presentation/screens/visitor_detail_screen.dart';
import 'package:habitare/features/visitors/presentation/screens/visitors_screen.dart';
import 'package:habitare/shared/widgets/bottom_nav_shell.dart';
import 'package:habitare/shared/widgets/security_bottom_nav_shell.dart';

GoRouter buildRouter(Ref ref) {
  return GoRouter(
    initialLocation: '/dashboard',
    debugLogDiagnostics: true,
    refreshListenable: _AuthListenable(ref),
    redirect: (context, state) {
      final authState = ref.read(authProvider);
      final isAuth = authState.isAuthenticated;
      final isLoading = authState.isLoading;
      if (isLoading) return null;

      const publicRoutes = ['/login', '/forgot-password'];
      if (!isAuth && !publicRoutes.contains(state.matchedLocation)) {
        return '/login';
      }

      if (isAuth) {
        final isSeguridad = authState.user?.rol == 'seguridad';
        final loc = state.matchedLocation;

        // Desde login → redirige según rol
        if (loc == '/login') {
          return isSeguridad ? '/security/dashboard' : '/dashboard';
        }

        // Seguridad aterrizando en rutas de residente (ej: restauración de sesión)
        const residentRoots = [
          '/dashboard', '/visitors', '/billing', '/communications', '/more'
        ];
        if (isSeguridad && residentRoots.contains(loc)) {
          return '/security/dashboard';
        }

        // Residente aterrizando en rutas de seguridad
        if (!isSeguridad && loc.startsWith('/security/')) {
          return '/dashboard';
        }
      }

      return null;
    },
    routes: [
      // ── Auth ──────────────────────────────────────────────────────────────
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/forgot-password',
        name: 'forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),

      // ── Shell residente (bottom nav) ──────────────────────────────────────
      StatefulShellRoute.indexedStack(
        builder: (context, state, shell) =>
            BottomNavShell(navigationShell: shell),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/dashboard',
              name: 'dashboard',
              builder: (c, s) => const DashboardScreen(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/visitors',
              name: 'visitors',
              builder: (c, s) => const VisitorsScreen(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/billing',
              name: 'billing',
              builder: (c, s) => const BillingScreen(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/communications',
              name: 'communications',
              builder: (c, s) => const CommunicationsScreen(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/more',
              name: 'more',
              builder: (c, s) => const MoreMenuScreen(),
            ),
          ]),
        ],
      ),

      // ── Shell seguridad (bottom nav) ──────────────────────────────────────
      StatefulShellRoute.indexedStack(
        builder: (context, state, shell) =>
            SecurityBottomNavShell(navigationShell: shell),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/security/reportes',
              name: 'security-reportes',
              builder: (c, s) => const SecurityReportesScreen(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/security/visitors',
              name: 'security-visitors',
              builder: (c, s) => const SecurityVisitorsScreen(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/security/dashboard',
              name: 'security-dashboard',
              builder: (c, s) => const SecurityDashboardScreen(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/security/common-areas',
              name: 'security-common-areas',
              builder: (c, s) => const SecurityCommonAreasScreen(),
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/security/communications',
              name: 'security-communications',
              builder: (c, s) => const CommunicationsScreen(),
            ),
          ]),
        ],
      ),

      // ── Seguridad (full-screen) ───────────────────────────────────────────
      GoRoute(
        path: '/security/visitors/detail',
        name: 'security-visitor-detail',
        builder: (c, s) => SecurityVisitorDetailScreen(
          visitor: s.extra as SecurityVisitorApiModel,
        ),
      ),
      GoRoute(
        path: '/security/visitors/scan',
        name: 'security-visitor-scan',
        builder: (c, s) => const SecurityQrScannerScreen(),
      ),
      GoRoute(
        path: '/security/profile',
        name: 'security-profile',
        builder: (c, s) => const SecurityProfileScreen(),
      ),

      // ── Visitantes residente (full-screen) ────────────────────────────────
      GoRoute(
        path: '/visitors/create',
        name: 'create-visit',
        builder: (c, s) => const CreateVisitScreen(),
      ),
      GoRoute(
        path: '/visitors/detail',
        name: 'visitor-detail',
        builder: (c, s) => VisitorDetailScreen(
          visitor: s.extra as VisitorModel,
        ),
      ),

      // ── Comunicados (compartido) ──────────────────────────────────────────
      GoRoute(
        path: '/communications/:id',
        name: 'communication-detail',
        builder: (c, s) =>
            CommunicationDetailScreen(id: s.pathParameters['id']!),
      ),

      // ── PQRS ─────────────────────────────────────────────────────────────
      GoRoute(
        path: '/pqrs',
        name: 'pqrs-list',
        builder: (c, s) => const PqrsListScreen(),
      ),
      GoRoute(
        path: '/pqrs/new',
        name: 'pqrs-new',
        builder: (c, s) => const PqrsFormScreen(),
      ),
      GoRoute(
        path: '/pqrs/success',
        name: 'pqrs-success',
        builder: (c, s) =>
            PqrsSuccessScreen(numeroRadicado: s.extra as String?),
      ),
      GoRoute(
        path: '/pqrs/:id',
        name: 'pqrs-detail',
        builder: (c, s) => PqrsDetailScreen(id: s.pathParameters['id']!),
      ),

      // ── Zonas Comunes residente ───────────────────────────────────────────
      GoRoute(
        path: '/common-areas/reserve',
        name: 'reserve-area',
        builder: (c, s) => const ReserveAreaScreen(),
      ),
      GoRoute(
        path: '/common-areas/my-reservations',
        name: 'my-reservations',
        builder: (c, s) => const ReservedAreasScreen(),
      ),
      GoRoute(
        path: '/common-areas/success',
        name: 'reserve-success',
        builder: (c, s) => const ReserveSuccessScreen(),
      ),

      // ── Novedades residente ───────────────────────────────────────────────
      GoRoute(
        path: '/incidents/new',
        name: 'report-incident',
        builder: (c, s) => const ReportIncidentScreen(),
      ),
      GoRoute(
        path: '/incidents/success',
        name: 'incident-success',
        builder: (c, s) =>
            IncidentSuccessScreen(numeroRadicado: s.extra as String?),
      ),

      // ── Servicios Externos ───────────────────────────────────────────────
      GoRoute(
        path: '/external-services',
        name: 'external-services',
        builder: (c, s) => const ExternalPersonnelScreen(),
      ),

      // ── Citas con Administración ─────────────────────────────────────────
      GoRoute(
        path: '/appointments',
        name: 'appointments',
        builder: (c, s) => const AppointmentsScreen(),
      ),

      // ── Paquetes ──────────────────────────────────────────────────────────
      GoRoute(
        path: '/packages',
        name: 'packages',
        builder: (c, s) => const PackagesScreen(),
      ),

      // ── Perfil residente ──────────────────────────────────────────────────
      GoRoute(
        path: '/profile',
        name: 'profile',
        builder: (c, s) => const ProfileScreen(),
      ),

      // ── Sorteo Parqueadero ────────────────────────────────────────────────
      GoRoute(
        path: '/parking/raffle',
        name: 'parking-raffle',
        builder: (c, s) => const ParkingRaffleScreen(),
      ),
      GoRoute(
        path: '/parking/raffle/confirm',
        name: 'raffle-confirm',
        builder: (c, s) => const RaffleConfirmScreen(),
      ),
    ],
  );
}

class _AuthListenable extends ChangeNotifier {
  _AuthListenable(Ref ref) {
    ref.listen(authProvider, (_, __) => notifyListeners());
  }
}

final routerProvider = Provider<GoRouter>((ref) => buildRouter(ref));
