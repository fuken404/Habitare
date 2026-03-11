import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:habitare/core/network/api_client.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/features/auth/presentation/providers/auth_provider.dart';
import 'package:habitare/features/incidents/presentation/providers/incidents_provider.dart';

class ReportIncidentScreen extends ConsumerStatefulWidget {
  const ReportIncidentScreen({super.key});

  @override
  ConsumerState<ReportIncidentScreen> createState() =>
      _ReportIncidentScreenState();
}

class _ReportIncidentScreenState extends ConsumerState<ReportIncidentScreen> {
  final _formKey = GlobalKey<FormState>();
  final _tituloCtrl = TextEditingController();
  final _descripcionCtrl = TextEditingController();
  final _lugarCtrl = TextEditingController();
  String? _tipoId;
  bool _isUrgent = false;
  bool _isLoading = false;
  String? _errorMsg;

  @override
  void dispose() {
    _tituloCtrl.dispose();
    _descripcionCtrl.dispose();
    _lugarCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_tipoId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Selecciona el tipo de novedad')),
      );
      return;
    }

    final unidadId = ref.read(authProvider).user?.unidadId;
    setState(() { _isLoading = true; _errorMsg = null; });

    try {
      final res = await ApiClient.instance.post('/incidents', data: {
        'tipo_id': _tipoId,
        'titulo': _tituloCtrl.text.trim(),
        'descripcion': _descripcionCtrl.text.trim(),
        'ubicacion': _lugarCtrl.text.trim().isEmpty ? null : _lugarCtrl.text.trim(),
        'severidad': _isUrgent ? 'critica' : 'media',
        if (unidadId != null) 'unidad_id': unidadId,
      });
      final radicado = (res.data as Map<String, dynamic>)['numero_radicado'] as String?;
      if (!mounted) return;
      context.pushReplacement('/incidents/success', extra: radicado);
    } on DioException catch (e) {
      final data = e.response?.data;
      String msg = 'Error al enviar el reporte';
      if (data is Map) {
        final detail = data['detail'];
        if (detail is String) msg = detail;
      }
      setState(() => _errorMsg = msg);
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final tiposAsync = ref.watch(tiposIncidenteProvider);

    return Scaffold(
      backgroundColor: AppColors.scaffold,
      appBar: AppBar(
        title: Text('Reportar Novedad', style: AppTextStyles.heading2),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Tipo de novedad', style: AppTextStyles.smallSemibold),
              const SizedBox(height: 8),
              tiposAsync.when(
                loading: () => const SizedBox(
                  height: 44,
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
                      setState(() => _tipoId = tipos.first.id);
                    });
                  }
                  return Container(
                    height: 44,
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.gray300),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _tipoId,
                        hint: Text('Selecciona el tipo',
                            style: AppTextStyles.placeholder),
                        isExpanded: true,
                        style: AppTextStyles.bodyRegular,
                        items: tipos
                            .map((t) => DropdownMenuItem(
                                  value: t.id,
                                  child: Text(t.nombre),
                                ))
                            .toList(),
                        onChanged: (v) => setState(() => _tipoId = v),
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 20),

              Text('Título', style: AppTextStyles.smallSemibold),
              const SizedBox(height: 8),
              TextFormField(
                controller: _tituloCtrl,
                textCapitalization: TextCapitalization.sentences,
                style: AppTextStyles.bodyRegular,
                decoration: const InputDecoration(
                  hintText: 'Ej: Fuga de agua en pasillo',
                ),
                validator: (v) => (v == null || v.trim().isEmpty)
                    ? 'Ingresa un título'
                    : null,
              ),
              const SizedBox(height: 20),

              Text('Lugar / Ubicación', style: AppTextStyles.smallSemibold),
              const SizedBox(height: 8),
              TextFormField(
                controller: _lugarCtrl,
                textCapitalization: TextCapitalization.sentences,
                style: AppTextStyles.bodyRegular,
                decoration: const InputDecoration(
                  hintText: 'Ej: Parqueadero piso -1, zona B',
                  prefixIcon: Icon(Icons.location_on_outlined,
                      size: 20, color: AppColors.gray500),
                ),
                validator: (v) => (v == null || v.trim().isEmpty)
                    ? 'Ingresa el lugar'
                    : null,
              ),
              const SizedBox(height: 20),

              Text('Descripción', style: AppTextStyles.smallSemibold),
              const SizedBox(height: 8),
              TextFormField(
                controller: _descripcionCtrl,
                maxLines: 4,
                textCapitalization: TextCapitalization.sentences,
                style: AppTextStyles.bodyRegular,
                decoration: const InputDecoration(
                  hintText:
                      'Describe la novedad con el mayor detalle posible...',
                  alignLabelWithHint: true,
                  contentPadding:
                      EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                ),
                validator: (v) {
                  if (v == null || v.trim().isEmpty) {
                    return 'Ingresa la descripción';
                  }
                  if (v.trim().length < 20) {
                    return 'La descripción debe tener al menos 20 caracteres';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 20),

              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                      color: _isUrgent
                          ? AppColors.dangerText.withValues(alpha: 0.4)
                          : AppColors.gray200),
                ),
                child: Row(
                  children: [
                    Icon(Icons.priority_high_rounded,
                        size: 20,
                        color: _isUrgent
                            ? AppColors.dangerText
                            : AppColors.gray400),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Urgente', style: AppTextStyles.bodyMedium),
                          Text('Requiere atención inmediata',
                              style: AppTextStyles.small
                                  .copyWith(color: AppColors.gray500)),
                        ],
                      ),
                    ),
                    Switch(
                      value: _isUrgent,
                      onChanged: (v) => setState(() => _isUrgent = v),
                      activeThumbColor: AppColors.dangerText,
                    ),
                  ],
                ),
              ),
              if (_errorMsg != null) ...[
                const SizedBox(height: 12),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.dangerBg,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(_errorMsg!,
                      style: AppTextStyles.small
                          .copyWith(color: AppColors.dangerText)),
                ),
              ],
              const SizedBox(height: 32),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.dangerText,
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: AppColors.white),
                        )
                      : const Text('Enviar Reporte'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
