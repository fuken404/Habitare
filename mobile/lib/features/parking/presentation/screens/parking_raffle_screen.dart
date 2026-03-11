import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:habitare/core/network/api_client.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/core/utils/formatters.dart';
import 'package:habitare/features/parking/presentation/providers/parking_provider.dart';

const _tipoVehiculoMap = {
  'Carro': 'automovil',
  'Moto': 'motocicleta',
};

class ParkingRaffleScreen extends ConsumerStatefulWidget {
  const ParkingRaffleScreen({super.key});

  @override
  ConsumerState<ParkingRaffleScreen> createState() => _ParkingRaffleScreenState();
}

class _ParkingRaffleScreenState extends ConsumerState<ParkingRaffleScreen> {
  final _formKey = GlobalKey<FormState>();
  final _marcaCtrl = TextEditingController();
  final _modeloCtrl = TextEditingController();
  final _colorCtrl = TextEditingController();
  final _plateCtrl = TextEditingController();
  String? _selectedType;
  bool _isLoading = false;
  String? _errorMsg;

  final _vehicleTypes = [
    ('Carro', Icons.directions_car_outlined),
    ('Moto', Icons.two_wheeler_outlined),
  ];

  @override
  void dispose() {
    _marcaCtrl.dispose();
    _modeloCtrl.dispose();
    _colorCtrl.dispose();
    _plateCtrl.dispose();
    super.dispose();
  }

  Future<void> _inscribirse(String sorteoId) async {
    if (_selectedType == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Selecciona el tipo de vehículo')),
      );
      return;
    }
    if (!_formKey.currentState!.validate()) return;

    setState(() { _isLoading = true; _errorMsg = null; });

    try {
      await ApiClient.instance.post('/parking/sorteos/$sorteoId/inscribirse', data: {
        'tipo_vehiculo': _tipoVehiculoMap[_selectedType!],
        'placa': _plateCtrl.text.trim().toUpperCase(),
        'marca': _marcaCtrl.text.trim().isEmpty ? null : _marcaCtrl.text.trim(),
        'modelo': _modeloCtrl.text.trim().isEmpty ? null : _modeloCtrl.text.trim(),
        'color': _colorCtrl.text.trim().isEmpty ? null : _colorCtrl.text.trim(),
      });
      ref.invalidate(sorteoActivoProvider);
    } on DioException catch (e) {
      final data = e.response?.data;
      String msg = 'Error al inscribirse';
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
    final sorteoAsync = ref.watch(sorteoActivoProvider);

    return Scaffold(
      backgroundColor: AppColors.scaffold,
      appBar: AppBar(
        title: Text('Sorteo Parqueadero', style: AppTextStyles.heading2),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, size: 20),
          onPressed: () => context.canPop() ? context.pop() : context.go('/more'),
        ),
      ),
      body: sorteoAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.purpleText),
        ),
        error: (_, __) => _NoSorteo(),
        data: (sorteo) {
          if (sorteo == null) return _NoSorteo();
          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: sorteo.yaInscrito
                ? _SuccessState(sorteo: sorteo)
                : _buildForm(sorteo),
          );
        },
      ),
    );
  }

  Widget _buildForm(SorteoActivoModel sorteo) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ── Info del sorteo ─────────────────────────────────────────────
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.purpleBg,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.local_parking_rounded,
                      color: AppColors.purpleText, size: 20),
                  const SizedBox(width: 8),
                  Text('Sorteo Mensual de Parqueadero',
                      style: AppTextStyles.bodySemibold
                          .copyWith(color: AppColors.purpleText)),
                ],
              ),
              const SizedBox(height: 10),
              _InfoRow(label: 'Cupos disponibles', value: '${sorteo.nCupos} parqueaderos'),
              const SizedBox(height: 4),
              _InfoRow(label: 'Inscritos', value: '${sorteo.nInscritos} residentes'),
              const SizedBox(height: 4),
              _InfoRow(label: 'Fecha del sorteo', value: formatDate(sorteo.fechaSorteo)),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // ── Tipo de vehículo ────────────────────────────────────────────
        Text('Tipo de vehículo', style: AppTextStyles.smallSemibold),
        const SizedBox(height: 10),
        Row(
          children: _vehicleTypes.map((t) {
            final isSelected = _selectedType == t.$1;
            return Expanded(
              child: GestureDetector(
                onTap: () => setState(() => _selectedType = t.$1),
                child: Container(
                  margin: EdgeInsets.only(
                      right: t.$1 == _vehicleTypes.first.$1 ? 8 : 0),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.purpleText : AppColors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                        color: isSelected
                            ? AppColors.purpleText
                            : AppColors.gray200),
                  ),
                  child: Column(
                    children: [
                      Icon(t.$2,
                          size: 28,
                          color: isSelected ? AppColors.white : AppColors.gray500),
                      const SizedBox(height: 6),
                      Text(t.$1,
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: isSelected ? AppColors.white : AppColors.gray900,
                          )),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 24),

        // ── Datos del vehículo ──────────────────────────────────────────
        Text('Datos del vehículo', style: AppTextStyles.heading3),
        const SizedBox(height: 16),

        Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Placa', style: AppTextStyles.smallSemibold),
              const SizedBox(height: 8),
              TextFormField(
                controller: _plateCtrl,
                textCapitalization: TextCapitalization.characters,
                style: AppTextStyles.bodyRegular,
                decoration: const InputDecoration(
                  hintText: 'Ej: ABC 123',
                  prefixIcon: Icon(Icons.drive_eta_outlined,
                      size: 20, color: AppColors.gray500),
                ),
                validator: (v) => (v == null || v.trim().isEmpty)
                    ? 'Ingresa la placa'
                    : null,
              ),
              const SizedBox(height: 16),

              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Marca', style: AppTextStyles.smallSemibold),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _marcaCtrl,
                          textCapitalization: TextCapitalization.words,
                          style: AppTextStyles.bodyRegular,
                          decoration: const InputDecoration(hintText: 'Ej: Chevrolet'),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Modelo', style: AppTextStyles.smallSemibold),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _modeloCtrl,
                          textCapitalization: TextCapitalization.words,
                          style: AppTextStyles.bodyRegular,
                          decoration: const InputDecoration(hintText: 'Ej: Spark'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              Text('Color', style: AppTextStyles.smallSemibold),
              const SizedBox(height: 8),
              TextFormField(
                controller: _colorCtrl,
                textCapitalization: TextCapitalization.words,
                style: AppTextStyles.bodyRegular,
                decoration: const InputDecoration(hintText: 'Ej: Blanco'),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),

        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.infoBg,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.info_outline_rounded,
                  size: 16, color: AppColors.infoText),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'La inscripción al sorteo es válida para el período indicado. El resultado será notificado vía app.',
                  style: AppTextStyles.small.copyWith(color: AppColors.infoText),
                ),
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
                style: AppTextStyles.small.copyWith(color: AppColors.dangerText)),
          ),
        ],
        const SizedBox(height: 32),

        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _isLoading ? null : () => _inscribirse(sorteo.id),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.purpleText,
            ),
            child: _isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: AppColors.white),
                  )
                : const Text('Inscribirme al Sorteo'),
          ),
        ),
      ],
    );
  }
}

