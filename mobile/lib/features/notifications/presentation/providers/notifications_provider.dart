import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:habitare/core/network/api_client.dart';

class NotificationModel {
  final String id;
  final String titulo;
  final String mensaje;
  final String tipo; // info | alerta | urgente | sistema
  final String estadoApp; // pendiente | enviada | fallida
  final String? entidadTipo;
  final String? entidadId;
  final String createdAt;

  bool get leida => estadoApp != 'pendiente';

  const NotificationModel({
    required this.id,
    required this.titulo,
    required this.mensaje,
    required this.tipo,
    required this.estadoApp,
    this.entidadTipo,
    this.entidadId,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] as String,
      titulo: json['titulo'] as String,
      mensaje: json['mensaje'] as String? ?? '',
      tipo: json['tipo'] as String? ?? 'info',
      estadoApp: json['estado_app'] as String? ?? 'enviada',
      entidadTipo: json['entidad_tipo'] as String?,
      entidadId: json['entidad_id'] as String?,
      createdAt: json['created_at'] as String,
    );
  }
}

final notificationsProvider =
    FutureProvider.autoDispose<List<NotificationModel>>((ref) async {
  final response = await ApiClient.instance.get('/notifications');
  final list = response.data as List<dynamic>;
  return list
      .map((e) => NotificationModel.fromJson(e as Map<String, dynamic>))
      .toList();
});

final unreadCountProvider = Provider.autoDispose<int>((ref) {
  return ref.watch(notificationsProvider).valueOrNull
          ?.where((n) => !n.leida)
          .length ??
      0;
});
