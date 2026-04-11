import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:habitare/core/network/api_client.dart';

class UserDetail {
  final String tipoDocumento;
  final String nDocumento;
  final String? telefono;

  const UserDetail({
    required this.tipoDocumento,
    required this.nDocumento,
    this.telefono,
  });

  factory UserDetail.fromJson(Map<String, dynamic> json) {
    return UserDetail(
      tipoDocumento: json['tipo_documento'] as String,
      nDocumento: json['n_documento'] as String,
      telefono: json['telefono'] as String?,
    );
  }
}

final userDetailProvider = FutureProvider.autoDispose<UserDetail>((ref) async {
  final response = await ApiClient.instance.get('/usuarios/me');
  return UserDetail.fromJson(response.data as Map<String, dynamic>);
});
