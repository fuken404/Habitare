import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:habitare/core/network/api_client.dart';

class SorteoActivoModel {
  final String id;
  final String fechaSorteo;
  final int nCupos;
  final int nInscritos;
  final bool yaInscrito;
  final String estado;

  const SorteoActivoModel({
    required this.id,
    required this.fechaSorteo,
    required this.nCupos,
    required this.nInscritos,
    required this.yaInscrito,
    required this.estado,
  });

  factory SorteoActivoModel.fromJson(Map<String, dynamic> json) {
    return SorteoActivoModel(
      id: json['id'] as String,
      fechaSorteo: json['fecha_sorteo'] as String,
      nCupos: json['n_cupos'] as int,
      nInscritos: json['n_inscritos'] as int,
      yaInscrito: json['ya_inscrito'] as bool,
      estado: json['estado'] as String,
    );
  }
}

final sorteoActivoProvider = FutureProvider.autoDispose<SorteoActivoModel?>((ref) async {
  try {
    final response = await ApiClient.instance.get('/parking/sorteos/activo');
    return SorteoActivoModel.fromJson(response.data as Map<String, dynamic>);
  } catch (_) {
    return null;
  }
});
