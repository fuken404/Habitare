import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:habitare/features/auth/data/auth_local_datasource.dart';
import 'package:habitare/features/auth/data/auth_remote_datasource.dart';
import 'package:habitare/features/auth/data/biometric_service.dart';
import 'package:habitare/features/auth/domain/auth_models.dart';

const _sessionTimeout = Duration(minutes: 20);

class AuthNotifier extends Notifier<AuthState> {
  late final AuthLocalDatasource _local;
  late final AuthRemoteDatasource _remote;
  late final BiometricService _biometric;
  Timer? _sessionTimer;

  @override
  AuthState build() {
    _local = AuthLocalDatasource();
    _remote = AuthRemoteDatasource();
    _biometric = BiometricService();
    ref.onDispose(_cancelTimer);
    _checkSession();
    return AuthState.initial();
  }

  void _startSessionTimer() {
    _cancelTimer();
    _sessionTimer = Timer(_sessionTimeout, () async {
      await _local.clearTokens();
      state = AuthState.unauthenticated();
    });
  }

  void _cancelTimer() {
    _sessionTimer?.cancel();
    _sessionTimer = null;
  }

  Future<void> _checkSession() async {
    state = AuthState.loading();
    try {
      final hasSession = await _local.hasValidSession();
      if (hasSession) {
        final user = await _remote.getMe();
        state = AuthState.authenticated(user);
        _startSessionTimer();
      } else {
        state = AuthState.unauthenticated();
      }
    } catch (_) {
      await _local.clearTokens();
      state = AuthState.unauthenticated();
    }
  }

  Future<void> login(String email, String password,
      {bool saveBiometric = false}) async {
    state = AuthState.loading();
    try {
      final tokens = await _remote.login(email, password);
      await _local.saveTokens(tokens.accessToken, tokens.refreshToken);
      if (saveBiometric || await _local.isBiometricEnabled()) {
        await _local.saveBiometricCredentials(email, password);
      }
      final user = await _remote.getMe();
      state = AuthState.authenticated(user);
      _startSessionTimer();
    } catch (e) {
      state = AuthState.unauthenticated(error: _parseError(e));
    }
  }

  Future<void> loginWithBiometric() async {
    state = AuthState.loading();
    try {
      final authenticated = await _biometric.authenticate();
      if (!authenticated) {
        state = AuthState.unauthenticated(
            error: 'Autenticación biométrica cancelada');
        return;
      }
      final creds = await _local.getBiometricCredentials();
      if (creds == null) {
        state = AuthState.unauthenticated(
            error: 'No hay credenciales guardadas para biometría');
        return;
      }
      final tokens = await _remote.login(creds.email, creds.password);
      await _local.saveTokens(tokens.accessToken, tokens.refreshToken);
      final user = await _remote.getMe();
      state = AuthState.authenticated(user);
      _startSessionTimer();
    } catch (e) {
      state = AuthState.unauthenticated(error: _parseError(e));
    }
  }

  Future<bool> isBiometricAvailable() async {
    return _biometric.isAvailable();
  }

  Future<bool> isBiometricEnabled() async {
    return _local.isBiometricEnabled();
  }

  Future<void> logout() async {
    _cancelTimer();
    await _local.clearTokens();
    state = AuthState.unauthenticated();
  }

  String _parseError(Object e) {
    return 'Credenciales incorrectas. Intenta de nuevo.';
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(AuthNotifier.new);
