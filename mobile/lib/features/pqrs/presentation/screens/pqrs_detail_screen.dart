import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/core/utils/formatters.dart';
import 'package:habitare/features/pqrs/presentation/providers/pqrs_provider.dart';

String _tipoLabel(String tipo) {
  const map = {
    'PETICION': 'Petición', 'peticion': 'Petición',
    'QUEJA': 'Queja',       'queja': 'Queja',
    'RECLAMO': 'Reclamo',   'reclamo': 'Reclamo',
    'SUGERENCIA': 'Sugerencia', 'sugerencia': 'Sugerencia',
    'INCIDENTE': 'Incidente', 'incidente': 'Incidente',
  };
  return map[tipo] ?? tipo;
}

class PqrsDetailScreen extends ConsumerWidget {
  const PqrsDetailScreen({super.key, required this.id});
  final String id;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(pqrsDetailProvider(id));

    return Scaffold(
      backgroundColor: AppColors.scaffold,
      appBar: AppBar(
        title: Text('Detalle PQRS', style: AppTextStyles.heading2),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: async.when(
        loading: () => const Center(
          child: CircularProgressIndicator(
              strokeWidth: 2, color: AppColors.primary),
        ),
        error: (e, _) => Center(
          child: Text('No se pudo cargar la PQRS',
              style: AppTextStyles.body.copyWith(color: AppColors.gray500)),
        ),
        data: (item) {
          final statusColors = estadoPqrsColors(item.estado);
          final statusLabel = estadoPqrsLabel(item.estado);
          // Show non-internal messages from admins (not the same user who filed)
          final responses = item.mensajes
              .where((m) => !m.isInterno && m.autorId != item.radicadoPor)
              .toList();

          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    if (item.tipo != null)
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.info2Bg,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(_tipoLabel(item.tipo!),
                            style: AppTextStyles.badge
                                .copyWith(color: AppColors.primary)),
                      ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColors.bg,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(statusLabel,
                          style: AppTextStyles.badge
                              .copyWith(color: statusColors.color)),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Text(item.asunto, style: AppTextStyles.heading2),
                const SizedBox(height: 4),
                Text(
                  formatDate(item.createdAt),
                  style: AppTextStyles.small
                      .copyWith(color: AppColors.gray500),
                ),
                const Divider(height: 28),

                Text('Descripción', style: AppTextStyles.smallSemibold),
                const SizedBox(height: 8),
                Text(item.descripcion,
                    style: AppTextStyles.body.copyWith(height: 1.6)),

                if (item.adjuntos.isNotEmpty) ...[
                  const SizedBox(height: 24),
                  Text('Adjuntos', style: AppTextStyles.smallSemibold),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: item.adjuntos.map((adj) {
                      Uint8List? bytes;
                      try {
                        bytes = base64Decode(adj.contenidoB64);
                      } catch (_) {}
                      return ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: bytes != null
                            ? Image.memory(bytes,
                                width: 90, height: 90, fit: BoxFit.cover)
                            : Container(
                                width: 90,
                                height: 90,
                                color: AppColors.gray100,
                                child: const Icon(Icons.broken_image_outlined,
                                    color: AppColors.gray400),
                              ),
                      );
                    }).toList(),
                  ),
                ],

                if (responses.isNotEmpty) ...[
                  const SizedBox(height: 24),
                  Text('Respuesta de Administración',
                      style: AppTextStyles.smallSemibold),
                  const SizedBox(height: 8),
                  ...responses.map((msg) => Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: const Color(0xFFD1FAE5),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                              color: AppColors.successBtn
                                  .withValues(alpha: 0.3)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.apartment_rounded,
                                    size: 14,
                                    color: AppColors.successText),
                                const SizedBox(width: 6),
                                Text('Administración Habitare',
                                    style: AppTextStyles.badge.copyWith(
                                        color: AppColors.successText)),
                                const Spacer(),
                                Text(
                                  formatDate(msg.createdAt),
                                  style: AppTextStyles.badge.copyWith(
                                      color: AppColors.gray500),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(msg.contenido,
                                style: AppTextStyles.small
                                    .copyWith(height: 1.6)),
                          ],
                        ),
                      )),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}
