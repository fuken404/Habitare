import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:habitare/core/network/api_client.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/features/auth/presentation/providers/auth_provider.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/features/visitors/domain/visitor_model.dart';
import 'package:habitare/features/visitors/presentation/providers/visitors_provider.dart';

class VisitorDetailScreen extends ConsumerStatefulWidget {
  const VisitorDetailScreen({super.key, required this.visitor});
  final VisitorModel visitor;

  @override
  ConsumerState<VisitorDetailScreen> createState() =>
      _VisitorDetailScreenState();
}

class _VisitorDetailScreenState extends ConsumerState<VisitorDetailScreen> {
  bool _isCancelling = false;
  bool _isReauthorizing = false;

  bool get _isVigente => widget.visitor.status == VisitorStatus.vigente;

  String get _authCode =>
      'HAB-${widget.visitor.doc.replaceAll(RegExp(r'[^0-9]'), '').substring(0, 6)}-${widget.visitor.id.toUpperCase()}';

  Future<void> _cancelarAutorizacion() async {
    setState(() => _isCancelling = true);
    try {
      await ApiClient.instance
          .delete('/visitors/autorizaciones/${widget.visitor.id}');
      ref.invalidate(visitorsProvider);
      if (!mounted) return;
      context.pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Autorización cancelada'),
          backgroundColor: AppColors.dangerText,
        ),
      );
    } on DioException catch (e) {
      if (!mounted) return;
      final data = e.response?.data;
      final detail = data is Map ? (data['detail'] ?? 'Error al cancelar') : 'Error al cancelar';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(detail), backgroundColor: AppColors.dangerText),
      );
    } finally {
      if (mounted) setState(() => _isCancelling = false);
    }
  }

  Future<void> _reautorizarConFecha() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
    );
    if (date == null || !mounted) return;

    setState(() => _isReauthorizing = true);
    try {
      final docParts = widget.visitor.doc.split(' ');
      final tipoDoc = docParts.isNotEmpty ? docParts[0] : 'CC';
      final nDoc = docParts.length > 1 ? docParts[1] : widget.visitor.doc;
      final nameParts = widget.visitor.name.trim().split(' ');
      final nombre = nameParts.isNotEmpty ? nameParts[0] : widget.visitor.name;
      final apellido = nameParts.length > 1 ? nameParts.sublist(1).join(' ') : null;
      final unidadId = ref.read(authProvider).user?.unidadId;
      if (unidadId == null) throw Exception('Unidad no encontrada');

      final fechaStr =
          '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';

      await ApiClient.instance.post('/visitors/autorizaciones', data: {
        'visitante': {
          'tipo_documento': tipoDoc,
          'n_documento': nDoc,
          'nombre': nombre,
          if (apellido != null) 'apellido': apellido,
        },
        'unidad_id': unidadId,
        'fecha_visita': fechaStr,
        'requiere_parqueadero': widget.visitor.hasParking,
        'vehiculos': [],
      });

      ref.invalidate(visitorsProvider);
      if (!mounted) return;
      context.pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Autorización creada exitosamente'),
          backgroundColor: AppColors.successBtn,
        ),
      );
    } on DioException catch (e) {
      if (!mounted) return;
      final data = e.response?.data;
      final detail = data is Map ? (data['detail'] ?? 'Error al autorizar') : 'Error al autorizar';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(detail), backgroundColor: AppColors.dangerText),
      );
    } finally {
      if (mounted) setState(() => _isReauthorizing = false);
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
            // ── Card: Visitante ───────────────────────────────────────────────
            _VisitorHeaderCard(visitor: visitor, isVigente: _isVigente),
            const SizedBox(height: 12),

            // ── Card: Detalles de visita ──────────────────────────────────────
            _InfoCard(visitor: visitor),
            const SizedBox(height: 12),

            // ── Card: QR de autorización ──────────────────────────────────────
            _QRCard(
              authCode: _authCode,
              isVigente: _isVigente,
            ),
            const SizedBox(height: 24),

            // ── Acciones ─────────────────────────────────────────────────────
            if (_isVigente) ...[
              _ActionButton(
                label: _isCancelling ? 'Cancelando...' : 'Cancelar Autorización',
                icon: Icons.cancel_outlined,
                color: AppColors.white,
                foreground: AppColors.dangerText,
                border: AppColors.dangerText,
                onTap: _isCancelling
                    ? null
                    : () => _showConfirmDialog(
                          context,
                          title: 'Cancelar autorización',
                          message:
                              '¿Estás seguro de que quieres cancelar la autorización de ${visitor.name}? El QR dejará de ser válido.',
                          confirmLabel: 'Cancelar autorización',
                          confirmColor: AppColors.dangerText,
                          onConfirm: _cancelarAutorizacion,
                        ),
              ),
            ] else ...[
              _ActionButton(
                label: _isReauthorizing ? 'Autorizando...' : 'Volver a Autorizar',
                icon: Icons.refresh_rounded,
                color: AppColors.primary,
                foreground: AppColors.white,
                onTap: _isReauthorizing ? null : _reautorizarConFecha,
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _showConfirmDialog(
    BuildContext context, {
    required String title,
    required String message,
    required String confirmLabel,
    required Color confirmColor,
    required VoidCallback onConfirm,
  }) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title, style: AppTextStyles.heading3),
        content: Text(message, style: AppTextStyles.body),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child:
                Text('Cancelar', style: TextStyle(color: AppColors.gray500)),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              onConfirm();
            },
            child: Text(confirmLabel,
                style: TextStyle(color: confirmColor,
                    fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }
}

// ── Card: Header visitante ─────────────────────────────────────────────────────
class _VisitorHeaderCard extends StatelessWidget {
  const _VisitorHeaderCard(
      {required this.visitor, required this.isVigente});
  final VisitorModel visitor;
  final bool isVigente;

  String get _initials {
    final parts = visitor.name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return parts[0][0].toUpperCase();
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
          // Avatar con iniciales
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
                Text(visitor.name, style: AppTextStyles.bodySemibold),
                const SizedBox(height: 2),
                Text(visitor.doc,
                    style: AppTextStyles.small
                        .copyWith(color: AppColors.gray500)),
              ],
            ),
          ),
          // Badge de estado
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: isVigente
                  ? AppColors.info2Bg
                  : AppColors.gray100,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              isVigente ? 'Vigente' : 'Historial',
              style: AppTextStyles.badge.copyWith(
                color: isVigente
                    ? AppColors.primary
                    : AppColors.gray500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Card: Info de visita ───────────────────────────────────────────────────────
class _InfoCard extends StatelessWidget {
  const _InfoCard({required this.visitor});
  final VisitorModel visitor;

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
            value: visitor.date,
          ),
          if (visitor.hasParking) ...[
            const _Divider(),
            _InfoRow(
              icon: Icons.local_parking_rounded,
              label: 'Parqueadero',
              value: 'Incluido',
              valueColor: AppColors.primary,
            ),
          ],
        ],
      ),
    );
  }
}

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
              style: AppTextStyles.small.copyWith(color: AppColors.gray500)),
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

