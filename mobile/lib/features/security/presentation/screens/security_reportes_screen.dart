import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:habitare/core/network/api_client.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/features/security/domain/security_models.dart';
import 'package:habitare/features/security/presentation/providers/security_providers.dart';

class SecurityReportesScreen extends StatefulWidget {
  const SecurityReportesScreen({super.key});

  @override
  State<SecurityReportesScreen> createState() => _SecurityReportesScreenState();
}

class _SecurityReportesScreenState extends State<SecurityReportesScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _showSuccessToast = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _onReportSuccess() {
    setState(() => _showSuccessToast = true);
    Future.delayed(const Duration(seconds: 5), () {
      if (mounted) setState(() => _showSuccessToast = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffold,
      appBar: AppBar(
        title: Text('Reportes', style: AppTextStyles.heading2),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: Container(
            color: AppColors.white,
            child: TabBar(
              controller: _tabController,
              labelStyle: AppTextStyles.bodyMedium,
              unselectedLabelStyle: AppTextStyles.bodyRegular,
              labelColor: AppColors.primary,
              unselectedLabelColor: AppColors.gray500,
              indicatorColor: AppColors.primary,
              indicatorWeight: 2,
              tabs: const [
                Tab(text: 'Crear Reporte'),
                Tab(text: 'Historial'),
              ],
            ),
          ),
        ),
      ),
      body: Stack(
        children: [
          TabBarView(
            controller: _tabController,
            children: [
              _CrearReporteTab(onSuccess: _onReportSuccess),
              const _HistorialTab(),
            ],
          ),
          if (_showSuccessToast)
            _SuccessToast(
              onClose: () => setState(() => _showSuccessToast = false),
            ),
        ],
      ),
    );
  }
}

// ── Crear Reporte Tab ──────────────────────────────────────────────────────

class _CrearReporteTab extends ConsumerStatefulWidget {
  const _CrearReporteTab({required this.onSuccess});
  final VoidCallback onSuccess;

  @override
  ConsumerState<_CrearReporteTab> createState() => _CrearReporteTabState();
}

class _CrearReporteTabState extends ConsumerState<_CrearReporteTab> {
  final _formKey = GlobalKey<FormState>();
  final _descripcionCtrl = TextEditingController();
  final _ubicacionCtrl = TextEditingController();
  String? _tipoId;
  String _severidad = 'media';
  bool _isLoading = false;

  static const _severidades = ['baja', 'media', 'alta', 'critica'];
  static const _severidadLabels = {
    'baja': 'Baja',
    'media': 'Media',
    'alta': 'Alta',
    'critica': 'Crítica',
  };

