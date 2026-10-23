import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:habitare/core/network/api_client.dart';
import 'package:habitare/features/external_personnel/data/models/ingreso_externo_model.dart';

final ingresosExternosProvider =
    FutureProvider.autoDispose<List<IngresoExternoModel>>((ref) async {
  final response = await ApiClient.instance.get('/external-services');
  final list = response.data as List<dynamic>;
  return list
      .map((e) => IngresoExternoModel.fromJson(e as Map<String, dynamic>))
      .toList();
});

Future<void> registrarIngresoExterno({
  required String nombre,
  required String motivo,
  required String tipoPersonal,
  String? empresa,
}) async {
  await ApiClient.instance.post('/external-services', data: {
    'nombre': nombre,
    'motivo': motivo,
    'tipo_personal': tipoPersonal,
    if (empresa != null && empresa.isNotEmpty) 'empresa': empresa,
  });
}
