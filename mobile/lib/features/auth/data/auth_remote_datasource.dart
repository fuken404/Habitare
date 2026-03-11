import 'package:dio/dio.dart';
import 'package:habitare/core/constants/app_constants.dart';
import 'package:habitare/core/network/api_client.dart';
import 'package:habitare/features/auth/domain/auth_models.dart';

class AuthRemoteDatasource {
  // Plain Dio without auth interceptor, used for login and refresh
  final Dio _unauthenticatedDio;

  // Authenticated Dio (with auth interceptor), used for getMe
  final Dio _authenticatedDio;

  AuthRemoteDatasource({Dio? unauthenticatedDio, Dio? authenticatedDio})
      : _unauthenticatedDio = unauthenticatedDio ??
            Dio(
              BaseOptions(
                baseUrl: AppConstants.baseUrl,
                connectTimeout: const Duration(seconds: 10),
                receiveTimeout: const Duration(seconds: 10),
              ),
            ),
        _authenticatedDio = authenticatedDio ?? ApiClient.instance;

  Future<TokenResponse> login(String email, String password) async {
    final response = await _unauthenticatedDio.post(
      '/auth/login',
      data: FormData.fromMap({
        'username': email,
        'password': password,
      }),
    );
    return TokenResponse.fromJson(response.data as Map<String, dynamic>);
  }

  Future<TokenResponse> refresh(String refreshToken) async {
    final response = await _unauthenticatedDio.post(
      '/auth/refresh',
      data: {'refresh_token': refreshToken},
    );
    return TokenResponse.fromJson(response.data as Map<String, dynamic>);
  }

  Future<UserProfile> getMe() async {
    final response = await _authenticatedDio.get('/auth/me');
    return UserProfile.fromJson(response.data as Map<String, dynamic>);
  }
}
