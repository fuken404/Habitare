import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/features/appointments/data/models/appointment_model.dart';
import 'package:habitare/features/appointments/presentation/providers/appointments_provider.dart';
import 'package:intl/intl.dart';

const _estadoLabels = {
  'solicitada': 'Solicitada',
  'confirmada': 'Confirmada',
  'rechazada':  'Rechazada',
  'completada': 'Completada',
};

const _estadoColors = {
  'solicitada': Color(0xFFA16207),
  'confirmada': Color(0xFF15803D),
  'rechazada':  Color(0xFFDC2626),
  'completada': Color(0xFF64748B),
};

const _estadoBgs = {
  'solicitada': Color(0xFFFEF9C3),
  'confirmada': Color(0xFFDCFCE7),
  'rechazada':  Color(0xFFFEE2E2),
  'completada': Color(0xFFF1F5F9),
};

class AppointmentsScreen extends ConsumerStatefulWidget {
  const AppointmentsScreen({super.key});

  @override
  ConsumerState<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends ConsumerState<AppointmentsScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffold,
      appBar: AppBar(
        title: Text('Citas con Administración', style: AppTextStyles.heading2),
        bottom: TabBar(
          controller: _tabs,
          labelStyle: AppTextStyles.bodyMedium,
          unselectedLabelStyle: AppTextStyles.bodyRegular,
          indicatorColor: AppColors.primary,
          tabs: const [
            Tab(text: 'Disponibilidad'),
            Tab(text: 'Mis Citas'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabs,
        children: [
          _DisponibilidadTab(onSolicitud: () => ref.invalidate(misCitasProvider)),
          _MisCitasTab(),
        ],
      ),
    );
  }
}

// ── Tab disponibilidad ────────────────────────────────────────────────────────
class _DisponibilidadTab extends ConsumerWidget {
  final VoidCallback onSolicitud;
  const _DisponibilidadTab({required this.onSolicitud});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(disponibilidadesProvider);
    return async.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, __) => Center(
        child: Text('Error al cargar disponibilidad',
            style: AppTextStyles.bodyRegular.copyWith(color: AppColors.dangerText)),
      ),
      data: (slots) {
        final disponibles = slots.where((s) => s.tieneDisponibilidad).toList();
        if (disponibles.isEmpty) {
          return Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.calendar_today_outlined, size: 48, color: AppColors.gray400),
                const SizedBox(height: 12),
                Text('Sin franjas disponibles',
                    style: AppTextStyles.bodyRegular.copyWith(color: AppColors.gray500)),
              ],
            ),
          );
        }
        return RefreshIndicator(
          onRefresh: () async => ref.invalidate(disponibilidadesProvider),
          child: ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: disponibles.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (_, i) => _SlotCard(
              slot: disponibles[i],
              onTap: () => _showSolicitarSheet(context, ref, disponibles[i]),
            ),
          ),
        );
      },
    );
  }

  void _showSolicitarSheet(
      BuildContext context, WidgetRef ref, DisponibilidadModel slot) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => _SolicitarSheet(
        slot: slot,
        onSolicitud: () {
          ref.invalidate(disponibilidadesProvider);
          onSolicitud();
        },
      ),
    );
  }
}

