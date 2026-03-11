import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:habitare/core/network/api_client.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/features/auth/presentation/providers/auth_provider.dart';
import 'package:habitare/features/visitors/presentation/providers/visitors_provider.dart';

class CreateVisitScreen extends ConsumerStatefulWidget {
  const CreateVisitScreen({super.key});

  @override
  ConsumerState<CreateVisitScreen> createState() => _CreateVisitScreenState();
}

class _CreateVisitScreenState extends ConsumerState<CreateVisitScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nombreCtrl = TextEditingController();
  final _apellidoCtrl = TextEditingController();
  final _docCtrl = TextEditingController();
  DateTime? _selectedDate;
  String _selectedDocType = 'CC';
  bool _needsParking = false;
  bool _isLoading = false;
  String? _errorMsg;

  static const _docTypes = ['CC', 'CE', 'TI', 'PA', 'OTRO'];

  @override
  void dispose() {
    _nombreCtrl.dispose();
    _apellidoCtrl.dispose();
    _docCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
    );
    if (date != null) setState(() => _selectedDate = date);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Selecciona la fecha de la visita')),
      );
      return;
    }

    final unidadId = ref.read(authProvider).user?.unidadId;
    if (unidadId == null) {
      setState(() => _errorMsg = 'No se encontró la unidad del usuario');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMsg = null;
    });

    try {
      final fechaStr =
          '${_selectedDate!.year}-${_selectedDate!.month.toString().padLeft(2, '0')}-${_selectedDate!.day.toString().padLeft(2, '0')}';

      await ApiClient.instance.post('/visitors/autorizaciones', data: {
        'visitante': {
          'tipo_documento': _selectedDocType,
          'n_documento': _docCtrl.text.trim(),
          'nombre': _nombreCtrl.text.trim(),
          'apellido': _apellidoCtrl.text.trim().isEmpty
              ? null
              : _apellidoCtrl.text.trim(),
        },
        'unidad_id': unidadId,
        'fecha_visita': fechaStr,
        'requiere_parqueadero': _needsParking,
        'vehiculos': [],
      });

      // Invalidar la lista para que recargue
      ref.invalidate(visitorsProvider);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Visitante autorizado exitosamente'),
          backgroundColor: AppColors.successBtn,
        ),
      );
      context.pop();
    } on DioException catch (e) {
      final data = e.response?.data;
      final detail = data is Map ? data['detail'] : null;
      setState(() {
        _errorMsg = detail is String ? detail : 'Error al guardar la autorización';
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffold,
      appBar: AppBar(
        title: Text('Autorizar Visitante', style: AppTextStyles.heading2),
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
              // ── Nombre ───────────────────────────────────────────────────
              Text('Nombre', style: AppTextStyles.smallSemibold),
              const SizedBox(height: 8),
              TextFormField(
                controller: _nombreCtrl,
                textCapitalization: TextCapitalization.words,
                style: AppTextStyles.bodyRegular,
                decoration: const InputDecoration(
                  hintText: 'Nombre del visitante',
                  prefixIcon:
                      Icon(Icons.person_outline, size: 20, color: AppColors.gray500),
                ),
                validator: (v) =>
                    (v == null || v.trim().isEmpty) ? 'Ingresa el nombre' : null,
              ),
              const SizedBox(height: 16),

              // ── Apellido ──────────────────────────────────────────────────
              Text('Apellido', style: AppTextStyles.smallSemibold),
              const SizedBox(height: 8),
              TextFormField(
                controller: _apellidoCtrl,
                textCapitalization: TextCapitalization.words,
                style: AppTextStyles.bodyRegular,
                decoration: const InputDecoration(
                  hintText: 'Apellido del visitante (opcional)',
                  prefixIcon:
                      Icon(Icons.person_outline, size: 20, color: AppColors.gray500),
                ),
              ),
              const SizedBox(height: 16),

              // ── Tipo y Número de Documento ────────────────────────────────
              Text('Documento', style: AppTextStyles.smallSemibold),
              const SizedBox(height: 8),
              Row(
                children: [
                  Container(
                    height: 44,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.gray300),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _selectedDocType,
                        style: AppTextStyles.bodyRegular,
                        items: _docTypes
                            .map((e) =>
                                DropdownMenuItem(value: e, child: Text(e)))
                            .toList(),
                        onChanged: (v) =>
                            setState(() => _selectedDocType = v!),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextFormField(
                      controller: _docCtrl,
                      keyboardType: TextInputType.number,
                      style: AppTextStyles.bodyRegular,
                      decoration: const InputDecoration(
                          hintText: 'Número de documento'),
                      validator: (v) => (v == null || v.trim().isEmpty)
                          ? 'Ingresa el documento'
                          : null,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // ── Fecha ─────────────────────────────────────────────────────
              Text('Fecha de visita', style: AppTextStyles.smallSemibold),
              const SizedBox(height: 8),
              GestureDetector(
                onTap: _pickDate,
                child: Container(
                  width: double.infinity,
                  height: 44,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: AppColors.white,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.gray300),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.calendar_today_outlined,
                          size: 18, color: AppColors.gray500),
                      const SizedBox(width: 10),
                      Text(
                        _selectedDate == null
                            ? 'Seleccionar fecha'
                            : '${_selectedDate!.day.toString().padLeft(2, '0')}/'
                                '${_selectedDate!.month.toString().padLeft(2, '0')}/'
                                '${_selectedDate!.year}',
                        style: _selectedDate == null
                            ? AppTextStyles.placeholder
                            : AppTextStyles.bodyRegular,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // ── Parqueadero ────────────────────────────────────────────────
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.gray200),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.local_parking_rounded,
                            size: 20, color: AppColors.primary),
                        const SizedBox(width: 10),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Parqueadero',
                                style: AppTextStyles.bodyMedium),
                            Text('El visitante ingresa en vehículo',
                                style: AppTextStyles.small
                                    .copyWith(color: AppColors.gray500)),
                          ],
                        ),
                      ],
                    ),
                    Switch(
                      value: _needsParking,
                      onChanged: (v) => setState(() => _needsParking = v),
                      activeThumbColor: AppColors.primary,
                    ),
                  ],
                ),
              ),

              // ── Error ─────────────────────────────────────────────────────
              if (_errorMsg != null) ...[
                const SizedBox(height: 16),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.dangerBg,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    _errorMsg!,
                    style:
                        AppTextStyles.small.copyWith(color: AppColors.dangerText),
                  ),
                ),
              ],

              const SizedBox(height: 32),

              // ── Botón ─────────────────────────────────────────────────────
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _submit,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: AppColors.white),
                        )
                      : const Text('Autorizar Visitante'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