  @override
  void dispose() {
    _descripcionCtrl.dispose();
    _ubicacionCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit(List<TipoIncidenteApiModel> tipos) async {
    if (!_formKey.currentState!.validate()) return;
    if (_tipoId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Selecciona el tipo de reporte')),
      );
      return;
    }
    final tipoNombre =
        tipos.firstWhere((t) => t.id == _tipoId).nombre;
    setState(() => _isLoading = true);
    try {
      await ApiClient.instance.post('/incidents', data: {
        'tipo_id': _tipoId,
        'titulo': '$tipoNombre en ${_ubicacionCtrl.text.trim()}',
        'descripcion': _descripcionCtrl.text.trim(),
        'ubicacion': _ubicacionCtrl.text.trim(),
        'severidad': _severidad,
      });
      if (!mounted) return;
      _formKey.currentState!.reset();
      _descripcionCtrl.clear();
      _ubicacionCtrl.clear();
      setState(() {
        _isLoading = false;
        _tipoId = null;
        _severidad = 'media';
      });
      ref.invalidate(securityIncidentsProvider);
      widget.onSuccess();
    } on DioException catch (e) {
      final data = e.response?.data;
      String msg = 'Error al enviar el reporte';
      if (data is Map) {
        final detail = data['detail'];
        if (detail is String) msg = detail;
      }
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(msg)));
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final tiposAsync = ref.watch(securityTiposProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Tipo ──────────────────────────────────────────────────────
            Text('Tipo de reporte', style: AppTextStyles.smallSemibold),
            const SizedBox(height: 8),
            tiposAsync.when(
              loading: () => const SizedBox(
                height: 48,
                child: Center(
                  child: SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: AppColors.primary),
                  ),
                ),
              ),
              error: (_, __) => Text('No se pudieron cargar los tipos',
                  style: AppTextStyles.small
                      .copyWith(color: AppColors.dangerText)),
              data: (tipos) {
                if (_tipoId == null && tipos.isNotEmpty) {
                  WidgetsBinding.instance.addPostFrameCallback((_) {
                    if (mounted) setState(() => _tipoId = tipos.first.id);
                  });
                }
                return _Dropdown(
                  value: _tipoId,
                  hint: 'Selecciona el tipo',
                  items: tipos
                      .map((t) => DropdownMenuItem(
                          value: t.id, child: Text(t.nombre)))
                      .toList(),
                  onChanged: (v) => setState(() => _tipoId = v),
                );
              },
            ),
            const SizedBox(height: 20),

            // ── Ubicación ─────────────────────────────────────────────────
            Text('Ubicación', style: AppTextStyles.smallSemibold),
            const SizedBox(height: 8),
            TextFormField(
              controller: _ubicacionCtrl,
              textCapitalization: TextCapitalization.sentences,
              style: AppTextStyles.bodyRegular,
              decoration: const InputDecoration(
                hintText: 'Ej: Portería, Parqueadero, Torre B...',
                prefixIcon: Icon(Icons.location_on_outlined,
                    size: 20, color: AppColors.gray500),
              ),
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Ingresa la ubicación' : null,
            ),
            const SizedBox(height: 20),

            // ── Severidad ─────────────────────────────────────────────────
            Text('Severidad', style: AppTextStyles.smallSemibold),
            const SizedBox(height: 8),
            _Dropdown(
              value: _severidad,
              hint: 'Selecciona la severidad',
              items: _severidades
                  .map((s) => DropdownMenuItem(
                      value: s, child: Text(_severidadLabels[s]!)))
                  .toList(),
              onChanged: (v) {
                if (v != null) setState(() => _severidad = v);
              },
            ),
            const SizedBox(height: 20),

            // ── Descripción ───────────────────────────────────────────────
            Text('Descripción', style: AppTextStyles.smallSemibold),
            const SizedBox(height: 8),
            TextFormField(
              controller: _descripcionCtrl,
              maxLines: 5,
              textCapitalization: TextCapitalization.sentences,
              style: AppTextStyles.bodyRegular,
              decoration: const InputDecoration(
                hintText: 'Describe el reporte con el mayor detalle posible...',
                alignLabelWithHint: true,
                contentPadding:
                    EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              ),
              validator: (v) {
                if (v == null || v.trim().isEmpty) return 'Ingresa la descripción';
                if (v.trim().length < 10) return 'Mínimo 10 caracteres';
                return null;
              },
            ),
            const SizedBox(height: 32),

            SizedBox(
              width: double.infinity,
              child: tiposAsync.maybeWhen(
                data: (tipos) => ElevatedButton(
                  onPressed: _isLoading ? null : () => _submit(tipos),
                  style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: AppColors.white),
                        )
                      : const Text('Crear Reporte'),
                ),
                orElse: () => ElevatedButton(
                  onPressed: null,
                  style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary),
                  child: const Text('Crear Reporte'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Historial Tab ──────────────────────────────────────────────────────────

class _HistorialTab extends ConsumerStatefulWidget {
  const _HistorialTab();

  @override
  ConsumerState<_HistorialTab> createState() => _HistorialTabState();
}

class _HistorialTabState extends ConsumerState<_HistorialTab> {
  String? _filterTipoId;

  void _showDetail(IncidentApiModel incident, Map<String, String> tipoMap) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _ReporteDetailSheet(
        incident: incident,
        tipoNombre: tipoMap[incident.tipoId] ?? incident.tipoId,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final incidentsAsync = ref.watch(securityIncidentsProvider);
    final tiposAsync = ref.watch(securityTiposProvider);

    return tiposAsync.when(
      loading: () => const Center(
          child: CircularProgressIndicator(
              strokeWidth: 2, color: AppColors.primary)),
      error: (_, __) => const SizedBox.shrink(),
      data: (tipos) {
        final tipoMap = {for (final t in tipos) t.id: t.nombre};

        return incidentsAsync.when(
          loading: () => const Center(
              child: CircularProgressIndicator(
                  strokeWidth: 2, color: AppColors.primary)),
          error: (e, _) => Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('No se pudieron cargar los reportes',
                    style: AppTextStyles.body
                        .copyWith(color: AppColors.gray500)),
                const SizedBox(height: 12),
                TextButton(
                    onPressed: () =>
                        ref.invalidate(securityIncidentsProvider),
                    child: const Text('Reintentar')),
              ],
            ),
          ),
          data: (incidents) {
            final filtered = _filterTipoId == null
                ? incidents
                : incidents
                    .where((i) => i.tipoId == _filterTipoId)
                    .toList();

            return SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Filtros ──────────────────────────────────────────
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _FilterChip(
                          label: 'Todos',
                          selected: _filterTipoId == null,
                          onTap: () => setState(() => _filterTipoId = null),
                        ),
                        ...tipos.map((t) => Padding(
                              padding: const EdgeInsets.only(left: 8),
                              child: _FilterChip(
                                label: t.nombre,
                                selected: _filterTipoId == t.id,
                                onTap: () => setState(() =>
                                    _filterTipoId =
                                        _filterTipoId == t.id ? null : t.id),
                              ),
                            )),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // ── Lista ────────────────────────────────────────────
                  if (filtered.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 48),
                      child: Center(
                        child: Column(
                          children: [
                            const Icon(Icons.flag_outlined,
                                size: 48, color: AppColors.gray300),
                            const SizedBox(height: 12),
                            Text('No hay reportes',
                                style: AppTextStyles.body
                                    .copyWith(color: AppColors.gray500)),
                          ],
                        ),
                      ),
                    )
                  else
                    ...filtered.map((i) => _ReporteCard(
                          incident: i,
                          tipoNombre: tipoMap[i.tipoId] ?? 'Reporte',
                          onTap: () => _showDetail(i, tipoMap),
                        )),
                ],
              ),
            );
          },
        );
      },
    );
  }
}

