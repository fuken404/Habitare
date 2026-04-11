import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/features/security/domain/security_models.dart';
import 'package:habitare/features/security/presentation/providers/security_providers.dart';

class SecurityVisitorsScreen extends ConsumerWidget {
  const SecurityVisitorsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(securityVisitorsProvider);

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: AppColors.scaffold,
        appBar: AppBar(
          title: Text('Visitas Autorizadas', style: AppTextStyles.heading2),
          actions: [
            IconButton(
              icon: const Icon(Icons.refresh),
              color: AppColors.gray600,
              onPressed: () => ref.invalidate(securityVisitorsProvider),
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
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline,
                    size: 40, color: AppColors.gray300),
                const SizedBox(height: 12),
                Text('No se pudieron cargar las visitas',
                    style: AppTextStyles.body
                        .copyWith(color: AppColors.gray500)),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () => ref.invalidate(securityVisitorsProvider),
                  child: const Text('Reintentar'),
                ),
              ],
            ),
          ),
          data: (visitors) {
            final vigentes = visitors
                .where((v) => v.status == SecurityVisitorStatus.vigente)
                .toList();
            final historial = visitors
                .where((v) => v.status == SecurityVisitorStatus.historial)
                .toList();
            return TabBarView(
              children: [
                _VisitorTab(
                  visitors: vigentes,
                  emptyMessage: 'No hay visitas vigentes',
                  emptyIcon: Icons.people_outline_rounded,
                  showScanner: true,
                ),
                _VisitorTab(
                  visitors: historial,
                  emptyMessage: 'No hay historial de visitas',
                  emptyIcon: Icons.history_rounded,
                  showScanner: false,
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

// ── Tab con buscador propio ────────────────────────────────────────────────────

class _VisitorTab extends StatefulWidget {
  const _VisitorTab({
    required this.visitors,
    required this.emptyMessage,
    required this.emptyIcon,
    required this.showScanner,
  });
  final List<SecurityVisitorApiModel> visitors;
  final String emptyMessage;
  final IconData emptyIcon;
  final bool showScanner;

  @override
  State<_VisitorTab> createState() => _VisitorTabState();
}

class _VisitorTabState extends State<_VisitorTab> {
  String _query = '';

  List<SecurityVisitorApiModel> get _filtered {
    if (_query.isEmpty) return widget.visitors;
    return widget.visitors
        .where((v) => v.nDocumento.contains(_query))
        .toList();
  }

  Future<void> _openScanner() async {
    final authId = await context.push<String>('/security/visitors/scan');
    if (authId == null || !mounted) return;

    final visitor = widget.visitors.where((v) => v.id == authId).firstOrNull;
    if (!mounted) return;

    if (visitor == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Visitante no encontrado en visitas vigentes'),
          backgroundColor: AppColors.dangerText,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    context.push('/security/visitors/detail', extra: visitor);
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _filtered;

    return Stack(
      children: [
        SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _SearchBar(onChanged: (q) => setState(() => _query = q.trim())),
              if (filtered.isEmpty)
                _EmptyState(
                  icon: widget.emptyIcon,
                  message: _query.isEmpty
                      ? widget.emptyMessage
                      : 'Sin resultados para "$_query"',
                )
              else
                for (final v in filtered) ...[
                  const SizedBox(height: 10),
                  _VisitorCard(
                    visitor: v,
                    onTap: () =>
                        context.push('/security/visitors/detail', extra: v),
                  ),
                ],
            ],
          ),
        ),

        // ── FAB scanner (solo en Vigentes) ────────────────────────────────
        if (widget.showScanner)
          Positioned(
            right: 16,
            bottom: 24,
            child: FloatingActionButton.extended(
              onPressed: _openScanner,
              backgroundColor: AppColors.primary,
              foregroundColor: AppColors.white,
              elevation: 3,
              icon: const Icon(Icons.qr_code_scanner_rounded, size: 22),
              label: Text('Escanear QR',
                  style: AppTextStyles.bodyMedium
                      .copyWith(color: AppColors.white)),
            ),
          ),
      ],
    );
  }
}

// ── Search bar (igual al del residente) ───────────────────────────────────────

class _SearchBar extends StatelessWidget {
  const _SearchBar({required this.onChanged});
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return TextField(
      style: AppTextStyles.bodyRegular,
      keyboardType: TextInputType.number,
      onChanged: onChanged,
      decoration: const InputDecoration(
        hintText: 'Buscar por N° de documento...',
        prefixIcon: Icon(Icons.search, size: 20, color: AppColors.gray500),
        contentPadding: EdgeInsets.symmetric(horizontal: 16),
        constraints: BoxConstraints(minHeight: 44),
      ),
    );
  }
}

// ── Visitor card ───────────────────────────────────────────────────────────────

class _VisitorCard extends StatelessWidget {
  const _VisitorCard({required this.visitor, required this.onTap});
  final SecurityVisitorApiModel visitor;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
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
                  Text(visitor.nombreCompleto,
                      style: AppTextStyles.bodyMedium),
                  const SizedBox(height: 2),
                  Text(
                    visitor.docCompleto,
                    style: AppTextStyles.small
                        .copyWith(color: AppColors.gray500),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(visitor.fechaFormateada,
                    style: AppTextStyles.badge
                        .copyWith(color: AppColors.gray500)),
                const SizedBox(height: 4),
                if (!visitor.requiereParqueadero)
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.attentionBg,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text('Sin parqueadero',
                        style: AppTextStyles.badge
                            .copyWith(color: AppColors.attentionText)),
                  )
                else
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
            ),
            const SizedBox(width: 6),
            const Icon(Icons.chevron_right_rounded,
                size: 18, color: AppColors.gray400),
          ],
        ),
      ),
    );
  }
}

// ── Empty state ────────────────────────────────────────────────────────────────

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
                style: AppTextStyles.body.copyWith(color: AppColors.gray500)),
          ],
        ),
      ),
    );
  }
}
