import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:habitare/core/network/api_client.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/core/utils/formatters.dart';
import 'package:habitare/features/notifications/presentation/providers/notifications_provider.dart';

void showNotificationsModal(BuildContext context, WidgetRef ref) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    isDismissible: true,
    enableDrag: true,
    backgroundColor: Colors.transparent,
    barrierColor: Colors.black54,
    builder: (ctx) => GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () => Navigator.of(ctx).pop(),
      child: _NotificationsSheet(ref: ref),
    ),
  );
}

class _NotificationsSheet extends ConsumerWidget {
  const _NotificationsSheet({required this.ref});
  final WidgetRef ref;

  @override
  Widget build(BuildContext context, WidgetRef watchRef) {
    final notifsAsync = watchRef.watch(notificationsProvider);

    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      minChildSize: 0.4,
      maxChildSize: 0.92,
      builder: (_, controller) => GestureDetector(
        onTap: () {}, // absorbe toques sobre el sheet
        child: Container(
        decoration: const BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            // ── Handle ────────────────────────────────────────────────────
            const SizedBox(height: 10),
            Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.gray300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 16),

            // ── Header ────────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Notificaciones', style: AppTextStyles.heading2),
                  notifsAsync.valueOrNull?.any((n) => !n.leida) == true
                      ? TextButton(
                          onPressed: () => _markAllRead(context, watchRef),
                          child: Text(
                            'Marcar todo como leído',
                            style: AppTextStyles.small
                                .copyWith(color: AppColors.primary),
                          ),
                        )
                      : const SizedBox.shrink(),
                ],
              ),
            ),
            const SizedBox(height: 4),
            const Divider(height: 1),

            // ── Lista ─────────────────────────────────────────────────────
            Expanded(
              child: notifsAsync.when(
                loading: () => const Center(
                  child: CircularProgressIndicator(
                      strokeWidth: 2, color: AppColors.primary),
                ),
                error: (_, __) => Center(
                  child: Text('No se pudieron cargar las notificaciones',
                      style: AppTextStyles.body
                          .copyWith(color: AppColors.gray500)),
                ),
                data: (notifs) {
                  if (notifs.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.notifications_none_rounded,
                              size: 48, color: AppColors.gray300),
                          const SizedBox(height: 12),
                          Text('Sin notificaciones',
                              style: AppTextStyles.body
                                  .copyWith(color: AppColors.gray500)),
                        ],
                      ),
                    );
                  }
                  return ListView.separated(
                    controller: controller,
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    itemCount: notifs.length,
                    separatorBuilder: (_, __) =>
                        const Divider(height: 1, indent: 68),
                    itemBuilder: (ctx, i) {
                      final notif = notifs[i];
                      return Dismissible(
                        key: ValueKey(notif.id),
                        // ── Derecha → marcar leída ────────────────────────
                        background: Container(
                          color: AppColors.successBtn,
                          alignment: Alignment.centerLeft,
                          padding: const EdgeInsets.only(left: 24),
                          child: const Row(
                            children: [
                              Icon(Icons.done_rounded,
                                  color: AppColors.white, size: 22),
                              SizedBox(width: 8),
                              Text('Leído',
                                  style: TextStyle(
                                      color: AppColors.white,
                                      fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ),
                        // ── Izquierda → eliminar ──────────────────────────
                        secondaryBackground: Container(
                          color: AppColors.dangerText,
                          alignment: Alignment.centerRight,
                          padding: const EdgeInsets.only(right: 24),
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              Text('Eliminar',
                                  style: TextStyle(
                                      color: AppColors.white,
                                      fontWeight: FontWeight.w600)),
                              SizedBox(width: 8),
                              Icon(Icons.delete_outline_rounded,
                                  color: AppColors.white, size: 22),
                            ],
                          ),
                        ),
                        confirmDismiss: (direction) async {
                          if (direction == DismissDirection.startToEnd) {
                            // Marcar como leída (solo si no lo está)
                            if (!notif.leida) {
                              try {
                                await ApiClient.instance
                                    .post('/notifications/${notif.id}/read');
                                watchRef.invalidate(notificationsProvider);
                              } on DioException {
                                // silencioso
                              }
                            }
                            return false; // no remover del árbol, solo refrescar
                          } else {
                            // Eliminar
                            try {
                              await ApiClient.instance
                                  .delete('/notifications/${notif.id}');
                              watchRef.invalidate(notificationsProvider);
                            } on DioException {
                              // silencioso
                            }
                            return false;
                          }
                        },
                        child: _NotifTile(
                          notif: notif,
                          onTap: () =>
                              _onTapNotif(context, watchRef, notif),
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
        ), // GestureDetector (absorbe toques del sheet)
      ),
    );
  }

  Future<void> _markAllRead(BuildContext context, WidgetRef ref) async {
    try {
      await ApiClient.instance.post('/notifications/read-all');
      ref.invalidate(notificationsProvider);
    } on DioException {
      // silencioso
    }
  }

  Future<void> _onTapNotif(
      BuildContext context, WidgetRef ref, NotificationModel notif) async {
    // Marcar como leída si no lo está
    if (!notif.leida) {
      try {
        await ApiClient.instance.post('/notifications/${notif.id}/read');
        ref.invalidate(notificationsProvider);
      } on DioException {
        // silencioso
      }
    }

    if (!context.mounted) return;

    // Navegar según entidad
    final id = notif.entidadId;
    switch (notif.entidadTipo) {
      case 'pqrs':
        if (id != null) {
          Navigator.of(context).pop();
          context.push('/pqrs/$id');
        }
      case 'comunicado':
        if (id != null) {
          Navigator.of(context).pop();
          context.push('/communications/$id');
        }
      case 'paquete':
        Navigator.of(context).pop();
        context.push('/packages');
      default:
        break;
    }
  }
}

class _NotifTile extends StatelessWidget {
  const _NotifTile({required this.notif, required this.onTap});
  final NotificationModel notif;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final (iconData, iconColor, iconBg) = _iconForTipo(notif.tipo);

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icono
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: iconBg,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(iconData, size: 20, color: iconColor),
            ),
            const SizedBox(width: 12),

            // Contenido
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          notif.titulo,
                          style: notif.leida
                              ? AppTextStyles.bodyRegular
                              : AppTextStyles.bodyMedium,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (!notif.leida)
                        Container(
                          width: 8,
                          height: 8,
                          margin: const EdgeInsets.only(left: 6, top: 4),
                          decoration: const BoxDecoration(
                            color: AppColors.primary,
                            shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    notif.mensaje,
                    style: AppTextStyles.small
                        .copyWith(color: AppColors.gray500),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    formatDateShort(notif.createdAt),
                    style: AppTextStyles.badge
                        .copyWith(color: AppColors.gray400),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  (IconData, Color, Color) _iconForTipo(String tipo) {
    switch (tipo) {
      case 'urgente':
        return (
          Icons.priority_high_rounded,
          AppColors.dangerText,
          AppColors.dangerBg
        );
      case 'alerta':
        return (
          Icons.warning_amber_rounded,
          AppColors.attentionBtn,
          const Color(0xFFFFF7ED)
        );
      case 'sistema':
        return (
          Icons.settings_outlined,
          AppColors.gray500,
          AppColors.gray100
        );
      default: // info
        return (
          Icons.info_outline_rounded,
          AppColors.infoText,
          AppColors.infoBg
        );
    }
  }
}
