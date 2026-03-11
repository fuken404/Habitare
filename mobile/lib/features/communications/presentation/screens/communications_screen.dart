import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/core/utils/formatters.dart';
import 'package:habitare/features/communications/presentation/providers/communications_provider.dart';

const _tipos = ['todos', 'informativo', 'urgente', 'evento', 'mantenimiento'];

class CommunicationsScreen extends ConsumerStatefulWidget {
  const CommunicationsScreen({super.key});

  @override
  ConsumerState<CommunicationsScreen> createState() =>
      _CommunicationsScreenState();
}

class _CommunicationsScreenState extends ConsumerState<CommunicationsScreen> {
  String _selectedTipo = 'todos';

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(communicationsProvider);

    return Scaffold(
      backgroundColor: AppColors.scaffold,
      appBar: AppBar(
        title: Text('Comunicados', style: AppTextStyles.heading2),
      ),
      body: Column(
        children: [
          // ── Pills de filtro ───────────────────────────────────────────────
          Container(
            color: AppColors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _tipos.map((tipo) {
                  final selected = _selectedTipo == tipo;
                  final colors = tipo == 'todos'
                      ? (color: AppColors.primary, bg: AppColors.info2Bg)
                      : tipoColors(tipo);
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedTipo = tipo),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 150),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 7),
                        decoration: BoxDecoration(
                          color: selected ? colors.bg : AppColors.gray100,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: selected ? colors.color : Colors.transparent,
                            width: 1,
                          ),
                        ),
                        child: Text(
                          tipo == 'todos' ? 'Todos' : tipoLabel(tipo),
                          style: AppTextStyles.badge.copyWith(
                            color: selected ? colors.color : AppColors.gray500,
                            fontWeight: selected
                                ? FontWeight.w600
                                : FontWeight.w400,
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          // ── Lista ─────────────────────────────────────────────────────────
          Expanded(
            child: async.when(
              loading: () => const Center(
                child: CircularProgressIndicator(
                    strokeWidth: 2, color: AppColors.primary),
              ),
              error: (e, _) => Center(
                child: Text('No se pudo cargar los comunicados',
                    style: AppTextStyles.body
                        .copyWith(color: AppColors.gray500)),
              ),
              data: (items) {
                final filtered = _selectedTipo == 'todos'
                    ? items
                    : items
                        .where((c) =>
                            c.tipo.toLowerCase() == _selectedTipo)
                        .toList();

                if (filtered.isEmpty) {
                  return Center(
                    child: Text('No hay comunicados',
                        style: AppTextStyles.body
                            .copyWith(color: AppColors.gray500)),
                  );
                }

                return ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
                  itemCount: filtered.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, i) {
                    final item = filtered[i];
                    final colors = tipoColors(item.tipo);
                    return GestureDetector(
                      onTap: () =>
                          context.push('/communications/${item.id}'),
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
                              mainAxisAlignment:
                                  MainAxisAlignment.spaceBetween,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 10, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: colors.bg,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    tipoLabel(item.tipo),
                                    style: AppTextStyles.badge
                                        .copyWith(color: colors.color),
                                  ),
                                ),
                                Text(
                                  formatDateShort(item.fechaPublicacion),
                                  style: AppTextStyles.badge
                                      .copyWith(color: AppColors.gray500),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Text(item.titulo,
                                style: AppTextStyles.bodySemibold,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
