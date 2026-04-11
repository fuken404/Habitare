import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:habitare/core/network/api_client.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/features/security/domain/security_models.dart';
import 'package:habitare/features/security/presentation/providers/security_providers.dart';

class SecurityVisitorDetailScreen extends ConsumerStatefulWidget {
  const SecurityVisitorDetailScreen({super.key, required this.visitor});

  final SecurityVisitorApiModel visitor;

  @override
  ConsumerState<SecurityVisitorDetailScreen> createState() =>
      _SecurityVisitorDetailScreenState();
}

class _SecurityVisitorDetailScreenState
    extends ConsumerState<SecurityVisitorDetailScreen> {
  bool _isLoading = false;

  bool get _isVigente =>
      widget.visitor.status == SecurityVisitorStatus.vigente;

  bool get _yaIngreso => widget.visitor.estado == 'utilizada';

  Future<void> _marcarIngreso() async {
    // Si requiere parqueadero, mostrar modal primero
    if (widget.visitor.requiereParqueadero) {
      final vehiculo = await showModalBottomSheet<_VehiculoData>(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (_) => const _VehiculoModal(),
      );
      if (vehiculo == null) return; // usuario canceló
      await _registrarIngreso(
          tipoVehiculo: vehiculo.tipo, placa: vehiculo.placa);
    } else {
      await _registrarIngreso();
    }
  }

  Future<void> _registrarIngreso({
    String? tipoVehiculo,
    String? placa,
  }) async {
    setState(() => _isLoading = true);
    try {
      await ApiClient.instance.post('/visitors/ingresos', data: {
        'autorizacion_id': widget.visitor.id,
        if (tipoVehiculo != null) 'tipo_vehiculo': tipoVehiculo,
        if (placa != null) 'placa': placa,
      });
      if (!mounted) return;
      ref.invalidate(securityVisitorsProvider);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Ingreso registrado exitosamente'),
          backgroundColor: AppColors.successBtn,
        ),
      );
      context.pop();
    } on DioException catch (e) {
      final data = e.response?.data;
      String msg = 'No se pudo registrar el ingreso';
      if (data is Map) {
        final detail = data['detail'];
        if (detail is String) msg = detail;
      }
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(msg), backgroundColor: AppColors.dangerText),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final visitor = widget.visitor;

    return Scaffold(
      backgroundColor: AppColors.scaffold,
      appBar: AppBar(
        title: Text('Detalle de Visita', style: AppTextStyles.heading2),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        child: Column(
          children: [
            _VisitorHeaderCard(visitor: visitor, isVigente: _isVigente),
            const SizedBox(height: 12),
            _InfoCard(visitor: visitor),
            const SizedBox(height: 12),
            _InmuebleCard(visitor: visitor),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: (_isLoading || _yaIngreso || !_isVigente)
                    ? null
                    : _marcarIngreso,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: AppColors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  textStyle: AppTextStyles.bodyLarge,
                ),
                icon: _isLoading
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: AppColors.white),
                      )
                    : Icon(
                        _yaIngreso
                            ? Icons.check_circle_outline
                            : Icons.how_to_reg_outlined,
                        size: 20,
                      ),
                label: Text(_yaIngreso
                    ? 'Ingreso ya registrado'
                    : 'Marcar Ingreso'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Header card ───────────────────────────────────────────────────────────────

class _VisitorHeaderCard extends StatelessWidget {
  const _VisitorHeaderCard({required this.visitor, required this.isVigente});
  final SecurityVisitorApiModel visitor;
  final bool isVigente;

  String get _initials {
    final nombre = visitor.visitanteNombre.trim();
    final apellido = visitor.visitanteApellido?.trim() ?? '';
    if (apellido.isNotEmpty) {
      return '${nombre.isNotEmpty ? nombre[0] : ''}${apellido[0]}'
          .toUpperCase();
    }
    return nombre.isNotEmpty ? nombre[0].toUpperCase() : '?';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.gray200),
      ),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: AppColors.info2Bg,
              borderRadius: BorderRadius.circular(26),
            ),
            child: Center(
              child: Text(
                _initials,
                style: AppTextStyles.bodySemibold
                    .copyWith(color: AppColors.primary),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(visitor.nombreCompleto,
                    style: AppTextStyles.bodySemibold),
                const SizedBox(height: 2),
                Text(visitor.docCompleto,
                    style: AppTextStyles.small
                        .copyWith(color: AppColors.gray500)),
              ],
            ),
          ),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: isVigente ? AppColors.info2Bg : AppColors.gray100,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              isVigente ? 'Vigente' : 'Historial',
              style: AppTextStyles.badge.copyWith(
                color: isVigente ? AppColors.primary : AppColors.gray500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Info card ─────────────────────────────────────────────────────────────────

class _InfoCard extends StatelessWidget {
  const _InfoCard({required this.visitor});
  final SecurityVisitorApiModel visitor;

  @override
  Widget build(BuildContext context) {
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
          Text('Información de la visita',
              style: AppTextStyles.smallSemibold
                  .copyWith(color: AppColors.gray500)),
          const SizedBox(height: 12),
          _InfoRow(
            icon: Icons.calendar_today_outlined,
            label: 'Fecha',
            value: visitor.fechaFormateada,
          ),
          const _Divider(),
          _InfoRow(
            icon: Icons.local_parking_rounded,
            label: 'Parqueadero',
            value: visitor.requiereParqueadero ? 'Requerido' : 'No requerido',
            valueColor: visitor.requiereParqueadero
                ? AppColors.primary
                : AppColors.gray500,
          ),
          const _Divider(),
          _InfoRow(
            icon: Icons.info_outline_rounded,
            label: 'Estado',
            value: _estadoLabel(visitor.estado),
            valueColor: _estadoColor(visitor.estado),
          ),
        ],
      ),
    );
  }

  String _estadoLabel(String estado) {
    const labels = {
      'pendiente': 'Pendiente',
      'activa': 'Activa',
      'utilizada': 'Utilizada',
      'vencida': 'Vencida',
      'cancelada': 'Cancelada',
    };
    return labels[estado.toLowerCase()] ?? estado;
  }

  Color _estadoColor(String estado) {
    switch (estado.toLowerCase()) {
      case 'activa':
      case 'pendiente':
        return AppColors.primary;
      case 'utilizada':
        return AppColors.successText;
      case 'vencida':
      case 'cancelada':
        return AppColors.gray500;
      default:
        return AppColors.gray900;
    }
  }
}

