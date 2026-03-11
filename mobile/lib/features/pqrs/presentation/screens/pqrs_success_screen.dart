import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';

class PqrsSuccessScreen extends StatelessWidget {
  const PqrsSuccessScreen({super.key, this.numeroRadicado});
  final String? numeroRadicado;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffold,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // ── Icono ─────────────────────────────────────────────────────
              Container(
                width: 96,
                height: 96,
                decoration: BoxDecoration(
                  color: const Color(0xFFD1FAE5),
                  borderRadius: BorderRadius.circular(48),
                ),
                child: const Icon(
                  Icons.check_circle_outline_rounded,
                  size: 52,
                  color: AppColors.successText,
                ),
              ),
              const SizedBox(height: 28),

              // ── Texto ─────────────────────────────────────────────────────
              Text('PQRS Radicada', style: AppTextStyles.heading1),
              const SizedBox(height: 8),
              Text(
                'Tu PQRS ha sido radicada exitosamente.',
                style: AppTextStyles.body.copyWith(color: AppColors.gray500),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),

              // ── Radicado ──────────────────────────────────────────────────
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                decoration: BoxDecoration(
                  color: AppColors.info2Bg,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Column(
                  children: [
                    Text('Número de Radicado',
                        style: AppTextStyles.small
                            .copyWith(color: AppColors.gray500)),
                    const SizedBox(height: 4),
                    Text(numeroRadicado ?? '—',
                        style: AppTextStyles.bodyLarge
                            .copyWith(color: AppColors.primary)),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Recibirás respuesta en un plazo máximo de 15 días hábiles.',
                style: AppTextStyles.small.copyWith(color: AppColors.gray500),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),

              // ── Botones ───────────────────────────────────────────────────
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => context.go('/pqrs'),
                  child: const Text('Ver mis PQRS'),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () => context.go('/dashboard'),
                  child: const Text('Ir al inicio'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
