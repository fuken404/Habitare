import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/core/utils/formatters.dart';
import 'package:habitare/features/packages/domain/package_model.dart';
import 'package:habitare/features/packages/presentation/providers/packages_provider.dart';
import 'package:habitare/shared/widgets/async_widget.dart';

class PackagesScreen extends ConsumerWidget {
  const PackagesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(packagesProvider);
    return Scaffold(
      backgroundColor: AppColors.scaffold,
      appBar: AppBar(
        title: Text('Paquetes en Portería', style: AppTextStyles.heading2),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: AsyncWidget(
        value: async,
        data: (packages) {
          final pending =
              packages.where((p) => p.estado == 'pendiente').toList();
          final delivered =
              packages.where((p) => p.estado == 'entregado' || p.estado == 'retirado').toList();

          return SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.attentionBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                        color: AppColors.attentionBtn.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: AppColors.attentionBtn,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.inventory_2_outlined,
                            size: 24, color: AppColors.white),
                      ),
                      const SizedBox(width: 14),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${pending.length} paquetes pendientes',
                            style: AppTextStyles.bodyMedium
                                .copyWith(color: AppColors.attentionBtn),
                          ),
                          Text(
                            'Disponibles en portería para recoger',
                            style: AppTextStyles.small
                                .copyWith(color: AppColors.gray600),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                if (pending.isNotEmpty) ...[
                  const SizedBox(height: 24),
                  Text('Por recoger', style: AppTextStyles.heading3),
                  const SizedBox(height: 12),
                  ...pending.map((p) => _PackageCard(package: p)),
                ],
                if (delivered.isNotEmpty) ...[
                  const SizedBox(height: 24),
                  Text('Historial', style: AppTextStyles.heading3),
                  const SizedBox(height: 12),
                  ...delivered.map((p) => _PackageCard(package: p)),
                ],
                if (packages.isEmpty)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        children: [
                          const Icon(Icons.inventory_2_outlined,
                              size: 48, color: AppColors.gray300),
                          const SizedBox(height: 12),
                          Text('No hay paquetes registrados',
                              style: AppTextStyles.body
                                  .copyWith(color: AppColors.gray500)),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _PackageCard extends StatelessWidget {
  const _PackageCard({required this.package});
  final PackageModel package;

  @override
  Widget build(BuildContext context) {
    final colors = estadoPaqueteColors(package.estado);
    final label = estadoPaqueteLabel(package.estado);
    final isDelivered = package.estado == 'entregado' || package.estado == 'retirado';

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
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
              color: colors.bg,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              isDelivered
                  ? Icons.check_circle_outline_rounded
                  : Icons.inventory_2_outlined,
              size: 20,
              color: colors.color,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Paquete #${package.id.substring(0, 8).toUpperCase()}',
                    style: AppTextStyles.bodyMedium),
                const SizedBox(height: 3),
                Text(
                  isDelivered && package.fechaEntrega != null
                      ? 'Entregado: ${formatDateShort(package.fechaEntrega)}'
                      : 'Recibido: ${formatDateShort(package.fechaRecepcion)}',
                  style:
                      AppTextStyles.small.copyWith(color: AppColors.gray500),
                ),
              ],
            ),
          ),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: colors.bg,
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(label,
                style: AppTextStyles.badge.copyWith(color: colors.color)),
          ),
        ],
      ),
    );
  }
}
