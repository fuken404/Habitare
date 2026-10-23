import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/features/external_personnel/data/models/ingreso_externo_model.dart';
import 'package:habitare/features/external_personnel/presentation/providers/external_personnel_providers.dart';
import 'package:intl/intl.dart';

const _tipos = [
  'mantenimiento',
  'limpieza',
  'mensajeria',
  'proveedor',
  'contratista',
  'otro',
];

const _tipoLabels = {
  'mantenimiento': 'Mantenimiento',
  'limpieza': 'Limpieza',
  'mensajeria': 'Mensajería',
  'proveedor': 'Proveedor',
  'contratista': 'Contratista',
  'otro': 'Otro',
};

class ExternalPersonnelScreen extends ConsumerStatefulWidget {
  const ExternalPersonnelScreen({super.key});

  @override
  ConsumerState<ExternalPersonnelScreen> createState() =>
      _ExternalPersonnelScreenState();
}

class _ExternalPersonnelScreenState
    extends ConsumerState<ExternalPersonnelScreen> {
  bool _showForm = false;
  final _formKey = GlobalKey<FormState>();
  final _nombreCtrl = TextEditingController();
  final _motivoCtrl = TextEditingController();
  final _empresaCtrl = TextEditingController();
  String _tipoPersonal = 'contratista';
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _nombreCtrl.dispose();
    _motivoCtrl.dispose();
    _empresaCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; });
    try {
      await registrarIngresoExterno(
        nombre: _nombreCtrl.text.trim(),
        motivo: _motivoCtrl.text.trim(),
        tipoPersonal: _tipoPersonal,
        empresa: _empresaCtrl.text.trim(),
      );
      if (!mounted) return;
      _nombreCtrl.clear();
      _motivoCtrl.clear();
      _empresaCtrl.clear();
      setState(() { _showForm = false; });
      ref.invalidate(ingresosExternosProvider);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Ingreso registrado exitosamente')),
      );
    } on DioException catch (e) {
      final detail = (e.response?.data as Map?)?['detail'];
      setState(() => _error = detail is String ? detail : 'Error al registrar el ingreso');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final ingresosAsync = ref.watch(ingresosExternosProvider);

    return Scaffold(
      backgroundColor: AppColors.scaffold,
      appBar: AppBar(
        title: Text('Servicios Externos', style: AppTextStyles.heading2),
        actions: [
          IconButton(
            icon: Icon(_showForm ? Icons.list_rounded : Icons.add_rounded,
                color: AppColors.primary),
            onPressed: () => setState(() => _showForm = !_showForm),
          ),
        ],
      ),
      body: _showForm ? _buildForm() : _buildList(ingresosAsync),
    );
  }

  Widget _buildForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Registrar ingreso', style: AppTextStyles.heading3),
            const SizedBox(height: 20),

            Text('Tipo de servicio', style: AppTextStyles.smallSemibold),
            const SizedBox(height: 8),
            Container(
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
                  value: _tipoPersonal,
                  isExpanded: true,
                  style: AppTextStyles.bodyRegular,
                  items: _tipos
                      .map((t) => DropdownMenuItem(
                            value: t,
                            child: Text(_tipoLabels[t] ?? t),
                          ))
                      .toList(),
                  onChanged: (v) => setState(() => _tipoPersonal = v!),
                ),
              ),
            ),
            const SizedBox(height: 20),

            Text('Nombre', style: AppTextStyles.smallSemibold),
            const SizedBox(height: 8),
            TextFormField(
              controller: _nombreCtrl,
              textCapitalization: TextCapitalization.words,
              style: AppTextStyles.bodyRegular,
              decoration: const InputDecoration(hintText: 'Nombre completo'),
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Ingresa el nombre' : null,
            ),
            const SizedBox(height: 20),

            Text('Empresa (opcional)', style: AppTextStyles.smallSemibold),
            const SizedBox(height: 8),
            TextFormField(
              controller: _empresaCtrl,
              textCapitalization: TextCapitalization.words,
              style: AppTextStyles.bodyRegular,
              decoration: const InputDecoration(hintText: 'Nombre de la empresa'),
            ),
            const SizedBox(height: 20),

            Text('Motivo', style: AppTextStyles.smallSemibold),
            const SizedBox(height: 8),
            TextFormField(
              controller: _motivoCtrl,
              maxLines: 3,
              textCapitalization: TextCapitalization.sentences,
              style: AppTextStyles.bodyRegular,
              decoration: const InputDecoration(
                hintText: 'Motivo del ingreso',
                alignLabelWithHint: true,
                contentPadding:
                    EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              ),
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Ingresa el motivo' : null,
            ),

            if (_error != null) ...[
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.dangerBg,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(_error!,
                    style: AppTextStyles.small
                        .copyWith(color: AppColors.dangerText)),
              ),
            ],
            const SizedBox(height: 32),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _loading ? null : _submit,
                child: _loading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: AppColors.white),
                      )
                    : const Text('Registrar ingreso'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildList(AsyncValue<List<IngresoExternoModel>> ingresosAsync) {
    return ingresosAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, __) => Center(
        child: Text('Error al cargar los ingresos',
            style: AppTextStyles.bodyRegular.copyWith(color: AppColors.dangerText)),
      ),
      data: (ingresos) {
        if (ingresos.isEmpty) {
          return Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.engineering_outlined,
                    size: 48, color: AppColors.gray400),
                const SizedBox(height: 12),
                Text('Sin ingresos registrados',
                    style: AppTextStyles.bodyRegular
                        .copyWith(color: AppColors.gray500)),
              ],
            ),
          );
        }
        return RefreshIndicator(
          onRefresh: () async => ref.invalidate(ingresosExternosProvider),
          child: ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: ingresos.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (_, i) => _IngresoCard(ingreso: ingresos[i]),
          ),
        );
      },
    );
  }
}

class _IngresoCard extends StatelessWidget {
  const _IngresoCard({required this.ingreso});
  final IngresoExternoModel ingreso;

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat('dd/MM/yy · hh:mm a', 'es');
    return Container(
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
              Expanded(
                child: Text(ingreso.nombre,
                    style: AppTextStyles.bodyMedium,
                    overflow: TextOverflow.ellipsis),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: ingreso.tieneSalida
                      ? AppColors.gray100
                      : const Color(0xFFD1FAE5),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  ingreso.tieneSalida ? 'Salida' : 'Activo',
                  style: AppTextStyles.small.copyWith(
                    color: ingreso.tieneSalida
                        ? AppColors.gray500
                        : AppColors.successBtn,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          if (ingreso.empresa != null) ...[
            const SizedBox(height: 4),
            Text(ingreso.empresa!,
                style: AppTextStyles.small
                    .copyWith(color: AppColors.gray500)),
          ],
          const SizedBox(height: 6),
          Text(ingreso.motivo,
              style: AppTextStyles.small.copyWith(color: AppColors.gray600)),
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(Icons.login_rounded, size: 13, color: AppColors.gray400),
              const SizedBox(width: 4),
              Text(
                fmt.format(DateTime.parse(ingreso.fechaHoraIngreso).toLocal()),
                style: AppTextStyles.small
                    .copyWith(color: AppColors.gray400),
              ),
              if (ingreso.fechaHoraSalida != null) ...[
                const SizedBox(width: 12),
                Icon(Icons.logout_rounded, size: 13, color: AppColors.gray400),
                const SizedBox(width: 4),
                Text(
                  fmt.format(
                      DateTime.parse(ingreso.fechaHoraSalida!).toLocal()),
                  style: AppTextStyles.small
                      .copyWith(color: AppColors.gray400),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}
