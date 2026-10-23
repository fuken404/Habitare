import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/features/auth/presentation/providers/auth_provider.dart';
import 'package:habitare/shared/widgets/profile_avatar.dart';

class _MenuItem {
  const _MenuItem({
    required this.icon,
    required this.label,
    required this.color,
    required this.bg,
    required this.route,
  });
  final IconData icon;
  final String label;
  final Color color;
  final Color bg;
  final String route;
}

const _menuItems = [
  _MenuItem(
    icon: Icons.forum_outlined,
    label: 'PQRS',
    color: AppColors.primary,
    bg: AppColors.info2Bg,
    route: '/pqrs',
  ),
  _MenuItem(
    icon: Icons.event_seat_outlined,
    label: 'Zonas Comunes',
    color: AppColors.successBtn,
    bg: Color(0xFFD1FAE5),
    route: '/common-areas/my-reservations',
  ),
  _MenuItem(
    icon: Icons.local_parking_rounded,
    label: 'Sorteo Parqueadero',
    color: AppColors.purpleText,
    bg: AppColors.purpleBg,
    route: '/parking/raffle',
  ),
  _MenuItem(
    icon: Icons.warning_amber_rounded,
    label: 'Novedades',
    color: AppColors.dangerText,
    bg: AppColors.dangerBg,
    route: '/incidents/new',
  ),
  _MenuItem(
    icon: Icons.engineering_outlined,
    label: 'Servicios Externos',
    color: Color(0xFF0369A1),
    bg: Color(0xFFE0F2FE),
    route: '/external-services',
  ),
  _MenuItem(
    icon: Icons.calendar_month_outlined,
    label: 'Citas Admin',
    color: AppColors.purpleText,
    bg: AppColors.purpleBg,
    route: '/appointments',
  ),
];

class MoreMenuScreen extends ConsumerWidget {
  const MoreMenuScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AppColors.scaffold,
      appBar: AppBar(
        title: Text('Más', style: AppTextStyles.heading2),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Tarjeta de usuario ────────────────────────────────────────
            GestureDetector(
              onTap: () => context.push('/profile'),
              child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.gray200),
              ),
              child: Builder(builder: (context) {
                final user = ref.watch(authProvider).user;
                final initials = user != null
                    ? '${user.nombre.isNotEmpty ? user.nombre[0] : ''}${user.apellido.isNotEmpty ? user.apellido[0] : ''}'
                        .toUpperCase()
                    : '?';
                return Row(
                  children: [
                    ProfileAvatar(initials: initials, size: 56),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(user?.nombreCompleto ?? '—',
                              style: AppTextStyles.bodyMedium),
                          const SizedBox(height: 2),
                          Text(user?.email ?? '',
                              style: AppTextStyles.badge
                                  .copyWith(color: AppColors.gray500)),
                        ],
                      ),
                    ),
                    const Icon(Icons.chevron_right_rounded,
                        color: AppColors.gray400),
                  ],
                );
              }),
            ),
            ),
            const SizedBox(height: 24),

            // ── Opciones ──────────────────────────────────────────────────
            Text('Servicios', style: AppTextStyles.heading3),
            const SizedBox(height: 12),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                childAspectRatio: 1.6,
              ),
              itemCount: _menuItems.length,
              itemBuilder: (context, i) => _MenuCard(item: _menuItems[i]),
            ),
            const SizedBox(height: 24),

            // ── Cerrar sesión ─────────────────────────────────────────────
            GestureDetector(
              onTap: () => _confirmLogout(context, ref),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.gray200),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.logout_rounded,
                        size: 20, color: AppColors.dangerText),
                    const SizedBox(width: 12),
                    Text('Cerrar sesión',
                        style: AppTextStyles.bodyMedium
                            .copyWith(color: AppColors.dangerText)),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _confirmLogout(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cerrar sesión'),
        content: const Text('¿Estás seguro de que quieres cerrar sesión?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              ref.read(authProvider.notifier).logout();
            },
            child: Text('Cerrar sesión',
                style: TextStyle(color: AppColors.dangerText)),
          ),
        ],
      ),
    );
  }
}

class _MenuCard extends StatelessWidget {
  const _MenuCard({required this.item});
  final _MenuItem item;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push(item.route),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.gray200),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: item.bg,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(item.icon, size: 20, color: item.color),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                item.label,
                style: AppTextStyles.bodyMedium.copyWith(color: AppColors.gray900),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