// ── Widgets ───────────────────────────────────────────────────────────────

class _Dropdown extends StatelessWidget {
  const _Dropdown({
    required this.value,
    required this.hint,
    required this.items,
    required this.onChanged,
  });
  final String? value;
  final String hint;
  final List<DropdownMenuItem<String>> items;
  final ValueChanged<String?> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.gray300),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          hint: Text(hint, style: AppTextStyles.placeholder),
          isExpanded: true,
          style: AppTextStyles.bodyRegular,
          items: items,
          onChanged: onChanged,
        ),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary : AppColors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
              color: selected ? AppColors.primary : AppColors.gray300),
        ),
        child: Text(
          label,
          style: AppTextStyles.bodyMedium.copyWith(
            color: selected ? AppColors.white : AppColors.gray600,
          ),
        ),
      ),
    );
  }
}

class _ReporteCard extends StatelessWidget {
  const _ReporteCard({
    required this.incident,
    required this.tipoNombre,
    required this.onTap,
  });
  final IncidentApiModel incident;
  final String tipoNombre;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.gray200),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.info2Bg,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    tipoNombre,
                    style:
                        AppTextStyles.badge.copyWith(color: AppColors.primary),
                  ),
                ),
                Text(incident.fechaFormateada,
                    style: AppTextStyles.badge
                        .copyWith(color: AppColors.gray500)),
              ],
            ),
            const SizedBox(height: 8),
            Text(incident.titulo, style: AppTextStyles.bodySemibold),
            const SizedBox(height: 4),
            _SeveridadBadge(severidad: incident.severidadEnum),
          ],
        ),
      ),
    );
  }
}

class _ReporteDetailSheet extends ConsumerWidget {
  const _ReporteDetailSheet({
    required this.incident,
    required this.tipoNombre,
  });
  final IncidentApiModel incident;
  final String tipoNombre;

