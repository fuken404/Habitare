import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/core/utils/formatters.dart';
import 'package:habitare/features/pqrs/presentation/providers/pqrs_provider.dart';
import 'package:habitare/shared/widgets/async_widget.dart';

String _tipoLabel(String tipo) {
  const map = {
    'PETICION': 'Petición',
    'QUEJA': 'Queja',
    'RECLAMO': 'Reclamo',
    'SUGERENCIA': 'Sugerencia',
    'peticion': 'Petición',
    'queja': 'Queja',
    'reclamo': 'Reclamo',
    'sugerencia': 'Sugerencia',
  };
  return map[tipo] ?? tipo;
}

class PqrsListScreen extends ConsumerWidget {
  const PqrsListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(pqrsProvider);
    return Scaffold(
      backgroundColor: AppColors.scaffold,
      appBar: AppBar(
        title: Text('PQRS Radicadas', style: AppTextStyles.heading2),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, size: 20),
          onPressed: () => context.canPop() ? context.pop() : context.go('/more'),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/pqrs/new'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
        icon: const Icon(Icons.add),
        label: Text('Nueva PQRS',
            style: AppTextStyles.bodyMedium
                .copyWith(color: AppColors.white)),
      ),
      body: AsyncWidget(
        value: async,
        data: (items) => items.isEmpty
            ? _EmptyPqrs()
            : ListView.separated(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
                itemCount: items.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, i) {
                  final p = items[i];
                  final statusColors = estadoPqrsColors(p.estado);
                  return GestureDetector(
                    onTap: () => context.push('/pqrs/${p.id}'),
                    child: Container(
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
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: statusColors.bg,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  estadoPqrsLabel(p.estado),
                                  style: AppTextStyles.badge.copyWith(
                                      color: statusColors.color),
                                ),
                              ),
                              const Spacer(),
                              Text(
                                formatDate(p.createdAt),
                                style: AppTextStyles.badge
                                    .copyWith(color: AppColors.gray500),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text(p.asunto, style: AppTextStyles.bodyMedium),
                          const SizedBox(height: 4),
                          if (p.tipo != null)
                            Text(
                              _tipoLabel(p.tipo!),
                              style: AppTextStyles.small
                                  .copyWith(color: AppColors.gray500),
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),
      ),
    );
  }
}

class _EmptyPqrs extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.forum_outlined,
              size: 56, color: AppColors.gray300),
          const SizedBox(height: 16),
          Text('No tienes PQRS radicadas',
              style:
                  AppTextStyles.body.copyWith(color: AppColors.gray500)),
          const SizedBox(height: 8),
          Text('Toca el botón + para radicar una',
              style:
                  AppTextStyles.small.copyWith(color: AppColors.gray400)),
        ],
      ),
    );
  }
}
