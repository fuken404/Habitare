import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/features/visitors/domain/visitor_model.dart';
import 'package:habitare/features/visitors/presentation/providers/visitors_provider.dart';

class VisitorsScreen extends ConsumerWidget {
  const VisitorsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(visitorsProvider);

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: AppColors.scaffold,
        appBar: AppBar(
          title: Text('Visitantes', style: AppTextStyles.heading2),
          actions: [
            IconButton(
              icon: const Icon(Icons.person_add_alt_1_outlined),
              color: AppColors.primary,
              onPressed: () => context.push('/visitors/create'),
              tooltip: 'Nuevo visitante',
            ),
          ],
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
                  Tab(text: 'Vigentes'),
                  Tab(text: 'Historial'),
                ],
              ),
            ),
          ),
        ),
        body: async.when(
          loading: () => const Center(
            child: CircularProgressIndicator(
                strokeWidth: 2, color: AppColors.primary),
          ),
          error: (e, _) => Center(
            child: Text('No se pudo cargar los visitantes',
                style: AppTextStyles.body.copyWith(color: AppColors.gray500)),
          ),
          data: (apiVisitors) {
            final all = apiVisitors.map((v) => v.toVisitorModel()).toList();
            final vigentes = all
                .where((v) => v.status == VisitorStatus.vigente)
                .toList();
            final historial = all
                .where((v) => v.status == VisitorStatus.historial)
                .toList();
            return TabBarView(
              children: [
                _VigentesTab(visitors: vigentes),
                _HistorialTab(visitors: historial),
              ],
            );
          },
        ),
        floatingActionButton: FloatingActionButton.extended(
          onPressed: () => context.push('/visitors/create'),
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.white,
          icon: const Icon(Icons.add),
          label: Text('Nuevo visitante',
              style:
                  AppTextStyles.bodyMedium.copyWith(color: AppColors.white)),
        ),
      ),
    );
  }
}

// Agrupa una lista de visitantes por su fecha formateada, manteniendo el orden
Map<String, List<VisitorModel>> _groupByDate(List<VisitorModel> visitors) {
  final map = <String, List<VisitorModel>>{};
  for (final v in visitors) {
    map.putIfAbsent(v.date, () => []).add(v);
  }
  return map;
}

List<VisitorModel> _filterVisitors(List<VisitorModel> visitors, String query) {
  if (query.isEmpty) return visitors;
  final q = query.toLowerCase();
  return visitors
      .where((v) =>
          v.name.toLowerCase().contains(q) ||
          v.doc.toLowerCase().contains(q))
      .toList();
}

class _VigentesTab extends StatefulWidget {
  const _VigentesTab({required this.visitors});
  final List<VisitorModel> visitors;

  @override
  State<_VigentesTab> createState() => _VigentesTabState();
}

class _VigentesTabState extends State<_VigentesTab> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final filtered = _filterVisitors(widget.visitors, _query);
    final groups = _groupByDate(filtered);

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SearchBar(onChanged: (q) => setState(() => _query = q)),
          if (filtered.isEmpty)
            _EmptyState(
              icon: Icons.people_outline_rounded,
              message: _query.isEmpty
                  ? 'No hay visitas vigentes'
                  : 'Sin resultados para "$_query"',
            )
          else
            for (final entry in groups.entries) ...[
              const SizedBox(height: 20),
              Text(
                entry.key == 'Hoy' ? 'Visitas de Hoy' : entry.key,
                style: AppTextStyles.heading3,
              ),
              const SizedBox(height: 12),
              ...entry.value.map((v) => _VisitorCard(visitor: v)),
            ],
        ],
      ),
    );
  }
}

class _HistorialTab extends StatefulWidget {
  const _HistorialTab({required this.visitors});
  final List<VisitorModel> visitors;

  @override
  State<_HistorialTab> createState() => _HistorialTabState();
}

class _HistorialTabState extends State<_HistorialTab> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final filtered = _filterVisitors(widget.visitors, _query);
    final groups = _groupByDate(filtered);

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SearchBar(onChanged: (q) => setState(() => _query = q)),
          if (filtered.isEmpty)
            _EmptyState(
              icon: Icons.history_rounded,
              message: _query.isEmpty
                  ? 'No hay historial de visitas'
                  : 'Sin resultados para "$_query"',
            )
          else
            for (final entry in groups.entries) ...[
              const SizedBox(height: 20),
              Text(entry.key, style: AppTextStyles.heading3),
              const SizedBox(height: 12),
              ...entry.value.map((v) => _VisitorCard(visitor: v)),
            ],
        ],
      ),
    );
  }
}

class _SearchBar extends StatelessWidget {
  const _SearchBar({required this.onChanged});
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return TextField(
      style: AppTextStyles.bodyRegular,
      onChanged: onChanged,
      decoration: const InputDecoration(
        hintText: 'Buscar visitante...',
        prefixIcon: Icon(Icons.search, size: 20, color: AppColors.gray500),
        contentPadding: EdgeInsets.symmetric(horizontal: 16),
        constraints: BoxConstraints(minHeight: 44),
      ),
    );
  }
}

class _VisitorCard extends StatelessWidget {
  const _VisitorCard({required this.visitor});
  final VisitorModel visitor;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/visitors/detail', extra: visitor),
      child: Container(
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
                color: AppColors.info2Bg,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.person_outline_rounded,
                  size: 22, color: AppColors.primary),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(visitor.name, style: AppTextStyles.bodyMedium),
                  const SizedBox(height: 2),
                  Text(visitor.doc,
                      style: AppTextStyles.small
                          .copyWith(color: AppColors.gray500)),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(visitor.date,
                    style: AppTextStyles.badge
                        .copyWith(color: AppColors.gray500)),
                if (visitor.hasParking) ...[
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.info2Bg,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text('Parqueadero',
                        style: AppTextStyles.badge
                            .copyWith(color: AppColors.primary)),
                  ),
                ],
              ],
            ),
            const SizedBox(width: 8),
            const Icon(Icons.chevron_right_rounded,
                size: 18, color: AppColors.gray400),
          ],
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.icon, required this.message});
  final IconData icon;
  final String message;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 48),
        child: Column(
          children: [
            Icon(icon, size: 48, color: AppColors.gray300),
            const SizedBox(height: 12),
            Text(message,
                style:
                    AppTextStyles.body.copyWith(color: AppColors.gray500)),
          ],
        ),
      ),
    );
  }
}
