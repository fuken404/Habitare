import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/features/billing/presentation/providers/billing_provider.dart';
import 'package:habitare/features/communications/presentation/providers/communications_provider.dart';
import 'package:habitare/features/notifications/presentation/providers/notifications_provider.dart';
import 'package:habitare/features/packages/presentation/providers/packages_provider.dart';
import 'package:habitare/features/visitors/presentation/providers/visitors_provider.dart';

class BottomNavShell extends ConsumerStatefulWidget {
  const BottomNavShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  @override
  ConsumerState<BottomNavShell> createState() => _BottomNavShellState();
}

class _BottomNavShellState extends ConsumerState<BottomNavShell> {

  void _invalidateTab(int index) {
    switch (index) {
      case 0: // Dashboard
        ref.invalidate(billingProvider);
        ref.invalidate(communicationsProvider);
        ref.invalidate(packagesProvider);
        ref.invalidate(notificationsProvider);
        break;
      case 1: // Visitantes
        ref.invalidate(visitorsProvider);
        break;
      case 2: // Pagos
        ref.invalidate(billingProvider);
        break;
      case 3: // Comunicados
        ref.invalidate(communicationsProvider);
        ref.invalidate(notificationsProvider);
        break;
      case 4: // Más — nada que invalidar
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
                  icon: Icons.home_outlined,
                  activeIcon: Icons.home_rounded,
                  label: 'Inicio',
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
                  icon: Icons.account_balance_wallet_outlined,
                  activeIcon: Icons.account_balance_wallet_rounded,
                  label: 'Pagos',
                  index: 2,
                  currentIndex: currentIndex,
                  onTap: _onTap,
                ),
                _NavItem(
                  icon: Icons.article_outlined,
                  activeIcon: Icons.article_rounded,
                  label: 'Info',
                  index: 3,
                  currentIndex: currentIndex,
                  onTap: _onTap,
                ),
                _NavItem(
                  icon: Icons.menu_rounded,
                  activeIcon: Icons.menu_rounded,
                  label: 'Más',
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
