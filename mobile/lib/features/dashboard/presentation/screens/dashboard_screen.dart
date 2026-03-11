import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/core/utils/formatters.dart';
import 'package:habitare/features/auth/presentation/providers/auth_provider.dart';
import 'package:habitare/features/billing/presentation/providers/billing_provider.dart';
import 'package:habitare/features/communications/presentation/providers/communications_provider.dart';
import 'package:habitare/features/notifications/presentation/providers/notifications_provider.dart';
import 'package:habitare/features/notifications/presentation/widgets/notifications_modal.dart';
import 'package:habitare/features/packages/presentation/providers/packages_provider.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final billingAsync = ref.watch(billingProvider);
    final communicationsAsync = ref.watch(communicationsProvider);
    final packagesAsync = ref.watch(packagesProvider);
    final unreadCount = ref.watch(unreadCountProvider);

    // Compute pending balance
    final unpaid = billingAsync.valueOrNull
            ?.where((f) => f.estado == 'pendiente' || f.estado == 'vencida')
            .toList() ??
        [];
    final totalPending = unpaid.fold<double>(
      0,
      (sum, f) => sum + (double.tryParse(f.montoTotal) ?? 0),
    );
    final earliestDue = unpaid.isNotEmpty
        ? unpaid.reduce((a, b) =>
            a.fechaVencimiento.compareTo(b.fechaVencimiento) <= 0 ? a : b)
        : null;

    // Pending packages count
    final pendingPackages = packagesAsync.valueOrNull
            ?.where((p) => p.estado == 'pendiente')
            .length ??
        0;

    // Most recent communication
    final lastComm = communicationsAsync.valueOrNull?.isNotEmpty == true
        ? communicationsAsync.valueOrNull!.first
        : null;

    return Scaffold(
      backgroundColor: AppColors.scaffold,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Header ────────────────────────────────────────────────────
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
                      if (user?.nombreConjunto != null)
                        Text(
                          user!.nombreConjunto!,
                          style: AppTextStyles.bodyRegular
                              .copyWith(color: AppColors.gray500),
                        ),
                      if (user?.ubicacion != null)
                        Text(
                          user!.ubicacion!,
                          style: AppTextStyles.small
                              .copyWith(color: AppColors.gray400),
                        ),
                    ],
                  ),
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
              const SizedBox(height: 24),

              // ── Balance Card ───────────────────────────────────────────────
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: billingAsync.when(
                  loading: () => const SizedBox(
                    height: 80,
                    child: Center(
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: AppColors.white),
                    ),
                  ),
                  error: (_, __) => Text('No se pudo cargar el saldo',
                      style: AppTextStyles.bodyRegular
                          .copyWith(color: AppColors.white)),
                  data: (_) => Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Saldo Total a Pagar',
                        style: AppTextStyles.bodyRegular
                            .copyWith(color: AppColors.white),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        formatAmount(totalPending.toStringAsFixed(0)),
                        style: AppTextStyles.display
                            .copyWith(color: AppColors.white),
                      ),
                      if (earliestDue != null) ...[
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(Icons.calendar_today_outlined,
                                size: 14, color: AppColors.white),
                            const SizedBox(width: 6),
                            Text(
                              'Vence: ${formatDate(earliestDue.fechaVencimiento)}',
                              style: AppTextStyles.bodyRegular
                                  .copyWith(color: AppColors.white),
                            ),
                          ],
                        ),
                      ],
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () => context.go('/billing'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.white,
                            foregroundColor: AppColors.primary,
                            minimumSize: const Size(double.infinity, 44),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8)),
                            elevation: 0,
                          ),
                          child: Text('Pagar',
                              style: AppTextStyles.bodyLarge
                                  .copyWith(color: AppColors.primary)),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // ── Accesos Rápidos ────────────────────────────────────────────
              Text('Accesos Rápidos', style: AppTextStyles.heading3),
              const SizedBox(height: 12),
              Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: _QuickBtn(
                          icon: Icons.person_add_alt_1_outlined,
                          label: 'Autorizar Visitante',
                          color: AppColors.primary,
                          onTap: () => context.push('/visitors/create'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _QuickBtn(
                          badge: pendingPackages > 0
                              ? '+$pendingPackages'
                              : null,
                          icon: Icons.inventory_2_outlined,
                          label: 'Paquetes en Portería',
                          color: AppColors.attentionBtn,
                          onTap: () => context.push('/packages'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _QuickBtn(
                          icon: Icons.warning_amber_rounded,
                          label: 'Reportar Novedad',
                          color: AppColors.dangerText,
                          onTap: () => context.push('/incidents/new'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _QuickBtn(
                          icon: Icons.event_available_outlined,
                          label: 'Reservar Zona Común',
                          color: AppColors.successBtn,
                          onTap: () =>
                              context.push('/common-areas/reserve'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // ── Último Comunicado ──────────────────────────────────────────
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
                          mainAxisAlignment:
                              MainAxisAlignment.spaceBetween,
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
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
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
    this.icon,
    this.badge,
    required this.label,
    required this.color,
    this.onTap,
  });

  final IconData? icon;
  final String? badge;
  final String label;
  final Color color;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 80,
        padding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.gray200),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            badge != null
                ? Text(badge!,
                    style: AppTextStyles.heading2.copyWith(color: color))
                : Icon(icon, size: 28, color: color),
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
      child: Text(label,
          style: AppTextStyles.badge.copyWith(color: color)),
    );
  }
}
