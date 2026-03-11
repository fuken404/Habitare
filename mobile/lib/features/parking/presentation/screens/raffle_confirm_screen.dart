import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';

class RaffleConfirmScreen extends StatelessWidget {
  const RaffleConfirmScreen({super.key});

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
                  color: AppColors.purpleBg,
                  borderRadius: BorderRadius.circular(48),
                ),
                child: const Icon(Icons.emoji_events_outlined,
                    size: 52, color: AppColors.purpleText),
              ),
              const SizedBox(height: 28),
              Text('Inscripción Confirmada', style: AppTextStyles.heading1,
                  textAlign: TextAlign.center),
              const SizedBox(height: 8),
              Text(
                'Tu inscripción al sorteo de parqueadero ha sido confirmada exitosamente.',
                style: AppTextStyles.body.copyWith(color: AppColors.gray500),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.gray200),
                ),
                child: Column(
                  children: [
                    _Row(label: 'Inscripción N°', value: '#128'),
                    const Divider(height: 16),
                    _Row(label: 'Período', value: 'Noviembre 2024'),
                    const Divider(height: 16),
                    _Row(label: 'Fecha del sorteo', value: '31 Oct 2024'),
                    const Divider(height: 16),
                    _Row(label: 'Estado', value: 'Inscrito'),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.purpleBg,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.notifications_outlined,
                        size: 16, color: AppColors.purpleText),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Recibirás una notificación con el resultado del sorteo el 31 de octubre.',
                        style: AppTextStyles.small
                            .copyWith(color: AppColors.purpleText),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => context.go('/dashboard'),
                  style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.purpleText),
                  child: const Text('Ir al inicio'),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () => context.go('/parking/raffle'),
                  child: const Text('Ver inscripción'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Row extends StatelessWidget {
  const _Row({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: AppTextStyles.small.copyWith(color: AppColors.gray500)),
        Text(value, style: AppTextStyles.smallSemibold),
      ],
    );
  }
}
