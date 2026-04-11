import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/core/utils/formatters.dart';
import 'package:habitare/features/auth/presentation/providers/auth_provider.dart';
import 'package:habitare/features/communications/presentation/providers/communications_provider.dart';
import 'package:habitare/features/notifications/presentation/providers/notifications_provider.dart';
import 'package:habitare/features/notifications/presentation/widgets/notifications_modal.dart';

class SecurityDashboardScreen extends ConsumerWidget {
  const SecurityDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final communicationsAsync = ref.watch(communicationsProvider);
    final unreadCount = ref.watch(unreadCountProvider);
    final lastComm = communicationsAsync.valueOrNull?.isNotEmpty == true
        ? communicationsAsync.valueOrNull!.first
        : null;
    final lastCommDetail = lastComm != null
        ? ref.watch(communicationDetailProvider(lastComm.id)).valueOrNull
        : null;

    return Scaffold(
      backgroundColor: AppColors.scaffold,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Header ───────────────────────────────────────────────────
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Hola, ${user?.nombre ?? ''}',
                        style: AppTextStyles.heading1,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        user?.nombreConjunto ?? '',
                        style: AppTextStyles.bodyRegular
                            .copyWith(color: AppColors.gray500),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      GestureDetector(
                        onTap: () => context.push('/security/profile'),
                        child: Container(
                          width: 40,
                          height: 40,
                          decoration: const BoxDecoration(
                            color: AppColors.gray100,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.person_outline_rounded,
                            size: 20,
                            color: AppColors.gray900,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      GestureDetector(
                        onTap: () => showNotificationsModal(context, ref),
                        child: Stack(
                          children: [
                            Container(
                              width: 40,
                              height: 40,
                              decoration: const BoxDecoration(
                                color: AppColors.gray100,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.notifications_outlined,
                                size: 20,
                                color: AppColors.gray900,
                              ),
                            ),
                            if (unreadCount > 0)
                              Positioned(
                                top: 4,
                                right: 4,
                                child: Container(
                                  width: 16,
                                  height: 16,
                                  decoration: const BoxDecoration(
                                    color: AppColors.dangerText,
                                    shape: BoxShape.circle,
                                  ),
                                  child: Center(
                                    child: Text(
                                      unreadCount > 9 ? '9+' : '$unreadCount',
                                      style: const TextStyle(
                                        color: AppColors.white,
                                        fontSize: 9,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // ── Último Comunicado ─────────────────────────────────────────
              Text('Último Comunicado', style: AppTextStyles.heading3),
              const SizedBox(height: 12),
              if (communicationsAsync.isLoading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(16),
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: AppColors.primary),
                  ),
                )
              else if (lastComm != null)
                GestureDetector(
                  onTap: () =>
                      context.push('/communications/${lastComm.id}'),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.gray200),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            _CategoryBadge(
                              label: tipoLabel(lastComm.tipo),
                              color: tipoColors(lastComm.tipo).color,
                              bg: tipoColors(lastComm.tipo).bg,
                            ),
                            Text(
                              formatDateShort(lastComm.fechaPublicacion),
                              style: AppTextStyles.badge
                                  .copyWith(color: AppColors.gray500),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text(
                          lastComm.titulo,
                          style: AppTextStyles.bodySemibold,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (lastCommDetail != null) ...[
                          const SizedBox(height: 8),
                          Text(
                            lastCommDetail.contenido,
                            style: AppTextStyles.bodyRegular
                                .copyWith(color: AppColors.gray500),
                            maxLines: 3,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            Text(
                              'Ver más',
                              style: AppTextStyles.small
                                  .copyWith(color: AppColors.primary),
                            ),
                            const SizedBox(width: 2),
                            const Icon(Icons.arrow_forward_ios_rounded,
                                size: 10, color: AppColors.primary),
                          ],
                        ),
                      ],
                    ),
                  ),
                )
              else
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.gray200),
                  ),
                  child: Text('No hay comunicados recientes',
                      style: AppTextStyles.body
                          .copyWith(color: AppColors.gray500)),
                ),
              const SizedBox(height: 24),

              // ── Accesos Rápidos ───────────────────────────────────────────
              Text('Accesos Rápidos', style: AppTextStyles.heading3),
              const SizedBox(height: 12),
              Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: _QuickBtn(
                          icon: Icons.person_add_alt_1_outlined,
                          label: 'Ingresar Visitante',
                          color: AppColors.primary,
                          onTap: () => context.go('/security/visitors'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _QuickBtn(
                          icon: Icons.flag_outlined,
                          label: 'Crear Reporte',
                          color: AppColors.attentionBtn,
                          onTap: () => context.go('/security/reportes'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _QuickBtn(
                          icon: Icons.meeting_room_outlined,
                          label: 'Zonas Comunes',
                          color: AppColors.successBtn,
                          onTap: () => context.go('/security/common-areas'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _QuickBtn(
                          icon: Icons.campaign_outlined,
                          label: 'Comunicados',
                          color: AppColors.purpleText,
                          onTap: () => context.go('/security/communications'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}

class _QuickBtn extends StatelessWidget {
  const _QuickBtn({
    required this.icon,
    required this.label,
    required this.color,
    this.onTap,
  });

  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 80,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.gray200),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 28, color: color),
            const SizedBox(height: 6),
            Text(
              label,
              style: AppTextStyles.bodyMedium.copyWith(color: color),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

class _CategoryBadge extends StatelessWidget {
  const _CategoryBadge({
    required this.label,
    required this.color,
    required this.bg,
  });
  final String label;
  final Color color;
  final Color bg;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(label, style: AppTextStyles.badge.copyWith(color: color)),
    );
  }
}