// ── Inmueble card ─────────────────────────────────────────────────────────────

class _InmuebleCard extends StatelessWidget {
  const _InmuebleCard({required this.visitor});
  final SecurityVisitorApiModel visitor;

  @override
  Widget build(BuildContext context) {
    final unidad = visitor.numeroUnidad;
    final torre = visitor.nombreTorre;
    final autorizadoPor = visitor.nombreAutorizadoPor;

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
          Text('Datos del inmueble',
              style: AppTextStyles.smallSemibold
                  .copyWith(color: AppColors.gray500)),
          const SizedBox(height: 12),
          _InfoRow(
            icon: Icons.apartment_outlined,
            label: 'Torre',
            value: torre ?? '—',
          ),
          const _Divider(),
          _InfoRow(
            icon: Icons.door_front_door_outlined,
            label: 'Unidad',
            value: unidad ?? '—',
          ),
          const _Divider(),
          _InfoRow(
            icon: Icons.person_outline_rounded,
            label: 'Autorizado por',
            value: autorizadoPor ?? '—',
          ),
        ],
      ),
    );
  }
}

// ── Shared widgets ────────────────────────────────────────────────────────────

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
    this.valueColor,
  });
  final IconData icon;
  final String label;
  final String value;
  final Color? valueColor;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.gray400),
          const SizedBox(width: 10),
          Text(label,
              style:
                  AppTextStyles.small.copyWith(color: AppColors.gray500)),
          const Spacer(),
          Text(
            value,
            style: AppTextStyles.bodyMedium.copyWith(
              color: valueColor ?? AppColors.gray900,
            ),
          ),
        ],
      ),
    );
  }
}

class _Divider extends StatelessWidget {
  const _Divider();
  @override
  Widget build(BuildContext context) => const Divider(height: 1);
}

// ── Datos del vehículo ────────────────────────────────────────────────────────

class _VehiculoData {
  const _VehiculoData({required this.tipo, required this.placa});
  final String tipo;  // "carro" | "moto"
  final String placa;
}

// ── Modal de vehículo ─────────────────────────────────────────────────────────

