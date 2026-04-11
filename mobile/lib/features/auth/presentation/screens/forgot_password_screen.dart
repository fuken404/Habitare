import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:habitare/core/network/api_client.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';

enum _Step { email, codigo, password, success }

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  _Step _step = _Step.email;
  String _email = '';
  String _codigo = '';
  bool _isLoading = false;
  String? _errorMsg;

  // Controllers
  final _emailCtrl = TextEditingController();
  final _codigoCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  final _emailFormKey = GlobalKey<FormState>();
  final _codigoFormKey = GlobalKey<FormState>();
  final _passwordFormKey = GlobalKey<FormState>();
  bool _obscurePassword = true;
  bool _obscureConfirm = true;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _codigoCtrl.dispose();
    _passwordCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _sendEmail() async {
    // currentState es null cuando se llama desde "Reenviar" (el form no está montado)
    if (_emailFormKey.currentState != null &&
        !_emailFormKey.currentState!.validate()) return;
    setState(() { _isLoading = true; _errorMsg = null; });
    try {
      await ApiClient.instance.post('/auth/forgot-password', data: {
        'email': _emailCtrl.text.trim(),
      });
      _email = _emailCtrl.text.trim();
      setState(() => _step = _Step.codigo);
    } on DioException catch (e) {
      final data = e.response?.data;
      setState(() => _errorMsg = data is Map
          ? (data['detail'] ?? 'Error al enviar el correo')
          : 'Error al enviar el correo');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _verifyCode() async {
    if (!_codigoFormKey.currentState!.validate()) return;
    setState(() { _isLoading = true; _errorMsg = null; });
    try {
      await ApiClient.instance.post('/auth/verify-reset-code', data: {
        'email': _email,
        'codigo': _codigoCtrl.text.trim(),
      });
      _codigo = _codigoCtrl.text.trim();
      setState(() => _step = _Step.password);
    } on DioException catch (e) {
      final data = e.response?.data;
      setState(() => _errorMsg = data is Map
          ? (data['detail'] ?? 'Código inválido o expirado')
          : 'Código inválido o expirado');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _resetPassword() async {
    if (!_passwordFormKey.currentState!.validate()) return;
    setState(() { _isLoading = true; _errorMsg = null; });
    try {
      await ApiClient.instance.post('/auth/reset-password', data: {
        'email': _email,
        'codigo': _codigo,
        'nueva_password': _passwordCtrl.text,
      });
      setState(() => _step = _Step.success);
    } on DioException catch (e) {
      final data = e.response?.data;
      setState(() => _errorMsg = data is Map
          ? (data['detail'] ?? 'Error al cambiar la contraseña')
          : 'Error al cambiar la contraseña');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffold,
      appBar: _step != _Step.success
          ? AppBar(
              title: Text(_appBarTitle, style: AppTextStyles.heading2),
              leading: IconButton(
                icon: const Icon(Icons.arrow_back_ios_rounded, size: 20),
                onPressed: () {
                  if (_step == _Step.codigo) {
                    setState(() { _step = _Step.email; _errorMsg = null; });
                  } else if (_step == _Step.password) {
                    setState(() { _step = _Step.codigo; _errorMsg = null; });
                  } else {
                    context.pop();
                  }
                },
              ),
            )
          : null,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: switch (_step) {
            _Step.email => _EmailStep(
                formKey: _emailFormKey,
                ctrl: _emailCtrl,
                isLoading: _isLoading,
                errorMsg: _errorMsg,
                onSubmit: _sendEmail,
              ),
            _Step.codigo => _CodigoStep(
                formKey: _codigoFormKey,
                ctrl: _codigoCtrl,
                email: _email,
                isLoading: _isLoading,
                errorMsg: _errorMsg,
                onSubmit: _verifyCode,
                onResend: () {
                  setState(() { _codigoCtrl.clear(); _errorMsg = null; });
                  _sendEmail();
                },
              ),
            _Step.password => _PasswordStep(
                formKey: _passwordFormKey,
                passwordCtrl: _passwordCtrl,
                confirmCtrl: _confirmCtrl,
                obscurePassword: _obscurePassword,
                obscureConfirm: _obscureConfirm,
                onTogglePassword: () => setState(() => _obscurePassword = !_obscurePassword),
                onToggleConfirm: () => setState(() => _obscureConfirm = !_obscureConfirm),
                isLoading: _isLoading,
                errorMsg: _errorMsg,
                onSubmit: _resetPassword,
              ),
            _Step.success => _SuccessStep(onLogin: () => context.go('/login')),
          },
        ),
      ),
    );
  }

  String get _appBarTitle => switch (_step) {
        _Step.email => 'Recuperar contraseña',
        _Step.codigo => 'Verificar código',
        _Step.password => 'Nueva contraseña',
        _ => '',
      };
}

// ── Paso 1: Email ─────────────────────────────────────────────────────────────

class _EmailStep extends StatelessWidget {
  const _EmailStep({
    required this.formKey,
    required this.ctrl,
    required this.isLoading,
    required this.errorMsg,
    required this.onSubmit,
  });
  final GlobalKey<FormState> formKey;
  final TextEditingController ctrl;
  final bool isLoading;
  final String? errorMsg;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 16),
        Container(
          width: 64, height: 64,
          decoration: BoxDecoration(color: AppColors.info2Bg, borderRadius: BorderRadius.circular(16)),
          child: const Icon(Icons.lock_reset_rounded, size: 32, color: AppColors.primary),
        ),
        const SizedBox(height: 24),
        Text('¿Olvidaste tu contraseña?', style: AppTextStyles.heading1),
        const SizedBox(height: 8),
        Text(
          'Ingresa tu correo electrónico registrado y te enviaremos un código de verificación.',
          style: AppTextStyles.body.copyWith(color: AppColors.gray500),
        ),
        const SizedBox(height: 32),
        Form(
          key: formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Correo electrónico', style: AppTextStyles.smallSemibold),
              const SizedBox(height: 8),
              TextFormField(
                controller: ctrl,
                keyboardType: TextInputType.emailAddress,
                autofocus: true,
                style: AppTextStyles.bodyRegular,
                decoration: const InputDecoration(
                  hintText: 'correo@ejemplo.com',
                  prefixIcon: Icon(Icons.email_outlined, size: 20, color: AppColors.gray500),
                ),
                validator: (v) {
                  if (v == null || v.trim().isEmpty) return 'Ingresa tu correo';
                  if (!v.contains('@') || !v.contains('.')) return 'Correo inválido';
                  return null;
                },
              ),
              if (errorMsg != null) ...[
                const SizedBox(height: 12),
                _ErrorBox(errorMsg!),
              ],
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: isLoading ? null : onSubmit,
                  child: isLoading
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.white))
                      : const Text('Enviar código'),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ── Paso 2: Código ────────────────────────────────────────────────────────────

