import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:habitare/core/network/api_client.dart';
import 'package:habitare/features/auth/presentation/providers/auth_provider.dart';
import 'package:habitare/features/billing/domain/billing_model.dart';

final billingProvider = FutureProvider.autoDispose<List<FacturaModel>>((ref) async {
  final user = ref.watch(authProvider).user;
  final response = await ApiClient.instance.get('/billing/facturas');
  final list = response.data as List<dynamic>;
  final all = list
      .map((e) => FacturaModel.fromJson(e as Map<String, dynamic>))
      .toList();
  // Filter by current user's unit if available
  if (user?.unidadId != null) {
    return all.where((f) => f.unidadId == user!.unidadId).toList();
  }
  return all;
});
