import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:habitare/core/constants/app_constants.dart';

class AuthInterceptor extends Interceptor {
  static const _accessTokenKey = 'access_token';
  static const _refreshTokenKey = 'refresh_token';

  final FlutterSecureStorage _storage;

  AuthInterceptor({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _storage.read(key: _accessTokenKey);
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401) {
      final refreshToken = await _storage.read(key: _refreshTokenKey);
      if (refreshToken != null) {
        try {
          // Use a separate Dio instance without interceptors to avoid loops
          final refreshDio = Dio(BaseOptions(baseUrl: AppConstants.baseUrl));
          final response = await refreshDio.post(
            '/auth/refresh',
            data: {'refresh_token': refreshToken},
          );

          final newAccessToken = response.data['access_token'] as String;
          final newRefreshToken = response.data['refresh_token'] as String;

          await _storage.write(key: _accessTokenKey, value: newAccessToken);
          await _storage.write(key: _refreshTokenKey, value: newRefreshToken);

          // Retry original request with new token
          final retryOptions = err.requestOptions;
          retryOptions.headers['Authorization'] = 'Bearer $newAccessToken';

          final retryDio = Dio(BaseOptions(baseUrl: AppConstants.baseUrl));
          final retryResponse = await retryDio.fetch(retryOptions);
          handler.resolve(retryResponse);
          return;
        } catch (_) {
          await _storage.delete(key: _accessTokenKey);
          await _storage.delete(key: _refreshTokenKey);
        }
      }
    }
    handler.next(err);
  }
}
