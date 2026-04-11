import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:habitare/core/network/api_client.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/features/auth/presentation/providers/auth_provider.dart';
import 'package:habitare/features/profile/presentation/providers/user_detail_provider.dart';
import 'package:habitare/shared/widgets/profile_avatar.dart';

class SecurityProfileScreen extends ConsumerStatefulWidget {
  const SecurityProfileScreen({super.key});

  @override
  ConsumerState<SecurityProfileScreen> createState() =>
      _SecurityProfileScreenState();
}

class _SecurityProfileScreenState
    extends ConsumerState<SecurityProfileScreen> {
  final _telefonoCtrl = TextEditingController();
  final _correoCtrl = TextEditingController();

  bool _isLoading = false;
  bool _hasChanges = false;

  String _originalTelefono = '';
  String _originalCorreo = '';

  @override
  void initState() {
    super.initState();
    _telefonoCtrl.addListener(_checkChanges);
    _correoCtrl.addListener(_checkChanges);
  }

  void _checkChanges() {
    final changed = _telefonoCtrl.text != _originalTelefono ||
        _correoCtrl.text != _originalCorreo;
    if (changed != _hasChanges) setState(() => _hasChanges = changed);
  }

  @override
  void dispose() {
    _telefonoCtrl.dispose();
    _correoCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final user = ref.read(authProvider).user;
    if (user == null) return;
    setState(() => _isLoading = true);
    try {
      await ApiClient.instance.patch(
        '/usuarios/${user.id}',
        data: {
          if (_correoCtrl.text != _originalCorreo)
            'email': _correoCtrl.text.trim(),
          if (_telefonoCtrl.text != _originalTelefono)
            'telefono': _telefonoCtrl.text.trim(),
        },
      );
      if (!mounted) return;
      _originalCorreo = _correoCtrl.text;
      _originalTelefono = _telefonoCtrl.text;
      setState(() {
        _isLoading = false;
        _hasChanges = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Perfil actualizado'),
          backgroundColor: AppColors.successBtn,
        ),
      );
    } on DioException catch (e) {
      if (!mounted) return;
      final detail = (e.response?.data as Map?)?['detail'] as String?;
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(detail ?? 'Error al guardar los cambios'),
          backgroundColor: AppColors.dangerText,
        ),
      );
    }
  }

  void _showChangePasswordModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => const _ChangePasswordSheet(),
    );
  }

  void _confirmLogout() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cerrar sesión'),
        content: const Text('¿Estás seguro de que quieres cerrar sesión?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              ref.read(authProvider.notifier).logout();
            },
            child: Text('Cerrar sesión',
                style: TextStyle(color: AppColors.dangerText)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final initials = user != null
        ? '${user.nombre.isNotEmpty ? user.nombre[0] : ''}'
                '${user.apellido.isNotEmpty ? user.apellido[0] : ''}'
            .toUpperCase()
        : '?';

    final detail = ref.watch(userDetailProvider).valueOrNull;
    if (_correoCtrl.text.isEmpty && user != null) {
      _originalCorreo = user.email;
      _correoCtrl.text = user.email;
    }
    if (_telefonoCtrl.text.isEmpty && detail?.telefono != null) {
      _originalTelefono = detail!.telefono!;
      _telefonoCtrl.text = detail.telefono!;
    }

    return Scaffold(
      backgroundColor: AppColors.scaffold,
      appBar: AppBar(
        title: Text('Ajustar Perfil', style: AppTextStyles.heading2),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Avatar + Info ─────────────────────────────────────────────
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ProfileAvatar(initials: initials, size: 96, editable: true),
                const SizedBox(width: 16),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.gray200),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Información del usuario',
                            style: AppTextStyles.badge
                                .copyWith(color: AppColors.gray500)),
                        const Divider(height: 16),
                        _InfoRow(
                          label: 'Nombre',
                          value: user?.nombreCompleto ?? '—',
                        ),
                        const SizedBox(height: 8),
                        Consumer(builder: (context, ref, _) {
                          final det = ref.watch(userDetailProvider);
                          final doc = det.whenOrNull(
                            data: (d) =>
                                '${d.tipoDocumento.toUpperCase()} ${d.nDocumento}',
                          );
                          return _InfoRow(
                            label: 'Documento',
                            value: doc ?? '—',
                          );
                        }),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // ── Detalles del cargo ────────────────────────────────────────
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.gray200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Detalles del cargo',
                      style: AppTextStyles.badge
                          .copyWith(color: AppColors.gray500)),
                  const Divider(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Rol',
                          style: AppTextStyles.bodyRegular
                              .copyWith(color: AppColors.gray500)),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.info2Bg,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          'Seguridad',
                          style: AppTextStyles.badge
                              .copyWith(color: AppColors.primary),
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 16),
                  _PropertyRow(
                    label: 'Conjunto',
                    value: user?.nombreConjunto ?? '—',
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // ── Campos editables ──────────────────────────────────────────
            Text('Teléfono', style: AppTextStyles.smallSemibold),
            const SizedBox(height: 8),
            TextField(
              controller: _telefonoCtrl,
              keyboardType: TextInputType.phone,
              style: AppTextStyles.bodyRegular,
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.phone_outlined,
                    size: 20, color: AppColors.gray500),
              ),
            ),
            const SizedBox(height: 16),

            Text('Usuario', style: AppTextStyles.smallSemibold),
            const SizedBox(height: 8),
            TextField(
              controller: _correoCtrl,
              keyboardType: TextInputType.emailAddress,
              style: AppTextStyles.bodyRegular,
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.email_outlined,
                    size: 20, color: AppColors.gray500),
              ),
            ),
            const SizedBox(height: 16),

            GestureDetector(
              onTap: _showChangePasswordModal,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.gray300),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.lock_outline,
                        size: 20, color: AppColors.gray500),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text('Cambiar contraseña',
                          style: AppTextStyles.bodyRegular
                              .copyWith(color: AppColors.gray900)),
                    ),
                    const Icon(Icons.chevron_right_rounded,
                        size: 20, color: AppColors.gray400),
                  ],
                ),
              ),
            ),

            if (_hasChanges) ...[
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _save,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: AppColors.white),
                        )
                      : const Text('Guardar cambios'),
                ),
              ),
            ],
            const SizedBox(height: 12),

            // ── Cerrar sesión ─────────────────────────────────────────────
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: _confirmLogout,
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.dangerText,
                  side: const BorderSide(color: AppColors.dangerText),
                ),
                child: const Text('Cerrar Sesión'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Change Password Sheet ──────────────────────────────────────────────────

class _ChangePasswordSheet extends StatefulWidget {
  const _ChangePasswordSheet();

  @override
  State<_ChangePasswordSheet> createState() => _ChangePasswordSheetState();
}

class _ChangePasswordSheetState extends State<_ChangePasswordSheet> {
  final _formKey = GlobalKey<FormState>();
  final _actualCtrl = TextEditingController();
  final _nuevaCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();

  bool _obscureActual = true;
  bool _obscureNueva = true;
  bool _obscureConfirm = true;
  bool _isLoading = false;
  String? _serverError;

  @override
  void dispose() {
    _actualCtrl.dispose();
    _nuevaCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  static String? _validateNueva(String? v) {
    if (v == null || v.isEmpty) return 'Ingresa la nueva contraseña';
    if (v.length < 8) return 'Mínimo 8 caracteres';
    if (!v.contains(RegExp(r'[A-Z]'))) return 'Debe incluir al menos una mayúscula';
    if (!v.contains(RegExp(r'[0-9]'))) return 'Debe incluir al menos un número';
    if (!v.contains(RegExp(r'[!@#\$%^&*(),.?":{}|<>\-_=+\[\]\\;/~`]'))) {
      return 'Debe incluir al menos un carácter especial';
    }
    return null;
  }

  Future<void> _submit() async {
    setState(() => _serverError = null);
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);
    try {
      await ApiClient.instance.post(
        '/usuarios/me/cambiar-password',
        data: {
          'password_actual': _actualCtrl.text,
          'password_nueva': _nuevaCtrl.text,
        },
      );
      if (!mounted) return;
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Contraseña actualizada correctamente'),
          backgroundColor: AppColors.successBtn,
        ),
      );
    } on DioException catch (e) {
      final detail = (e.response?.data as Map?)?['detail'] as String?;
      setState(() {
        _serverError = detail == 'La contraseña actual es incorrecta'
            ? 'La contraseña actual es incorrecta'
            : 'Ocurrió un error. Intenta de nuevo.';
        _isLoading = false;
      });
      _formKey.currentState!.validate();
    } catch (_) {
      setState(() {
        _serverError = 'Ocurrió un error. Intenta de nuevo.';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.gray300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Text('Cambiar contraseña', style: AppTextStyles.heading2),
            const SizedBox(height: 24),

            Text('Contraseña actual', style: AppTextStyles.smallSemibold),
            const SizedBox(height: 8),
            TextFormField(
              controller: _actualCtrl,
              obscureText: _obscureActual,
              style: AppTextStyles.bodyRegular,
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.lock_outline,
                    size: 20, color: AppColors.gray500),
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscureActual
                        ? Icons.visibility_outlined
                        : Icons.visibility_off_outlined,
                    size: 20,
                    color: AppColors.gray500,
                  ),
                  onPressed: () =>
                      setState(() => _obscureActual = !_obscureActual),
                ),
              ),
              validator: (v) {
                if (v == null || v.isEmpty) return 'Ingresa tu contraseña actual';
                if (_serverError != null) return _serverError;
                return null;
              },
            ),
            const SizedBox(height: 16),

            Text('Nueva contraseña', style: AppTextStyles.smallSemibold),
            const SizedBox(height: 8),
            TextFormField(
              controller: _nuevaCtrl,
              obscureText: _obscureNueva,
              style: AppTextStyles.bodyRegular,
              onChanged: (_) => setState(() {}),
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.lock_outline,
                    size: 20, color: AppColors.gray500),
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscureNueva
                        ? Icons.visibility_outlined
                        : Icons.visibility_off_outlined,
                    size: 20,
                    color: AppColors.gray500,
                  ),
                  onPressed: () =>
                      setState(() => _obscureNueva = !_obscureNueva),
                ),
              ),
              validator: _validateNueva,
            ),
            const SizedBox(height: 6),
            _PasswordRequirements(password: _nuevaCtrl.text),
            const SizedBox(height: 16),

            Text('Confirmar nueva contraseña',
                style: AppTextStyles.smallSemibold),
            const SizedBox(height: 8),
            TextFormField(
              controller: _confirmCtrl,
              obscureText: _obscureConfirm,
              style: AppTextStyles.bodyRegular,
              decoration: InputDecoration(
                prefixIcon: const Icon(Icons.lock_outline,
                    size: 20, color: AppColors.gray500),
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscureConfirm
                        ? Icons.visibility_outlined
                        : Icons.visibility_off_outlined,
                    size: 20,
                    color: AppColors.gray500,
                  ),
                  onPressed: () =>
                      setState(() => _obscureConfirm = !_obscureConfirm),
                ),
              ),
              validator: (v) {
                if (v == null || v.isEmpty) return 'Confirma la nueva contraseña';
                if (v != _nuevaCtrl.text) return 'Las contraseñas no coinciden';
                return null;
              },
            ),
            const SizedBox(height: 28),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _submit,
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: AppColors.white),
                      )
                    : const Text('Actualizar contraseña'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Widgets auxiliares ─────────────────────────────────────────────────────

class _PasswordRequirements extends StatelessWidget {
  const _PasswordRequirements({required this.password});
  final String password;

  @override
  Widget build(BuildContext context) {
    final rules = [
      (label: '8 caracteres mínimo', met: password.length >= 8),
      (label: '1 letra mayúscula', met: password.contains(RegExp(r'[A-Z]'))),
      (label: '1 número', met: password.contains(RegExp(r'[0-9]'))),
      (
        label: '1 carácter especial',
        met: password.contains(
            RegExp(r'[!@#\$%^&*(),.?":{}|<>\-_=+\[\]\\;/~`]'))
      ),
    ];

    return Wrap(
      spacing: 8,
      runSpacing: 4,
      children: rules
          .map((r) => Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    r.met
                        ? Icons.check_circle_rounded
                        : Icons.radio_button_unchecked_rounded,
                    size: 14,
                    color: r.met ? AppColors.successText : AppColors.gray400,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    r.label,
                    style: AppTextStyles.badge.copyWith(
                      color: r.met ? AppColors.successText : AppColors.gray400,
                    ),
                  ),
                ],
              ))
          .toList(),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(label,
            style: AppTextStyles.small.copyWith(color: AppColors.gray500)),
        const Spacer(),
        Text(value, style: AppTextStyles.smallSemibold),
      ],
    );
  }
}

class _PropertyRow extends StatelessWidget {
  const _PropertyRow({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label,
            style:
                AppTextStyles.bodyRegular.copyWith(color: AppColors.gray500)),
        Text(value, style: AppTextStyles.bodyMedium),
      ],
    );
  }
}
