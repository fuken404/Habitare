import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';

class IncidentSuccessScreen extends StatelessWidget {
  const IncidentSuccessScreen({super.key, this.numeroRadicado});
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
              Container(
                width: 96,
                height: 96,
                decoration: BoxDecoration(
                  color: AppColors.dangerBg,
                  borderRadius: BorderRadius.circular(48),
                ),
                child: const Icon(Icons.check_circle_outline_rounded,
                    size: 52, color: AppColors.dangerText),
              ),
              const SizedBox(height: 28),
              Text('Reporte Enviado', style: AppTextStyles.heading1),
              const SizedBox(height: 8),
              Text(
                'Tu novedad ha sido registrada y será atendida por el equipo de administración.',
                style: AppTextStyles.body.copyWith(color: AppColors.gray500),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                decoration: BoxDecoration(
                  color: AppColors.dangerBg,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Column(
                  children: [
                    Text('Número de seguimiento',
                        style: AppTextStyles.small.copyWith(color: AppColors.gray500)),
                    const SizedBox(height: 4),
                    Text(numeroRadicado ?? '—',
                        style: AppTextStyles.bodyLarge
                            .copyWith(color: AppColors.dangerText)),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Tiempo estimado de atención: 24-48 horas hábiles.',
                style: AppTextStyles.small.copyWith(color: AppColors.gray500),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => context.go('/dashboard'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.dangerText,
                  ),
                  child: const Text('Ir al inicio'),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () => context.push('/incidents/new'),
                  child: const Text('Reportar otra novedad'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