class _NoSorteo extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.local_parking_rounded,
              size: 56, color: AppColors.gray300),
          const SizedBox(height: 16),
          Text('No hay sorteos programados',
              style: AppTextStyles.body.copyWith(color: AppColors.gray500)),
          const SizedBox(height: 8),
          Text('La administración publicará el próximo sorteo próximamente.',
              style: AppTextStyles.small.copyWith(color: AppColors.gray400),
              textAlign: TextAlign.center),
        ],
      ),
    );
  }
}

class _SuccessState extends StatelessWidget {
  const _SuccessState({required this.sorteo});
  final SorteoActivoModel sorteo;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 32),
        Container(
          width: 96,
          height: 96,
          decoration: BoxDecoration(
            color: AppColors.purpleBg,
            borderRadius: BorderRadius.circular(48),
          ),
          child: const Icon(Icons.check_circle_outline_rounded,
              size: 52, color: AppColors.purpleText),
        ),
        const SizedBox(height: 24),
        Text('¡Ya estás inscrito!',
            style: AppTextStyles.heading1, textAlign: TextAlign.center),
        const SizedBox(height: 8),
        Text(
          'Tu inscripción en el sorteo de parqueadero está registrada.',
          style: AppTextStyles.body.copyWith(color: AppColors.gray500),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.purpleBg,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              _InfoRow(label: 'Inscritos', value: '${sorteo.nInscritos} residentes'),
              const SizedBox(height: 6),
              _InfoRow(label: 'Cupos', value: '${sorteo.nCupos} parqueaderos'),
              const SizedBox(height: 6),
              _InfoRow(label: 'Fecha del sorteo', value: formatDate(sorteo.fechaSorteo)),
              const SizedBox(height: 6),
              _InfoRow(label: 'Estado', value: 'Inscrito'),
            ],
          ),
        ),
        const SizedBox(height: 40),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () => context.go('/dashboard'),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.purpleText),
            child: const Text('Ir al inicio'),
          ),
        ),
      ],
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: AppTextStyles.small.copyWith(color: AppColors.gray600)),
        Text(value, style: AppTextStyles.smallSemibold),
      ],
    );
  }
}