  Future<void> _marcarResuelta(BuildContext context, WidgetRef ref) async {
    try {
      await ApiClient.instance
          .patch('/incidents/${incident.id}', data: {'estado': 'cerrado'});
      ref.invalidate(securityIncidentsProvider);
      if (context.mounted) Navigator.pop(context);
    } on DioException catch (e) {
      final msg = (e.response?.data as Map?)?['detail'] as String? ??
          'No se pudo actualizar';
      if (context.mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(msg)));
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(tipoNombre, style: AppTextStyles.heading3),
                    const SizedBox(height: 4),
                    _SeveridadBadge(severidad: incident.severidadEnum),
                  ],
                ),
              ),
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
          const SizedBox(height: 12),
          Text(incident.titulo,
              style: AppTextStyles.bodyRegular
                  .copyWith(color: AppColors.gray600)),
          const SizedBox(height: 8),
          _FetchIncidentDetail(incidentId: incident.id),
          const SizedBox(height: 20),
          if (incident.estado != 'resuelto' && incident.estado != 'cerrado')
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => _marcarResuelta(context, ref),
                style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary),
                child: const Text('Marcar como resuelta'),
              ),
            ),
        ],
      ),
    );
  }
}

class _FetchIncidentDetail extends ConsumerWidget {
  const _FetchIncidentDetail({required this.incidentId});
  final String incidentId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(incidentDetailProvider(incidentId));
    return async.when(
      loading: () => const SizedBox(
        height: 24,
        child: Center(
          child: SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(
                strokeWidth: 2, color: AppColors.primary),
          ),
        ),
      ),
      error: (_, __) => const SizedBox.shrink(),
      data: (data) {
        final descripcion = data['descripcion'] as String?;
        final ubicacion = data['ubicacion'] as String?;
        if (descripcion == null && ubicacion == null) return const SizedBox.shrink();
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (ubicacion != null) ...[
              Text('Ubicación: $ubicacion',
                  style:
                      AppTextStyles.small.copyWith(color: AppColors.gray500)),
              const SizedBox(height: 4),
            ],
            if (descripcion != null)
              Text(descripcion,
                  style: AppTextStyles.bodyRegular
                      .copyWith(color: AppColors.gray600)),
          ],
        );
      },
    );
  }
}

class _SeveridadBadge extends StatelessWidget {
  const _SeveridadBadge({required this.severidad});
  final IncidenciaSeveridad severidad;

  @override
  Widget build(BuildContext context) {
    final (color, bg, label) = switch (severidad) {
      IncidenciaSeveridad.bajo => (
          AppColors.successText,
          const Color(0xFFD1FAE5),
          'Baja'
        ),
      IncidenciaSeveridad.media => (
          AppColors.warningText,
          AppColors.warningBg,
          'Media'
        ),
      IncidenciaSeveridad.alta => (
          AppColors.attentionText,
          AppColors.attentionBg,
          'Alta'
        ),
      IncidenciaSeveridad.critica => (
          AppColors.dangerText,
          AppColors.dangerBg,
          'Crítica'
        ),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(label, style: AppTextStyles.badge.copyWith(color: color)),
    );
  }
}

class _SuccessToast extends StatelessWidget {
  const _SuccessToast({required this.onClose});
  final VoidCallback onClose;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: 0,
      left: 0,
      right: 0,
      child: Material(
        color: Colors.transparent,
        child: Container(
          margin: const EdgeInsets.all(16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.primary,
            borderRadius: BorderRadius.circular(12),
            boxShadow: const [
              BoxShadow(
                color: Color(0x33000000),
                blurRadius: 12,
                offset: Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.check_circle_outline,
                  color: AppColors.white, size: 22),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Reporte creado exitosamente',
                        style: AppTextStyles.bodySemibold
                            .copyWith(color: AppColors.white)),
                    const SizedBox(height: 4),
                    Text(
                        'El reporte entrará en gestión, gracias por tu reporte',
                        style: AppTextStyles.small
                            .copyWith(color: AppColors.white)),
                  ],
                ),
              ),
              GestureDetector(
                onTap: onClose,
                child: const Icon(Icons.close,
                    color: AppColors.white, size: 18),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
