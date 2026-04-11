import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:habitare/core/network/api_client.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/features/security/domain/security_models.dart';
import 'package:habitare/features/security/presentation/providers/security_providers.dart';

class SecurityCommonAreasScreen extends ConsumerWidget {
  const SecurityCommonAreasScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: AppColors.scaffold,
        appBar: AppBar(
          title: Text('Instalaciones', style: AppTextStyles.heading2),
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(48),
            child: Container(
              color: AppColors.white,
              child: TabBar(
                labelStyle: AppTextStyles.bodyMedium,
                unselectedLabelStyle: AppTextStyles.bodyRegular,
                labelColor: AppColors.primary,
                unselectedLabelColor: AppColors.gray500,
                indicatorColor: AppColors.primary,
                indicatorWeight: 2,
                tabs: const [
                  Tab(text: 'Zonas Comunes'),
                  Tab(text: 'Parqueadero'),
                ],
              ),
            ),
          ),
        ),
        body: const TabBarView(
          children: [
            _ZonasTab(),
            _ParqueaderoTab(),
          ],
        ),
      ),
    );
  }
}

// ── Zonas comunes (reservas) ───────────────────────────────────────────────────

class _ZonasTab extends ConsumerStatefulWidget {
  const _ZonasTab();

  @override
  ConsumerState<_ZonasTab> createState() => _ZonasTabState();
}

class _ZonasTabState extends ConsumerState<_ZonasTab> {
  String _query = '';

  void _showDetail(ReservaApiModel r) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _ReservaDetailSheet(reservation: r),
    );
  }

  List<ReservaApiModel> _filter(List<ReservaApiModel> all) {
    if (_query.isEmpty) return all;
    final q = _query.toLowerCase();
    return all.where((r) {
      return (r.zonaNombre?.toLowerCase().contains(q) ?? false) ||
          (r.nombreTorre?.toLowerCase().contains(q) ?? false) ||
          (r.numeroUnidad?.toLowerCase().contains(q) ?? false) ||
          (r.nombreResidente?.toLowerCase().contains(q) ?? false);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(securityReservasProvider);

    return async.when(
      loading: () => const Center(
        child: CircularProgressIndicator(
            strokeWidth: 2, color: AppColors.primary),
      ),
      error: (e, _) => _ErrorState(
        message: 'No se pudieron cargar las reservas',
        onRetry: () => ref.invalidate(securityReservasProvider),
      ),
      data: (reservas) {
        final filtered = _filter(reservas);
        return Column(
          children: [
            // ── Buscador ───────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
              child: TextField(
                onChanged: (v) => setState(() => _query = v),
                style: AppTextStyles.bodyRegular,
                decoration: InputDecoration(
                  hintText: 'Buscar por zona, torre, unidad o residente',
                  hintStyle: AppTextStyles.placeholder,
                  prefixIcon: const Icon(Icons.search_rounded,
                      size: 20, color: AppColors.gray400),
                  suffixIcon: _query.isNotEmpty
                      ? GestureDetector(
                          onTap: () => setState(() => _query = ''),
                          child: const Icon(Icons.close,
                              size: 18, color: AppColors.gray400),
                        )
                      : null,
                  filled: true,
                  fillColor: AppColors.white,
                  contentPadding:
                      const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: AppColors.gray200),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: AppColors.gray200),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: AppColors.primary),
                  ),
                ),
              ),
            ),
            // ── Lista ──────────────────────────────────────────────────
            Expanded(
              child: filtered.isEmpty
                  ? _EmptyState(
                      icon: Icons.meeting_room_outlined,
                      message: _query.isEmpty
                          ? 'No hay reservas registradas'
                          : 'Sin resultados para "$_query"',
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
                      itemCount: filtered.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (context, i) => _ReservationCard(
                        reservation: filtered[i],
                        onTap: () => _showDetail(filtered[i]),
                      ),
                    ),
            ),
          ],
        );
      },
    );
  }
}

class _ReservationCard extends StatelessWidget {
  const _ReservationCard({required this.reservation, required this.onTap});
  final ReservaApiModel reservation;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.gray200),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.info2Bg,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.meeting_room_outlined,
                size: 22, color: AppColors.primary),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(reservation.zonaNombre ?? 'Zona común',
                    style: AppTextStyles.bodyMedium),
                const SizedBox(height: 2),
                Text(
                  reservation.estado,
                  style:
                      AppTextStyles.small.copyWith(color: AppColors.gray500),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                reservation.fechaFormateada,
                style: AppTextStyles.badge.copyWith(color: AppColors.gray500),
              ),
              const SizedBox(height: 2),
              Text(
                '${reservation.horaInicio}-${reservation.horaFin}',
                style: AppTextStyles.badge.copyWith(color: AppColors.primary),
              ),
            ],
          ),
        ],
      ),
    ));
  }
}

// ── Detalle de reserva ─────────────────────────────────────────────────────────

class _ReservaDetailSheet extends StatelessWidget {
  const _ReservaDetailSheet({required this.reservation});
  final ReservaApiModel reservation;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Header ──────────────────────────────────────────────────────
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(reservation.zonaNombre ?? 'Zona común',
                  style: AppTextStyles.heading3),
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Container(
                  width: 28,
                  height: 28,
                  decoration: const BoxDecoration(
                    color: AppColors.gray100,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.close,
                      size: 16, color: AppColors.gray500),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            '${reservation.fechaFormateada}  ·  ${reservation.horaInicio} - ${reservation.horaFin}',
            style: AppTextStyles.small.copyWith(color: AppColors.gray500),
          ),
          const Divider(height: 24, color: AppColors.gray200),

