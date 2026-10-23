import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:habitare/core/network/api_client.dart';
import 'package:habitare/features/appointments/data/models/appointment_model.dart';

final disponibilidadesProvider =
    FutureProvider.autoDispose<List<DisponibilidadModel>>((ref) async {
  final response = await ApiClient.instance.get(
    '/citas/disponibilidad',
    queryParameters: {'solo_futuras': true},
  );
  final list = response.data as List<dynamic>;
  return list
      .map((e) => DisponibilidadModel.fromJson(e as Map<String, dynamic>))
      .toList();
});

final misCitasProvider =
    FutureProvider.autoDispose<List<CitaModel>>((ref) async {
  final response = await ApiClient.instance.get('/citas');
  final list = response.data as List<dynamic>;
  return list
      .map((e) => CitaModel.fromJson(e as Map<String, dynamic>))
      .toList();
});

Future<CitaModel> solicitarCita({
  required String disponibilidadId,
  required String motivo,
}) async {
  final response = await ApiClient.instance.post('/citas', data: {
    'disponibilidad_id': disponibilidadId,
    'motivo': motivo,
  });
  return CitaModel.fromJson(response.data as Map<String, dynamic>);
}
