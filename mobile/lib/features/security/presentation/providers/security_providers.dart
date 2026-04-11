import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:habitare/core/network/api_client.dart';
import 'package:habitare/features/security/domain/security_models.dart';

final securityVisitorsProvider =
    FutureProvider.autoDispose<List<SecurityVisitorApiModel>>((ref) async {
  final response =
      await ApiClient.instance.get('/visitors/autorizaciones');
  return (response.data as List)
      .map((e) =>
          SecurityVisitorApiModel.fromJson(e as Map<String, dynamic>))
      .toList();
});

final securityIncidentsProvider =
    FutureProvider.autoDispose<List<IncidentApiModel>>((ref) async {
  final response = await ApiClient.instance.get('/incidents');
  return (response.data as List)
      .map((e) => IncidentApiModel.fromJson(e as Map<String, dynamic>))
      .where((i) => i.estado != 'cerrado' && i.estado != 'resuelto')
      .toList();
});

final securityTiposProvider =
    FutureProvider.autoDispose<List<TipoIncidenteApiModel>>((ref) async {
  final response = await ApiClient.instance.get('/incidents/tipos');
  return (response.data as List)
      .map((e) =>
          TipoIncidenteApiModel.fromJson(e as Map<String, dynamic>))
      .toList();
});

final securityZonasProvider =
    FutureProvider.autoDispose<List<ZonaApiModel>>((ref) async {
  final response = await ApiClient.instance.get('/common-areas');
  return (response.data as List)
      .map((e) => ZonaApiModel.fromJson(e as Map<String, dynamic>))
      .toList();
});

final visitorParkingLugaresProvider =
    FutureProvider.autoDispose<List<LugarParqueaderoModel>>((ref) async {
  final response =
      await ApiClient.instance.get('/parqueadero-visitantes/lugares');
  return (response.data as List)
      .map((e) => LugarParqueaderoModel.fromJson(e as Map<String, dynamic>))
      .toList();
});

final visitorParkingProvider =
    FutureProvider.autoDispose<List<VisitorParkingModel>>((ref) async {
  final response = await ApiClient.instance.get('/parqueadero-visitantes');
  return (response.data as List)
      .map((e) => VisitorParkingModel.fromJson(e as Map<String, dynamic>))
      .toList();
});

final incidentDetailProvider =
    FutureProvider.autoDispose.family<Map<String, dynamic>, String>(
        (ref, incidentId) async {
  final r = await ApiClient.instance.get('/incidents/$incidentId');
  return r.data as Map<String, dynamic>;
});

final securityReservasProvider =
    FutureProvider.autoDispose<List<ReservaApiModel>>((ref) async {
  final zonasAsync = await ref.watch(securityZonasProvider.future);
  final zonaMap = {for (final z in zonasAsync) z.id: z.nombre};

  final response =
      await ApiClient.instance.get('/common-areas/reservas');
  final reservas = (response.data as List)
      .map((e) => ReservaApiModel.fromJson(e as Map<String, dynamic>))
      .toList();

  for (final r in reservas) {
    r.zonaNombre = zonaMap[r.zonaComunId] ?? 'Zona común';
  }
  return reservas;
});
