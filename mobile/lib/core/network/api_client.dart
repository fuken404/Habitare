import 'package:dio/dio.dart';
import 'package:habitare/core/constants/app_constants.dart';
import 'package:habitare/core/network/auth_interceptor.dart';

class ApiClient {
  ApiClient._();

  static final Dio _dio = _buildDio();

  static Dio get instance => _dio;

  static Dio _buildDio() {
    final dio = Dio(
      BaseOptions(
        baseUrl: AppConstants.baseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
      ),
    );
    dio.interceptors.add(AuthInterceptor());
    return dio;
  }
}
