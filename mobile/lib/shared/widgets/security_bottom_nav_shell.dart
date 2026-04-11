import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/features/communications/presentation/providers/communications_provider.dart';
import 'package:habitare/features/notifications/presentation/providers/notifications_provider.dart';
import 'package:habitare/features/security/presentation/providers/security_providers.dart';

class SecurityBottomNavShell extends ConsumerStatefulWidget {
  const SecurityBottomNavShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  ConsumerState<SecurityBottomNavShell> createState() =>
      _SecurityBottomNavShellState();
}

class _SecurityBottomNavShellState
    extends ConsumerState<SecurityBottomNavShell> {

  void _invalidateTab(int index) {
    switch (index) {
      case 0: // Reportes
        ref.invalidate(securityIncidentsProvider);
        ref.invalidate(securityTiposProvider);
        break;
      case 1: // Visitantes
        ref.invalidate(securityVisitorsProvider);
        break;
      case 2: // Dashboard
        ref.invalidate(communicationsProvider);
        ref.invalidate(notificationsProvider);
        break;
      case 3: // Zonas / Parqueadero
        ref.invalidate(securityReservasProvider);
        ref.invalidate(visitorParkingProvider);
        break;
      case 4: // Comunicados
        ref.invalidate(communicationsProvider);
        break;
    }
  }

  void _onTap(int index) {
    _invalidateTab(index);
    widget.navigationShell.goBranch(
      index,
      initialLocation: index == widget.navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context) {
    final currentIndex = widget.navigationShell.currentIndex;

    return Scaffold(
      body: widget.navigationShell,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: AppColors.white,
          boxShadow: [
            BoxShadow(
              color: Color(0x1A000000),
              blurRadius: 8,
              offset: Offset(0, -2),
            ),
          ],
        ),
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: 64,
            child: Row(
              children: [
                _NavItem(
                  icon: Icons.flag_outlined,
                  activeIcon: Icons.flag_rounded,
                  label: 'Reportes',
                  index: 0,
                  currentIndex: currentIndex,
                  onTap: _onTap,
                ),
                _NavItem(
                  icon: Icons.people_outline_rounded,
                  activeIcon: Icons.people_rounded,
                  label: 'Visitantes',
                  index: 1,
                  currentIndex: currentIndex,
                  onTap: _onTap,
                ),
                _NavItem(
                  icon: Icons.home_outlined,
                  activeIcon: Icons.home_rounded,
                  label: 'Inicio',
                  index: 2,
                  currentIndex: currentIndex,
                  onTap: _onTap,
                ),
                _NavItem(
                  icon: Icons.meeting_room_outlined,
                  activeIcon: Icons.meeting_room_rounded,
                  label: 'Zonas',
                  index: 3,
                  currentIndex: currentIndex,
                  onTap: _onTap,
                ),
                _NavItem(
                  icon: Icons.campaign_outlined,
                  activeIcon: Icons.campaign_rounded,
                  label: 'Comunicados',
                  index: 4,
                  currentIndex: currentIndex,
                  onTap: _onTap,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.index,
    required this.currentIndex,
    required this.onTap,
  });

  final IconData icon;
  final IconData activeIcon;
  final String label;
  final int index;
  final int currentIndex;
  final void Function(int) onTap;

  @override
  Widget build(BuildContext context) {
    final isActive = index == currentIndex;
    final color = isActive ? AppColors.navActive : AppColors.navInactive;

    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => onTap(index),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(isActive ? activeIcon : icon, size: 24, color: color),
            const SizedBox(height: 4),
            Text(
              label,
              style: AppTextStyles.badge.copyWith(
                color: color,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
