import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';

class ReserveSuccessScreen extends StatelessWidget {
  const ReserveSuccessScreen({super.key});

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
                  color: const Color(0xFFD1FAE5),
                  borderRadius: BorderRadius.circular(48),
                ),
                child: const Icon(Icons.check_circle_outline_rounded,
                    size: 52, color: AppColors.successBtn),
              ),
              const SizedBox(height: 28),
              Text('Reserva Confirmada', style: AppTextStyles.heading1),
              const SizedBox(height: 8),
              Text(
                'Tu reserva ha sido registrada exitosamente.',
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
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _DetailRow(icon: Icons.meeting_room_outlined, label: 'Zona', value: 'Salón Comunal'),
                    const SizedBox(height: 8),
                    _DetailRow(icon: Icons.calendar_today_outlined, label: 'Fecha', value: '12 Oct 2024'),
                    const SizedBox(height: 8),
                    _DetailRow(icon: Icons.access_time_outlined, label: 'Horario', value: '4:00 PM - 6:00 PM'),
                  ],
                ),
              ),
              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => context.go('/common-areas/my-reservations'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.successBtn,
                  ),
                  child: const Text('Ver mis reservas'),
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

class _DetailRow extends StatelessWidget {
  const _DetailRow({required this.icon, required this.label, required this.value});
  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppColors.gray500),
        const SizedBox(width: 8),
        Text('$label: ', style: AppTextStyles.small.copyWith(color: AppColors.gray500)),
        Text(value, style: AppTextStyles.small),
      ],
    );
  }
}