class _VehiculoModal extends StatefulWidget {
  const _VehiculoModal();

  @override
  State<_VehiculoModal> createState() => _VehiculoModalState();
}

class _VehiculoModalState extends State<_VehiculoModal> {
  String _tipo = 'carro';
  final _placaController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _placaController.dispose();
    super.dispose();
  }

  void _confirmar() {
    if (!_formKey.currentState!.validate()) return;
    Navigator.of(context).pop(
      _VehiculoData(tipo: _tipo, placa: _placaController.text.trim().toUpperCase()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.viewInsetsOf(context).bottom;

    return Container(
      margin: const EdgeInsets.fromLTRB(12, 0, 12, 12),
      padding: EdgeInsets.fromLTRB(20, 20, 20, 20 + bottom),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Handle ──────────────────────────────────────────────────────
            Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.gray300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // ── Título ───────────────────────────────────────────────────────
            Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: AppColors.info2Bg,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.local_parking_rounded,
                      size: 20, color: AppColors.primary),
                ),
                const SizedBox(width: 10),
                Text('Datos del vehículo', style: AppTextStyles.heading3),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              'Se asignará un espacio automáticamente',
              style: AppTextStyles.small.copyWith(color: AppColors.gray500),
            ),
            const SizedBox(height: 20),

            // ── Tipo de vehículo ─────────────────────────────────────────────
            Text('Tipo de vehículo',
                style: AppTextStyles.smallSemibold
                    .copyWith(color: AppColors.gray500)),
            const SizedBox(height: 8),
            Row(
              children: [
                _TipoChip(
                  label: 'Carro',
                  icon: Icons.directions_car_outlined,
                  selected: _tipo == 'carro',
                  onTap: () => setState(() => _tipo = 'carro'),
                ),
                const SizedBox(width: 10),
                _TipoChip(
                  label: 'Moto',
                  icon: Icons.two_wheeler_outlined,
                  selected: _tipo == 'moto',
                  onTap: () => setState(() => _tipo = 'moto'),
                ),
              ],
            ),
            const SizedBox(height: 18),

            // ── Placa ────────────────────────────────────────────────────────
            Text('Placa',
                style: AppTextStyles.smallSemibold
                    .copyWith(color: AppColors.gray500)),
            const SizedBox(height: 8),
            TextFormField(
              controller: _placaController,
              textCapitalization: TextCapitalization.characters,
              style: AppTextStyles.bodyMedium,
              decoration: InputDecoration(
                hintText: 'Ej. ABC123',
                hintStyle:
                    AppTextStyles.body.copyWith(color: AppColors.gray400),
                prefixIcon: const Icon(Icons.pin_outlined,
                    size: 20, color: AppColors.gray400),
                filled: true,
                fillColor: AppColors.scaffold,
                contentPadding: const EdgeInsets.symmetric(
                    horizontal: 14, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: AppColors.gray200),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: AppColors.gray200),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide:
                      const BorderSide(color: AppColors.primary, width: 1.5),
                ),
                errorBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide:
                      const BorderSide(color: AppColors.dangerText),
                ),
              ),
              validator: (v) {
                if (v == null || v.trim().isEmpty) return 'Ingresa la placa';
                if (v.trim().length < 4) return 'Placa inválida';
                return null;
              },
            ),
            const SizedBox(height: 24),

            // ── Botones ──────────────────────────────────────────────────────
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.of(context).pop(),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.gray600,
                      side: const BorderSide(color: AppColors.gray200),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text('Cancelar',
                        style: AppTextStyles.bodyMedium
                            .copyWith(color: AppColors.gray600)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _confirmar,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: AppColors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text('Confirmar',
                        style: AppTextStyles.bodyMedium
                            .copyWith(color: AppColors.white)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _TipoChip extends StatelessWidget {
  const _TipoChip({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });
  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: selected ? AppColors.info2Bg : AppColors.scaffold,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: selected ? AppColors.primary : AppColors.gray200,
              width: selected ? 1.5 : 1,
            ),
          ),
          child: Column(
            children: [
              Icon(icon,
                  size: 24,
                  color:
                      selected ? AppColors.primary : AppColors.gray400),
              const SizedBox(height: 4),
              Text(
                label,
                style: AppTextStyles.bodyMedium.copyWith(
                  color: selected ? AppColors.primary : AppColors.gray500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
