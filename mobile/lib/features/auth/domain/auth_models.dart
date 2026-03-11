class TokenResponse {
  final String accessToken;
  final String refreshToken;
  final int expiresIn;

  const TokenResponse({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresIn,
  });

  factory TokenResponse.fromJson(Map<String, dynamic> json) {
    return TokenResponse(
      accessToken: json['access_token'] as String,
      refreshToken: json['refresh_token'] as String,
      expiresIn: json['expires_in'] as int,
    );
  }
}

class UserProfile {
  final String id;
  final String email;
  final String nombre;
  final String apellido;
  final String rol;
  final String? tenantId;
  final String? unidadId;
  final String? nombreConjunto;
  final String? nombreTorre;
  final String? numeroUnidad;

  const UserProfile({
    required this.id,
    required this.email,
    required this.nombre,
    required this.apellido,
    required this.rol,
    this.tenantId,
    this.unidadId,
    this.nombreConjunto,
    this.nombreTorre,
    this.numeroUnidad,
  });

  String get nombreCompleto => '$nombre $apellido';

  /// "A · 502" o solo "502" si no hay torre
  String? get ubicacion {
    if (numeroUnidad == null) return null;
    if (nombreTorre != null) return '$nombreTorre · $numeroUnidad';
    return numeroUnidad;
  }

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] as String,
      email: json['email'] as String,
      nombre: json['nombre'] as String,
      apellido: json['apellido'] as String,
      rol: json['rol'] as String,
      tenantId: json['tenant_id'] as String?,
      unidadId: json['unidad_id'] as String?,
      nombreConjunto: json['nombre_conjunto'] as String?,
      nombreTorre: json['nombre_torre'] as String?,
      numeroUnidad: json['numero_unidad'] as String?,
    );
  }
}

class AuthState {
  final bool isAuthenticated;
  final bool isLoading;
  final UserProfile? user;
  final String? error;

  const AuthState({
    required this.isAuthenticated,
    required this.isLoading,
    this.user,
    this.error,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    UserProfile? user,
    String? error,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      user: user ?? this.user,
      error: error ?? this.error,
    );
  }

  static AuthState initial() =>
      const AuthState(isAuthenticated: false, isLoading: false);

  static AuthState loading() =>
      const AuthState(isAuthenticated: false, isLoading: true);

  static AuthState authenticated(UserProfile user) =>
      AuthState(isAuthenticated: true, isLoading: false, user: user);

  static AuthState unauthenticated({String? error}) =>
      AuthState(isAuthenticated: false, isLoading: false, error: error);
}
