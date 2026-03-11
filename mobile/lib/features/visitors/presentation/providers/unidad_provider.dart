import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:habitare/core/network/api_client.dart';

final unidadNumeroProvider =
    FutureProvider.family<String, String>((ref, unidadId) async {
  if (unidadId.isEmpty) return '-';
  final response =
      await ApiClient.instance.get('/unidades/$unidadId');
  final data = response.data as Map<String, dynamic>;
  return data['numero'] as String? ?? '-';
});
