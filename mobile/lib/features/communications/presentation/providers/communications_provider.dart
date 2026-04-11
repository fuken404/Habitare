import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:habitare/core/network/api_client.dart';
import 'package:habitare/features/communications/domain/communication_model.dart';

final communicationsProvider =
    FutureProvider.autoDispose<List<CommunicationModel>>((ref) async {
  final response = await ApiClient.instance.get('/communications');
  final list = response.data as List<dynamic>;
  return list
      .map((e) => CommunicationModel.fromJson(e as Map<String, dynamic>))
      .toList();
});

final communicationDetailProvider =
    FutureProvider.autoDispose.family<CommunicationDetail, String>((ref, id) async {
  final response = await ApiClient.instance.get('/communications/$id');
  return CommunicationDetail.fromJson(
      response.data as Map<String, dynamic>);
});
