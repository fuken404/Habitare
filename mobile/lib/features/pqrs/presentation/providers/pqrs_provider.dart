import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:habitare/core/network/api_client.dart';
import 'package:habitare/features/auth/presentation/providers/auth_provider.dart';
import 'package:habitare/features/pqrs/domain/pqrs_model.dart';
import 'package:habitare/features/incidents/domain/incident_model.dart';

final pqrsProvider = FutureProvider.autoDispose<List<PqrsModel>>((ref) async {
  final user = ref.watch(authProvider).user;
  final response = await ApiClient.instance.get('/pqrs');
  final list = response.data as List<dynamic>;
  final all = list
      .map((e) => PqrsModel.fromJson(e as Map<String, dynamic>))
      .toList();
  // Residents see their own PQRS; admins see all
  if (user?.rol == 'residente') {
    return all.where((p) => p.radicadoPor == user!.id).toList();
  }
  return all;
});

final pqrsCategoriasProvider =
    FutureProvider.autoDispose<List<PqrsCategoriaModel>>((ref) async {
  final response = await ApiClient.instance.get('/pqrs/categorias');
  final list = response.data as List<dynamic>;
  return list
      .map((e) => PqrsCategoriaModel.fromJson(e as Map<String, dynamic>))
      .toList();
});

final pqrsDetailProvider =
    FutureProvider.autoDispose.family<PqrsDetailModel, String>((ref, id) async {
  final response = await ApiClient.instance.get('/pqrs/$id');
  return PqrsDetailModel.fromJson(response.data as Map<String, dynamic>);
});

final tiposIncidentePqrsProvider =
    FutureProvider.autoDispose<List<TipoIncidenteModel>>((ref) async {
  final response = await ApiClient.instance.get('/pqrs/tipos-incidente');
  final list = response.data as List<dynamic>;
  return list
      .map((e) => TipoIncidenteModel.fromJson(e as Map<String, dynamic>))
      .toList();
});
