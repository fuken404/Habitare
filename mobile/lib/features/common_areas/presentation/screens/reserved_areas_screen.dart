import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:habitare/core/network/api_client.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/core/utils/formatters.dart';
import 'package:habitare/features/common_areas/domain/common_area_model.dart';
import 'package:habitare/features/common_areas/presentation/providers/common_areas_provider.dart';
import 'package:habitare/shared/widgets/async_widget.dart';

class ReservedAreasScreen extends ConsumerWidget {
  const ReservedAreasScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reservasAsync = ref.watch(reservasProvider);
    final areasAsync = ref.watch(commonAreasProvider);

    return Scaffold(
      backgroundColor: AppColors.scaffold,
      appBar: AppBar(
        title: Text('Mis Reservas', style: AppTextStyles.heading2),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, size: 20),
          onPressed: () => context.canPop() ? context.pop() : context.go('/more'),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/common-areas/reserve'),
        backgroundColor: AppColors.successBtn,
        foregroundColor: AppColors.white,
        icon: const Icon(Icons.add),
        label: Text('Nueva reserva',
            style:
                AppTextStyles.bodyMedium.copyWith(color: AppColors.white)),
      ),
      body: AsyncWidget(
        value: reservasAsync,
        data: (reservas) {
          final areasMap = areasAsync.valueOrNull != null
              ? {for (final a in areasAsync.valueOrNull!) a.id: a}
              : <String, CommonAreaModel>{};

          if (reservas.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.event_busy_outlined,
                      size: 48, color: AppColors.gray300),
                  const SizedBox(height: 12),
                  Text('No tienes reservas',
                      style: AppTextStyles.body
                          .copyWith(color: AppColors.gray500)),
                  const SizedBox(height: 4),
                  Text('Toca el botón + para reservar una zona',
                      style: AppTextStyles.small
                          .copyWith(color: AppColors.gray400)),
                ],
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
            itemCount: reservas.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (_, i) => _ReservationCard(
              reserva: reservas[i],
              areaName: areasMap[reservas[i].zonaComunId]?.nombre,
            ),
          );
        },
      ),
    );
  }
}

class _ReservationCard extends ConsumerStatefulWidget {
  const _ReservationCard({required this.reserva, this.areaName});
  final ReservaModel reserva;
  final String? areaName;

  @override
  ConsumerState<_ReservationCard> createState() => _ReservationCardState();
}

class _ReservationCardState extends ConsumerState<_ReservationCard> {
  bool _isDeleting = false;

  bool get _canCancel =>
      widget.reserva.estado == 'pendiente' ||
      widget.reserva.estado == 'aprobada' ||
      widget.reserva.estado == 'confirmada';

  Future<void> _cancelar() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Cancelar reserva', style: AppTextStyles.heading3),
        content: Text(
          '¿Estás seguro de que deseas cancelar esta reserva?',
          style: AppTextStyles.body,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: Text('No', style: TextStyle(color: AppColors.gray500)),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: Text('Cancelar reserva',
                style: TextStyle(
                    color: AppColors.dangerText,
                    fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
    if (confirm != true || !mounted) return;

    setState(() => _isDeleting = true);
    try {
      await ApiClient.instance
          .delete('/common-areas/reservas/${widget.reserva.id}');
      ref.invalidate(reservasProvider);
    } on DioException catch (e) {
      if (!mounted) return;
      final data = e.response?.data;
      final msg = data is Map ? (data['detail'] ?? 'Error al cancelar') : 'Error al cancelar';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(msg), backgroundColor: AppColors.dangerText),
      );
    } finally {
      if (mounted) setState(() => _isDeleting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = estadoReservaColors(widget.reserva.estado);
    final label = estadoReservaLabel(widget.reserva.estado);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.gray200),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: const Color(0xFFD1FAE5),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.meeting_room_outlined,
                size: 22, color: AppColors.successBtn),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.areaName ?? 'Zona Común',
                        style: AppTextStyles.bodyMedium,
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.calendar_today_outlined,
                              size: 12, color: AppColors.gray500),
                          const SizedBox(width: 4),
                          Text(formatDate(widget.reserva.fechaReserva),
                              style: AppTextStyles.small
                                  .copyWith(color: AppColors.gray500)),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          const Icon(Icons.access_time_outlined,
                              size: 12, color: AppColors.gray500),
                          const SizedBox(width: 4),
                          Text(
                              '${widget.reserva.horaInicio} - ${widget.reserva.horaFin}',
                              style: AppTextStyles.small
                                  .copyWith(color: AppColors.gray500)),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: colors.bg,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(label,
                          style: AppTextStyles.badge
                              .copyWith(color: colors.color)),
                    ),
                    if (_canCancel) ...[
                      const SizedBox(height: 8),
                      _isDeleting
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: AppColors.dangerText),
                            )
                          : GestureDetector(
                              onTap: _cancelar,
                              child: Icon(
                                Icons.delete_outline_rounded,
                                size: 22,
                                color: AppColors.dangerText.withOpacity(0.5),
                              ),
                            ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
