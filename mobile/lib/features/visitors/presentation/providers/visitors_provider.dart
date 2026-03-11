import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:habitare/core/network/api_client.dart';
import 'package:habitare/features/auth/presentation/providers/auth_provider.dart';
import 'package:habitare/features/visitors/domain/visitor_model.dart';

class VisitorApiModel {
  final String id;
  final String nombre;
  final String? apellido;
  final String tipoDocumento;
  final String nDocumento;
  final String fechaVisita;
  final String estado;
  final String unidadId;
  final String? numeroUnidad;
  final bool requiereParqueadero;

  const VisitorApiModel({
    required this.id,
    required this.nombre,
    this.apellido,
    required this.tipoDocumento,
    required this.nDocumento,
    required this.fechaVisita,
    required this.estado,
    required this.unidadId,
    this.numeroUnidad,
    required this.requiereParqueadero,
  });

  factory VisitorApiModel.fromJson(Map<String, dynamic> json) {
    final visitante = json['visitante'] as Map<String, dynamic>? ?? json;
    return VisitorApiModel(
      id: json['id'] as String,
      nombre: visitante['nombre'] as String? ?? '',
      apellido: visitante['apellido'] as String?,
      tipoDocumento: visitante['tipo_documento'] as String? ?? 'CC',
      nDocumento: visitante['n_documento'] as String? ?? '',
      fechaVisita: json['fecha_visita'] as String? ?? '',
      estado: json['estado'] as String? ?? 'activa',
      unidadId: json['unidad_id'] as String? ?? '',
      numeroUnidad: json['numero_unidad'] as String?,
      requiereParqueadero: json['requiere_parqueadero'] as bool? ?? false,
    );
  }

  VisitorModel toVisitorModel() {
    bool isVigente = false;
    // Cancelada/utilizada → siempre historial
    if (estado != 'cancelada' && estado != 'utilizada') {
      final today = DateTime.now();
      final todayDate = DateTime(today.year, today.month, today.day);
      if (fechaVisita.isNotEmpty) {
        try {
          final dt = DateTime.parse(fechaVisita);
          final visitDate = DateTime(dt.year, dt.month, dt.day);
          isVigente = !visitDate.isBefore(todayDate);
        } catch (_) {}
      }
    }
    final nombreCompleto =
        apellido != null ? '$nombre $apellido' : nombre;
    return VisitorModel(
      id: id,
      name: nombreCompleto,
      doc: '$tipoDocumento $nDocumento',
      date: _formatDate(fechaVisita),
      unit: numeroUnidad ?? '-',
      hasParking: requiereParqueadero,
      status:
          isVigente ? VisitorStatus.vigente : VisitorStatus.historial,
    );
  }

  String _formatDate(String isoDate) {
    if (isoDate.isEmpty) return '';
    try {
      final dt = DateTime.parse(isoDate);
      final now = DateTime.now();
      final today = DateTime(now.year, now.month, now.day);
      final tomorrow = today.add(const Duration(days: 1));
      final date = DateTime(dt.year, dt.month, dt.day);
      if (date == today) return 'Hoy';
      if (date == tomorrow) return 'Mañana';
      const months = [
        '', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
      ];
      return '${dt.day} ${months[dt.month]}';
    } catch (_) {
      return isoDate;
    }
  }
}

final visitorsProvider =
    FutureProvider<List<VisitorApiModel>>((ref) async {
  final user = ref.watch(authProvider).user;
  final response =
      await ApiClient.instance.get('/visitors/autorizaciones');
  final list = response.data as List<dynamic>;
  final all = list
      .map((e) => VisitorApiModel.fromJson(e as Map<String, dynamic>))
      .toList();
  if (user?.unidadId != null) {
    return all.where((v) => v.unidadId == user!.unidadId).toList();
  }
  return all;
});
