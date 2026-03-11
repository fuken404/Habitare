import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:habitare/core/network/api_client.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/features/auth/presentation/providers/auth_provider.dart';
import 'package:habitare/features/common_areas/domain/common_area_model.dart';
import 'package:habitare/features/common_areas/presentation/providers/common_areas_provider.dart';

// label → (hora_inicio, hora_fin) en formato HH:MM:SS
const _timeSlots = {
  '8:00 - 10:00':  ('08:00:00', '10:00:00'),
  '10:00 - 12:00': ('10:00:00', '12:00:00'),
  '12:00 - 14:00': ('12:00:00', '14:00:00'),
  '14:00 - 16:00': ('14:00:00', '16:00:00'),
  '16:00 - 18:00': ('16:00:00', '18:00:00'),
  '18:00 - 20:00': ('18:00:00', '20:00:00'),
};

class ReserveAreaScreen extends ConsumerStatefulWidget {
  const ReserveAreaScreen({super.key});

  @override
  ConsumerState<ReserveAreaScreen> createState() => _ReserveAreaScreenState();
}

class _ReserveAreaScreenState extends ConsumerState<ReserveAreaScreen> {
  CommonAreaModel? _selectedArea;
  DateTime? _selectedDate;
  String? _selectedSlot;
  bool _isLoading = false;
  String? _errorMsg;

  Future<void> _pickDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 30)),
    );
    if (date != null) setState(() => _selectedDate = date);
  }

  Future<void> _submit() async {
    if (_selectedArea == null || _selectedDate == null || _selectedSlot == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Completa todos los campos')),
      );
      return;
    }

    final unidadId = ref.read(authProvider).user?.unidadId;
    if (unidadId == null) {
      setState(() => _errorMsg = 'No se encontró la unidad del usuario');
      return;
    }

    setState(() { _isLoading = true; _errorMsg = null; });

    try {
      final slot = _timeSlots[_selectedSlot!]!;
      final fechaStr =
          '${_selectedDate!.year}-${_selectedDate!.month.toString().padLeft(2, '0')}-${_selectedDate!.day.toString().padLeft(2, '0')}';

      await ApiClient.instance.post('/common-areas/reservas', data: {
        'zona_comun_id': _selectedArea!.id,
        'unidad_id': unidadId,
        'fecha_reserva': fechaStr,
        'hora_inicio': slot.$1,
        'hora_fin': slot.$2,
      });

      ref.invalidate(reservasProvider);
      if (!mounted) return;
      context.pushReplacement('/common-areas/success');
    } on DioException catch (e) {
      final data = e.response?.data;
      setState(() {
        _errorMsg = data is Map
            ? (data['detail'] ?? 'Error al crear la reserva')
            : 'Error al crear la reserva';
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final areasAsync = ref.watch(commonAreasProvider);

    return Scaffold(
      backgroundColor: AppColors.scaffold,
      appBar: AppBar(
        title: Text('Reservar Zona Común', style: AppTextStyles.heading2),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: areasAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(
              strokeWidth: 2, color: AppColors.primary),
        ),
        error: (e, _) => Center(
          child: Text('No se pudieron cargar las zonas',
              style: AppTextStyles.body.copyWith(color: AppColors.gray500)),
        ),
        data: (areas) {
          final activeAreas = areas.where((a) => a.isActiva).toList();
          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Selecciona la zona', style: AppTextStyles.smallSemibold),
                const SizedBox(height: 12),
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate:
                      const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                    childAspectRatio: 1.5,
                  ),
                  itemCount: activeAreas.length,
                  itemBuilder: (context, i) {
                    final area = activeAreas[i];
                    final isSelected = _selectedArea?.id == area.id;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedArea = area),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppColors.primary
                              : AppColors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isSelected
                                ? AppColors.primary
                                : AppColors.gray200,
                          ),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.meeting_room_outlined,
                                size: 24,
                                color: isSelected
                                    ? AppColors.white
                                    : AppColors.successBtn),
                            const SizedBox(height: 6),
                            Text(
                              area.nombre,
                              style: AppTextStyles.badge.copyWith(
                                color: isSelected
                                    ? AppColors.white
                                    : AppColors.gray900,
                              ),
                              textAlign: TextAlign.center,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
                if (_selectedArea != null && _selectedArea!.capacidadMaxima != null) ...[
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.info2Bg,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.people_outline_rounded,
                            size: 14, color: AppColors.primary),
                        const SizedBox(width: 4),
                        Text(
                          'Capacidad: ${_selectedArea!.capacidadMaxima} personas',
                          style: AppTextStyles.small
                              .copyWith(color: AppColors.primary),
                        ),
                        if (_selectedArea!.requiereAprobacion) ...[
                          const SizedBox(width: 12),
                          const Icon(Icons.approval_outlined,
                              size: 14, color: AppColors.primary),
                          const SizedBox(width: 4),
                          Text('Requiere aprobación',
                              style: AppTextStyles.small
                                  .copyWith(color: AppColors.primary)),
                        ],
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: 24),

                Text('Fecha de reserva', style: AppTextStyles.smallSemibold),
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

                Text('Franja horaria', style: AppTextStyles.smallSemibold),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _timeSlots.keys.map((slot) {
                    final isSelected = _selectedSlot == slot;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedSlot = slot),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppColors.successBtn
                              : AppColors.white,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: isSelected
                                ? AppColors.successBtn
                                : AppColors.gray200,
                          ),
                        ),
                        child: Text(slot,
                            style: AppTextStyles.badge.copyWith(
                              color: isSelected
                                  ? AppColors.white
                                  : AppColors.gray900,
                            )),
                      ),
                    );
                  }).toList(),
                ),
                if (_errorMsg != null) ...[
                  const SizedBox(height: 16),
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
                      backgroundColor: AppColors.successBtn,
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: AppColors.white),
                          )
                        : const Text('Confirmar Reserva'),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
