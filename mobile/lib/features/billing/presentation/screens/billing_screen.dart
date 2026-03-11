import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/core/utils/formatters.dart';
import 'package:habitare/features/billing/domain/billing_model.dart';
import 'package:habitare/features/billing/presentation/providers/billing_provider.dart';
import 'package:habitare/shared/widgets/async_widget.dart';

class BillingScreen extends ConsumerWidget {
  const BillingScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(billingProvider);
    return Scaffold(
      backgroundColor: AppColors.scaffold,
      appBar: AppBar(
        title: Text('Estado de Cuenta', style: AppTextStyles.heading2),
      ),
      body: AsyncWidget(
        value: async,
        data: (facturas) {
          final unpaid = facturas
              .where((f) => f.estado == 'pendiente' || f.estado == 'vencida')
              .toList();
          final totalPending = unpaid.fold<double>(
            0,
            (sum, f) => sum + (double.tryParse(f.montoTotal) ?? 0),
          );
          final earliest = unpaid.isNotEmpty
              ? unpaid.reduce((a, b) =>
                  a.fechaVencimiento.compareTo(b.fechaVencimiento) <= 0 ? a : b)
              : null;

          return SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Saldo Pendiente',
                          style: AppTextStyles.bodyRegular
                              .copyWith(color: AppColors.white)),
                      const SizedBox(height: 6),
                      Text(
                        formatAmount(totalPending.toStringAsFixed(0)),
                        style: AppTextStyles.display
                            .copyWith(color: AppColors.white),
                      ),
                      if (earliest != null) ...[
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(Icons.calendar_today_outlined,
                                size: 14, color: AppColors.white),
                            const SizedBox(width: 6),
                            Text(
                              'Vence: ${formatDate(earliest.fechaVencimiento)}',
                              style: AppTextStyles.bodyRegular
                                  .copyWith(color: AppColors.white),
                            ),
                          ],
                        ),
                      ],
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: unpaid.isEmpty
                              ? null
                              : () => _showPaymentSheet(
                                  context, formatAmount(totalPending.toStringAsFixed(0))),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.white,
                            foregroundColor: AppColors.primary,
                            minimumSize: const Size(double.infinity, 44),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8)),
                            elevation: 0,
                          ),
                          child: Text('Pagar ahora',
                              style: AppTextStyles.bodyLarge
                                  .copyWith(color: AppColors.primary)),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                Text('Historial de Pagos', style: AppTextStyles.heading3),
                const SizedBox(height: 12),
                if (facturas.isEmpty)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Text('No hay facturas registradas',
                          style: AppTextStyles.body
                              .copyWith(color: AppColors.gray500)),
                    ),
                  )
                else
                  ...facturas.map((f) => _PaymentCard(factura: f)),
              ],
            ),
          );
        },
      ),
    );
  }

  void _showPaymentSheet(BuildContext context, String total) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _PaymentSheet(total: total),
    );
  }
}

class _PaymentCard extends StatelessWidget {
  const _PaymentCard({required this.factura});
  final FacturaModel factura;

  @override
  Widget build(BuildContext context) {
    final isPaid = factura.estado == 'pagada';
    final isVencida = factura.estado == 'vencida';
    final colors = estadoFacturaColors(factura.estado);
    final label = estadoFacturaLabel(factura.estado);

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.gray200),
      ),
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          tilePadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
          leading: Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: colors.bg,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              isPaid
                  ? Icons.check_circle_outline_rounded
                  : isVencida
                      ? Icons.error_outline_rounded
                      : Icons.pending_outlined,
              size: 20,
              color: colors.color,
            ),
          ),
          title: Text(factura.periodo, style: AppTextStyles.bodyMedium),
          subtitle: Text(
            isPaid
                ? label
                : 'Vence: ${formatDate(factura.fechaVencimiento)}',
            style:
                AppTextStyles.small.copyWith(color: colors.color),
          ),
          trailing: Text(
            formatAmount(factura.montoTotal),
            style: AppTextStyles.bodySemibold.copyWith(
              color: isPaid ? AppColors.gray900 : colors.color,
            ),
          ),
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Factura #${factura.numeroFactura}',
                    style:
                        AppTextStyles.small.copyWith(color: AppColors.gray500)),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: colors.bg,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(label,
                      style:
                          AppTextStyles.badge.copyWith(color: colors.color)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _PaymentSheet extends StatelessWidget {
  const _PaymentSheet({required this.total});
  final String total;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
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
          Text('Pago en Línea', style: AppTextStyles.heading2),
          const SizedBox(height: 6),
          Text('Total a pagar: $total',
              style:
                  AppTextStyles.body.copyWith(color: AppColors.gray500)),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.infoBg,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                const Icon(Icons.info_outline_rounded,
                    color: AppColors.infoText, size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'El pago en línea estará disponible próximamente. Comunícate con administración.',
                    style: AppTextStyles.small
                        .copyWith(color: AppColors.infoText),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cerrar'),
            ),
          ),
        ],
      ),
    );
  }
}
