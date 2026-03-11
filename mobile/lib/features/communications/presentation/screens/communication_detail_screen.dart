import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/core/utils/formatters.dart';
import 'package:habitare/features/communications/presentation/providers/communications_provider.dart';

class CommunicationDetailScreen extends ConsumerWidget {
  const CommunicationDetailScreen({super.key, required this.id});
  final String id;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(communicationDetailProvider(id));

    return Scaffold(
      backgroundColor: AppColors.scaffold,
      appBar: AppBar(
        title: Text('Comunicado', style: AppTextStyles.heading2),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: async.when(
        loading: () => const Center(
            child: CircularProgressIndicator(
                strokeWidth: 2, color: AppColors.primary)),
        error: (e, _) => Center(
            child: Text('No se pudo cargar el comunicado',
                style: AppTextStyles.body
                    .copyWith(color: AppColors.gray500))),
        data: (item) {
          final colors = tipoColors(item.tipo);
          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: colors.bg,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(tipoLabel(item.tipo),
                          style: AppTextStyles.badge
                              .copyWith(color: colors.color)),
                    ),
                    Text(
                      formatDate(item.fechaPublicacion),
                      style: AppTextStyles.small
                          .copyWith(color: AppColors.gray500),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(item.titulo, style: AppTextStyles.heading2),
                const SizedBox(height: 4),
                const Divider(height: 24),
                Text(
                  item.contenido,
                  style: AppTextStyles.body.copyWith(height: 1.7),
                ),
                const SizedBox(height: 32),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.gray100,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.apartment_rounded,
                          size: 18, color: AppColors.gray500),
                      const SizedBox(width: 10),
                      Text('Administración Habitare',
                          style: AppTextStyles.small
                              .copyWith(color: AppColors.gray500)),
                    ],
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