// ── Card de franja disponible ─────────────────────────────────────────────────
class _SlotCard extends StatelessWidget {
  final DisponibilidadModel slot;
  final VoidCallback onTap;
  const _SlotCard({required this.slot, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat('EEEE d \'de\' MMMM', 'es');
    final fecha = DateTime.tryParse(slot.fecha);
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.gray200),
        ),
        child: Row(
          children: [
            Container(
              width: 44, height: 44,
              decoration: BoxDecoration(
                color: AppColors.info2Bg,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.calendar_today_rounded,
                  size: 20, color: AppColors.primary),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    fecha != null ? fmt.format(fecha) : slot.fecha,
                    style: AppTextStyles.bodyMedium,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${slot.horaInicio.substring(0, 5)} – ${slot.horaFin.substring(0, 5)}',
                    style: AppTextStyles.small.copyWith(color: AppColors.gray500),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFDCFCE7),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                '${slot.cuposDisponibles} cupo${slot.cuposDisponibles != 1 ? 's' : ''}',
                style: AppTextStyles.small.copyWith(
                  color: AppColors.successBtn, fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Sheet solicitar cita ──────────────────────────────────────────────────────
class _SolicitarSheet extends StatefulWidget {
  final DisponibilidadModel slot;
  final VoidCallback onSolicitud;
  const _SolicitarSheet({required this.slot, required this.onSolicitud});

  @override
  State<_SolicitarSheet> createState() => _SolicitarSheetState();
}

class _SolicitarSheetState extends State<_SolicitarSheet> {
  final _formKey = GlobalKey<FormState>();
  final _motivoCtrl = TextEditingController();
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _motivoCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; });
    try {
      await solicitarCita(
        disponibilidadId: widget.slot.id,
        motivo: _motivoCtrl.text.trim(),
      );
      if (!mounted) return;
      Navigator.of(context).pop();
      widget.onSolicitud();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cita solicitada exitosamente')),
      );
    } on DioException catch (e) {
      final detail = (e.response?.data as Map?)?['detail'];
      setState(() => _error = detail is String ? detail : 'Error al solicitar la cita');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat('EEEE d \'de\' MMMM', 'es');
    final fecha = DateTime.tryParse(widget.slot.fecha);
    return Padding(
      padding: EdgeInsets.fromLTRB(
        24, 16, 24, MediaQuery.of(context).viewInsets.bottom + 24),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(width: 40, height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.gray300, borderRadius: BorderRadius.circular(2))),
            ),
            const SizedBox(height: 16),
            Text('Solicitar cita', style: AppTextStyles.heading3),
            const SizedBox(height: 8),
            Text(
              '${fecha != null ? fmt.format(fecha) : widget.slot.fecha} · '
              '${widget.slot.horaInicio.substring(0, 5)} – ${widget.slot.horaFin.substring(0, 5)}',
              style: AppTextStyles.small.copyWith(color: AppColors.gray500),
            ),
            const SizedBox(height: 20),
            Text('Motivo de la cita', style: AppTextStyles.smallSemibold),
            const SizedBox(height: 8),
            TextFormField(
              controller: _motivoCtrl,
              maxLines: 3,
              textCapitalization: TextCapitalization.sentences,
              style: AppTextStyles.bodyRegular,
              decoration: const InputDecoration(
                hintText: 'Describe el motivo de la cita...',
                alignLabelWithHint: true,
                contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              ),
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Ingresa el motivo' : null,
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.dangerBg,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(_error!,
                    style: AppTextStyles.small.copyWith(color: AppColors.dangerText)),
              ),
            ],
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _loading ? null : _submit,
                child: _loading
                    ? const SizedBox(
                        height: 20, width: 20,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: AppColors.white),
                      )
                    : const Text('Solicitar cita'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Tab Mis Citas ─────────────────────────────────────────────────────────────
class _MisCitasTab extends ConsumerWidget {
  const _MisCitasTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(misCitasProvider);
    return async.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, __) => Center(
        child: Text('Error al cargar tus citas',
            style: AppTextStyles.bodyRegular.copyWith(color: AppColors.dangerText)),
      ),
      data: (citas) {
        if (citas.isEmpty) {
          return Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.event_busy_rounded, size: 48, color: AppColors.gray400),
                const SizedBox(height: 12),
                Text('No tienes citas registradas',
                    style: AppTextStyles.bodyRegular.copyWith(color: AppColors.gray500)),
              ],
            ),
          );
        }
        return RefreshIndicator(
          onRefresh: () async => ref.invalidate(misCitasProvider),
          child: ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: citas.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (_, i) => _CitaCard(cita: citas[i]),
          ),
        );
      },
    );
  }
}

// ── Card de cita ──────────────────────────────────────────────────────────────
class _CitaCard extends StatelessWidget {
  final CitaModel cita;
  const _CitaCard({required this.cita});

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat('dd/MM/yy', 'es');
    final label = _estadoLabels[cita.estado] ?? cita.estado;
    final color = _estadoColors[cita.estado] ?? AppColors.gray500;
    final bg    = _estadoBgs[cita.estado]    ?? AppColors.gray100;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.gray200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(cita.motivo,
                    style: AppTextStyles.bodyMedium,
                    overflow: TextOverflow.ellipsis),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: bg, borderRadius: BorderRadius.circular(6)),
                child: Text(label,
                    style: AppTextStyles.small.copyWith(
                      color: color, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
          if (cita.fecha != null) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                Icon(Icons.calendar_today_rounded, size: 13, color: AppColors.gray400),
                const SizedBox(width: 4),
                Text(
                  '${fmt.format(DateTime.parse(cita.fecha!))} · '
                  '${cita.horaInicio?.substring(0, 5) ?? ''} – '
                  '${cita.horaFin?.substring(0, 5) ?? ''}',
                  style: AppTextStyles.small.copyWith(color: AppColors.gray400),
                ),
              ],
            ),
          ],
          if (cita.observacionesAdmin != null) ...[
            const SizedBox(height: 6),
            Text(
              'Obs. admin: ${cita.observacionesAdmin}',
              style: AppTextStyles.small.copyWith(color: AppColors.gray500),
            ),
          ],
        ],
      ),
    );
  }
}