class _CodigoStep extends StatelessWidget {
  const _CodigoStep({
    required this.formKey,
    required this.ctrl,
    required this.email,
    required this.isLoading,
    required this.errorMsg,
    required this.onSubmit,
    required this.onResend,
  });
  final GlobalKey<FormState> formKey;
  final TextEditingController ctrl;
  final String email;
  final bool isLoading;
  final String? errorMsg;
  final VoidCallback onSubmit;
  final VoidCallback onResend;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 16),
        Container(
          width: 64, height: 64,
          decoration: BoxDecoration(color: const Color(0xFFD1FAE5), borderRadius: BorderRadius.circular(16)),
          child: const Icon(Icons.mark_email_read_outlined, size: 32, color: AppColors.successText),
        ),
        const SizedBox(height: 24),
        Text('Revisa tu correo', style: AppTextStyles.heading1),
        const SizedBox(height: 8),
        RichText(
          text: TextSpan(
            style: AppTextStyles.body.copyWith(color: AppColors.gray500),
            children: [
              const TextSpan(text: 'Enviamos un código de 6 dígitos a '),
              TextSpan(text: email, style: AppTextStyles.bodyMedium.copyWith(color: AppColors.gray900)),
              const TextSpan(text: '. Ingresa el código a continuación.'),
            ],
          ),
        ),
        const SizedBox(height: 32),
        Form(
          key: formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Código de verificación', style: AppTextStyles.smallSemibold),
              const SizedBox(height: 8),
              TextFormField(
                controller: ctrl,
                keyboardType: TextInputType.number,
                maxLength: 6,
                autofocus: true,
                textAlign: TextAlign.center,
                style: AppTextStyles.heading1.copyWith(letterSpacing: 12),
                decoration: const InputDecoration(
                  hintText: '000000',
                  counterText: '',
                ),
                validator: (v) {
                  if (v == null || v.trim().length != 6) return 'Ingresa el código de 6 dígitos';
                  return null;
                },
              ),
              if (errorMsg != null) ...[
                const SizedBox(height: 12),
                _ErrorBox(errorMsg!),
              ],
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: isLoading ? null : onSubmit,
                  child: isLoading
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.white))
                      : const Text('Verificar código'),
                ),
              ),
              const SizedBox(height: 16),
              Center(
                child: GestureDetector(
                  onTap: isLoading ? null : onResend,
                  child: Text(
                    '¿No recibiste el código? Reenviar',
                    style: AppTextStyles.small.copyWith(
                      color: AppColors.primary,
                      decoration: TextDecoration.underline,
                      decorationColor: AppColors.primary,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ── Paso 3: Nueva contraseña ──────────────────────────────────────────────────

class _PasswordStep extends StatelessWidget {
  const _PasswordStep({
    required this.formKey,
    required this.passwordCtrl,
    required this.confirmCtrl,
    required this.obscurePassword,
    required this.obscureConfirm,
    required this.onTogglePassword,
    required this.onToggleConfirm,
    required this.isLoading,
    required this.errorMsg,
    required this.onSubmit,
  });
  final GlobalKey<FormState> formKey;
  final TextEditingController passwordCtrl;
  final TextEditingController confirmCtrl;
  final bool obscurePassword;
  final bool obscureConfirm;
  final VoidCallback onTogglePassword;
  final VoidCallback onToggleConfirm;
  final bool isLoading;
  final String? errorMsg;
  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 16),
        Container(
          width: 64, height: 64,
          decoration: BoxDecoration(color: AppColors.info2Bg, borderRadius: BorderRadius.circular(16)),
          child: const Icon(Icons.lock_outline_rounded, size: 32, color: AppColors.primary),
        ),
        const SizedBox(height: 24),
        Text('Nueva contraseña', style: AppTextStyles.heading1),
        const SizedBox(height: 8),
        Text(
          'Elige una contraseña segura para tu cuenta.',
          style: AppTextStyles.body.copyWith(color: AppColors.gray500),
        ),
        const SizedBox(height: 32),
        Form(
          key: formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Nueva contraseña', style: AppTextStyles.smallSemibold),
              const SizedBox(height: 8),
              TextFormField(
                controller: passwordCtrl,
                obscureText: obscurePassword,
                autofocus: true,
                style: AppTextStyles.bodyRegular,
                decoration: InputDecoration(
                  hintText: '••••••••',
                  prefixIcon: const Icon(Icons.lock_outline, size: 20, color: AppColors.gray500),
                  suffixIcon: IconButton(
                    icon: Icon(obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined, size: 20, color: AppColors.gray500),
                    onPressed: onTogglePassword,
                  ),
                ),
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Ingresa la nueva contraseña';
                  if (v.length < 6) return 'Mínimo 6 caracteres';
                  return null;
                },
              ),
              const SizedBox(height: 20),
              Text('Confirmar contraseña', style: AppTextStyles.smallSemibold),
              const SizedBox(height: 8),
              TextFormField(
                controller: confirmCtrl,
                obscureText: obscureConfirm,
                style: AppTextStyles.bodyRegular,
                decoration: InputDecoration(
                  hintText: '••••••••',
                  prefixIcon: const Icon(Icons.lock_outline, size: 20, color: AppColors.gray500),
                  suffixIcon: IconButton(
                    icon: Icon(obscureConfirm ? Icons.visibility_outlined : Icons.visibility_off_outlined, size: 20, color: AppColors.gray500),
                    onPressed: onToggleConfirm,
                  ),
                ),
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Confirma la contraseña';
                  if (v != passwordCtrl.text) return 'Las contraseñas no coinciden';
                  return null;
                },
              ),
              if (errorMsg != null) ...[
                const SizedBox(height: 12),
                _ErrorBox(errorMsg!),
              ],
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: isLoading ? null : onSubmit,
                  child: isLoading
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.white))
                      : const Text('Cambiar contraseña'),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ── Paso 4: Éxito ─────────────────────────────────────────────────────────────

class _SuccessStep extends StatelessWidget {
  const _SuccessStep({required this.onLogin});
  final VoidCallback onLogin;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 40),
        Container(
          width: 96, height: 96,
          decoration: BoxDecoration(color: const Color(0xFFD1FAE5), borderRadius: BorderRadius.circular(48)),
          child: const Icon(Icons.check_circle_outline_rounded, size: 52, color: AppColors.successText),
        ),
        const SizedBox(height: 28),
        Text('¡Contraseña actualizada!', style: AppTextStyles.heading1, textAlign: TextAlign.center),
        const SizedBox(height: 12),
        Text(
          'Tu contraseña fue cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.',
          style: AppTextStyles.body.copyWith(color: AppColors.gray500),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 40),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: onLogin,
            child: const Text('Ir al inicio de sesión'),
          ),
        ),
      ],
    );
  }
}

// ── Widget compartido ─────────────────────────────────────────────────────────

class _ErrorBox extends StatelessWidget {
  const _ErrorBox(this.message);
  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.dangerBg,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(message, style: AppTextStyles.small.copyWith(color: AppColors.dangerText)),
    );
  }
}
