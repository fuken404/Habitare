import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:habitare/core/network/api_client.dart';
import 'package:habitare/features/auth/presentation/providers/auth_provider.dart';
import 'package:habitare/features/common_areas/domain/common_area_model.dart';

final commonAreasProvider =
    FutureProvider.autoDispose<List<CommonAreaModel>>((ref) async {
  final response = await ApiClient.instance.get('/common-areas');
  final list = response.data as List<dynamic>;
  return list
      .map((e) => CommonAreaModel.fromJson(e as Map<String, dynamic>))
      .toList();
});

final reservasProvider = FutureProvider.autoDispose<List<ReservaModel>>((ref) async {
  final user = ref.watch(authProvider).user;
  final response = await ApiClient.instance.get('/common-areas/reservas');
  final list = response.data as List<dynamic>;
  final all = list
      .map((e) => ReservaModel.fromJson(e as Map<String, dynamic>))
      .toList();
  if (user?.unidadId != null) {
    return all.where((r) => r.unidadId == user!.unidadId).toList();
  }
  return all;
});
