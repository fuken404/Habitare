import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:habitare/core/network/api_client.dart';
import 'package:habitare/features/auth/presentation/providers/auth_provider.dart';
import 'package:habitare/features/packages/domain/package_model.dart';

final packagesProvider = FutureProvider<List<PackageModel>>((ref) async {
  final user = ref.watch(authProvider).user;
  final queryParams = user?.unidadId != null
      ? '?unidad_id=${user!.unidadId}'
      : '';
  final response =
      await ApiClient.instance.get('/paquetes$queryParams');
  final list = response.data as List<dynamic>;
  return list
      .map((e) => PackageModel.fromJson(e as Map<String, dynamic>))
      .toList();
});