          // ── Residente ────────────────────────────────────────────────────
          Text('Reservado por', style: AppTextStyles.smallSemibold),
          const SizedBox(height: 10),
          _DetailRow(
            icon: Icons.person_outline_rounded,
            label: 'Residente',
            value: reservation.nombreResidente ?? '—',
          ),
          const SizedBox(height: 8),
          _DetailRow(
            icon: Icons.apartment_rounded,
            label: 'Torre',
            value: reservation.nombreTorre ?? '—',
          ),
          const SizedBox(height: 8),
          _DetailRow(
            icon: Icons.home_outlined,
            label: 'Unidad',
            value: reservation.numeroUnidad != null
                ? 'Apto ${reservation.numeroUnidad}'
                : '—',
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
  });
  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: AppColors.gray100,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 18, color: AppColors.gray500),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label,
                style: AppTextStyles.small.copyWith(color: AppColors.gray400)),
            Text(value, style: AppTextStyles.bodyMedium),
          ],
        ),
      ],
    );
  }
}

// ── Parqueadero visitantes ─────────────────────────────────────────────────────

class _ParqueaderoTab extends ConsumerStatefulWidget {
  const _ParqueaderoTab();

  @override
  ConsumerState<_ParqueaderoTab> createState() => _ParqueaderoTabState();
}

class _ParqueaderoTabState extends ConsumerState<_ParqueaderoTab> {
  final Set<String> _releasing = {};

  Future<void> _liberar(String pvId) async {
    setState(() => _releasing.add(pvId));
    try {
      await ApiClient.instance.patch('/parqueadero-visitantes/$pvId/liberar');
      if (!mounted) return;
      ref.invalidate(visitorParkingProvider);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Espacio liberado'),
          backgroundColor: AppColors.successBtn,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } on DioException catch (e) {
      if (!mounted) return;
      final msg = (e.response?.data is Map)
          ? e.response!.data['detail'] ?? 'No se pudo liberar'
          : 'No se pudo liberar';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(msg),
          backgroundColor: AppColors.dangerText,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } finally {
      if (mounted) setState(() => _releasing.remove(pvId));
    }
  }

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(visitorParkingProvider);

    return async.when(
      loading: () => const Center(
        child: CircularProgressIndicator(
            strokeWidth: 2, color: AppColors.primary),
      ),
      error: (e, _) => _ErrorState(
        message: 'No se pudieron cargar los parqueaderos',
        onRetry: () => ref.invalidate(visitorParkingProvider),
      ),
      data: (spots) {
        if (spots.isEmpty) {
          return const _EmptyState(
            icon: Icons.local_parking_rounded,
            message: 'No hay parqueaderos ocupados',
          );
        }
        return ListView.separated(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
          itemCount: spots.length,
          separatorBuilder: (_, __) => const SizedBox(height: 10),
          itemBuilder: (context, i) => _ParkingCard(
            spot: spots[i],
            isReleasing: _releasing.contains(spots[i].id),
            onLiberar: () => _liberar(spots[i].id),
          ),
        );
      },
    );
  }
}

class _ParkingCard extends StatelessWidget {
  const _ParkingCard({
    required this.spot,
    required this.isReleasing,
    required this.onLiberar,
  });
  final VisitorParkingModel spot;
  final bool isReleasing;
  final VoidCallback onLiberar;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.gray200),
      ),
      child: Row(
        children: [
          // ── Número de espacio ─────────────────────────────────────────────
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: AppColors.attentionBg,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(
              child: Text(
                spot.numero,
                style: AppTextStyles.smallSemibold
                    .copyWith(color: AppColors.attentionText),
                textAlign: TextAlign.center,
              ),
            ),
          ),
          const SizedBox(width: 12),
          // ── Visitante e info ──────────────────────────────────────────────
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  spot.nombreVisitante ?? 'Visitante',
                  style: AppTextStyles.bodyMedium,
                ),
                const SizedBox(height: 3),
                Row(
                  children: [
                    Icon(
                      spot.tipoVehiculo == 'moto'
                          ? Icons.two_wheeler_outlined
                          : Icons.directions_car_outlined,
                      size: 12,
                      color: AppColors.gray400,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      spot.placa ?? '—',
                      style: AppTextStyles.small
                          .copyWith(color: AppColors.gray500),
                    ),
                    const SizedBox(width: 8),
                    const Icon(Icons.access_time_rounded,
                        size: 12, color: AppColors.gray400),
                    const SizedBox(width: 3),
                    Text(
                      spot.horaFormateada,
                      style: AppTextStyles.small
                          .copyWith(color: AppColors.gray500),
                    ),
                  ],
                ),
              ],
            ),
          ),
          // ── Botón liberar ─────────────────────────────────────────────────
          isReleasing
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                      strokeWidth: 2, color: AppColors.primary),
                )
              : TextButton(
                  onPressed: onLiberar,
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.dangerText,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 6),
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: Text('Liberar',
                      style: AppTextStyles.smallSemibold
                          .copyWith(color: AppColors.dangerText)),
                ),
        ],
      ),
    );
  }
}

// ── Shared ─────────────────────────────────────────────────────────────────────

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.icon, required this.message});
  final IconData icon;
  final String message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 48, color: AppColors.gray300),
          const SizedBox(height: 12),
          Text(message,
              style: AppTextStyles.body.copyWith(color: AppColors.gray500)),
        ],
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 40, color: AppColors.gray300),
          const SizedBox(height: 12),
          Text(message,
              style: AppTextStyles.body.copyWith(color: AppColors.gray500)),
          const SizedBox(height: 12),
          TextButton(onPressed: onRetry, child: const Text('Reintentar')),
        ],
      ),
    );
  }
}