// ── Card: QR de autorización ───────────────────────────────────────────────────
class _QRCard extends StatelessWidget {
  const _QRCard({required this.authCode, required this.isVigente});
  final String authCode;
  final bool isVigente;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isVigente ? AppColors.primary : AppColors.gray200,
          width: isVigente ? 1.5 : 1,
          // strokeAlign: BorderSide.strokeAlignInside,
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(
                isVigente
                    ? Icons.qr_code_2_rounded
                    : Icons.qr_code_2_rounded,
                size: 18,
                color: isVigente ? AppColors.primary : AppColors.gray400,
              ),
              const SizedBox(width: 6),
              Text(
                'QR de Autorización',
                style: AppTextStyles.smallSemibold.copyWith(
                  color: isVigente ? AppColors.primary : AppColors.gray500,
                ),
              ),
              const Spacer(),
              if (!isVigente)
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.gray100,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text('Expirado',
                      style: AppTextStyles.badge
                          .copyWith(color: AppColors.gray500)),
                ),
            ],
          ),
          const SizedBox(height: 20),

          // QR Code
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.gray200),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(7),
              child: ColorFiltered(
                colorFilter: isVigente
                    ? const ColorFilter.mode(
                        Colors.transparent, BlendMode.multiply)
                    : const ColorFilter.matrix([
                        0.2126, 0.7152, 0.0722, 0, 0,
                        0.2126, 0.7152, 0.0722, 0, 0,
                        0.2126, 0.7152, 0.0722, 0, 0,
                        0,      0,      0,      1, 0,
                      ]),
                child: QrImageView(
                  data: authCode,
                  version: QrVersions.auto,
                  size: 199,
                  backgroundColor: AppColors.white,
                  eyeStyle: QrEyeStyle(
                    eyeShape: QrEyeShape.square,
                    color: isVigente
                        ? AppColors.gray900
                        : AppColors.gray400,
                  ),
                  dataModuleStyle: QrDataModuleStyle(
                    dataModuleShape: QrDataModuleShape.square,
                    color: isVigente
                        ? AppColors.gray900
                        : AppColors.gray400,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Código de autorización
          GestureDetector(
            onTap: isVigente
                ? () {
                    Clipboard.setData(ClipboardData(text: authCode));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Código copiado al portapapeles'),
                        duration: Duration(seconds: 2),
                      ),
                    );
                  }
                : null,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: isVigente ? AppColors.info2Bg : AppColors.gray100,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Flexible(
                    child: Text(
                      authCode,
                      overflow: TextOverflow.ellipsis,
                      style: AppTextStyles.badge.copyWith(
                        color:
                            isVigente ? AppColors.primary : AppColors.gray400,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ),
                  if (isVigente) ...[
                    const SizedBox(width: 8),
                    Icon(Icons.copy_rounded,
                        size: 14, color: AppColors.primary),
                  ],
                ],
              ),
            ),
          ),

          if (isVigente) ...[
            const SizedBox(height: 12),
            Text(
              'Muestra este QR al ingresar al conjunto',
              style: AppTextStyles.small.copyWith(color: AppColors.gray400),
              textAlign: TextAlign.center,
            ),
          ],
        ],
      ),
    );
  }
}

// ── Botón de acción ───────────────────────────────────────────────────────────
class _ActionButton extends StatelessWidget {
  const _ActionButton({
    required this.label,
    required this.icon,
    required this.color,
    required this.foreground,
    required this.onTap,
    this.border,
  });
  final String label;
  final IconData icon;
  final Color color;
  final Color foreground;
  final Color? border;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: ElevatedButton.icon(
        onPressed: onTap,
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          foregroundColor: foreground,
          elevation: 0,
          side: border != null
              ? BorderSide(color: border!)
              : BorderSide(color: color),
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12)),
          textStyle: AppTextStyles.bodyLarge,
        ),
        icon: Icon(icon, size: 20),
        label: Text(label),
      ),
    );
  }
}
