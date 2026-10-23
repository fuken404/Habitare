import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:habitare/core/network/api_client.dart';
import 'package:habitare/features/incidents/domain/incident_model.dart';

final tiposIncidenteProvider =
    FutureProvider.autoDispose<List<TipoIncidenteModel>>((ref) async {
  final response = await ApiClient.instance.get('/pqrs/tipos-incidente');
  final list = response.data as List<dynamic>;
  return list
      .map((e) => TipoIncidenteModel.fromJson(e as Map<String, dynamic>))
      .toList();
});
