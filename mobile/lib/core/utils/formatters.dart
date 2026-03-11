import 'package:flutter/material.dart';
import 'package:habitare/core/theme/app_colors.dart';

const _months = [
  '', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

String formatDate(String? isoDate) {
  if (isoDate == null || isoDate.isEmpty) return '';
  try {
    final dt = DateTime.parse(isoDate);
    return '${dt.day.toString().padLeft(2, '0')} ${_months[dt.month]} ${dt.year}';
  } catch (_) {
    return isoDate;
  }
}

String formatDateShort(String? isoDate) {
  if (isoDate == null || isoDate.isEmpty) return '';
  try {
    final dt = DateTime.parse(isoDate);
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));
    final date = DateTime(dt.year, dt.month, dt.day);
    final diff = today.difference(date).inDays;
    if (date == today) return 'Hoy';
    if (date == yesterday) return 'Ayer';
    if (diff < 7) return 'Hace $diff días';
    return '${dt.day} ${_months[dt.month]}';
  } catch (_) {
    return isoDate;
  }
}

String formatAmount(String? amount) {
  if (amount == null) return '\$0';
  try {
    final value = double.parse(amount);
    final intVal = value.toInt();
    final str = intVal.toString();
    final buffer = StringBuffer('\$');
    final mod = str.length % 3;
    for (var i = 0; i < str.length; i++) {
      if (i != 0 && (i - mod) % 3 == 0) buffer.write('.');
      buffer.write(str[i]);
    }
    return buffer.toString();
  } catch (_) {
    return '\$$amount';
  }
}

// Mapping tipo comunicado → colors
({Color color, Color bg}) tipoColors(String tipo) {
  switch (tipo.toLowerCase()) {
    case 'urgente':
      return (color: AppColors.dangerText, bg: AppColors.dangerBg);
    case 'mantenimiento':
      return (color: AppColors.primary, bg: AppColors.info2Bg);
    case 'asamblea':
      return (color: AppColors.purpleText, bg: AppColors.purpleBg);
    case 'obras':
      return (color: AppColors.warningText, bg: AppColors.warningBg);
    case 'informativo':
      return (color: AppColors.infoText, bg: AppColors.infoBg);
    case 'evento':
      return (color: AppColors.purpleText, bg: AppColors.purpleBg);
    case 'seguridad':
      return (color: AppColors.dangerText, bg: AppColors.dangerBg);
    default:
      return (color: AppColors.gray500, bg: AppColors.gray100);
  }
}

String tipoLabel(String tipo) {
  final map = {
    'urgente': 'Urgente',
    'mantenimiento': 'Mantenimiento',
    'asamblea': 'Asamblea',
    'obras': 'Obras',
    'informativo': 'Informativo',
    'evento': 'Evento',
    'seguridad': 'Seguridad',
  };
  return map[tipo.toLowerCase()] ?? tipo;
}

// Estado PQRS → colors
({Color color, Color bg}) estadoPqrsColors(String estado) {
  switch (estado.toLowerCase()) {
    case 'abierta':
      return (color: AppColors.infoText, bg: AppColors.infoBg);
    case 'en_proceso':
      return (color: AppColors.warningText, bg: AppColors.warningBg);
    case 'resuelta':
      return (color: AppColors.successText, bg: const Color(0xFFD1FAE5));
    case 'cerrada':
      return (color: AppColors.gray500, bg: AppColors.gray100);
    default:
      return (color: AppColors.gray500, bg: AppColors.gray100);
  }
}

String estadoPqrsLabel(String estado) {
  final map = {
    'abierta': 'Abierta',
    'en_proceso': 'En proceso',
    'resuelta': 'Resuelta',
    'cerrada': 'Cerrada',
  };
  return map[estado.toLowerCase()] ?? estado;
}

// Estado factura → colors
({Color color, Color bg}) estadoFacturaColors(String estado) {
  switch (estado.toLowerCase()) {
    case 'pendiente':
      return (color: AppColors.attentionText, bg: AppColors.attentionBg);
    case 'pagada':
      return (color: AppColors.successText, bg: const Color(0xFFD1FAE5));
    case 'vencida':
      return (color: AppColors.dangerText, bg: AppColors.dangerBg);
    case 'anulada':
      return (color: AppColors.gray500, bg: AppColors.gray100);
    default:
      return (color: AppColors.gray500, bg: AppColors.gray100);
  }
}

String estadoFacturaLabel(String estado) {
  final map = {
    'pendiente': 'Pendiente',
    'pagada': 'Pagada',
    'vencida': 'Vencida',
    'anulada': 'Anulada',
  };
  return map[estado.toLowerCase()] ?? estado;
}

// Estado paquete → colors
({Color color, Color bg}) estadoPaqueteColors(String estado) {
  switch (estado.toLowerCase()) {
    case 'pendiente':
      return (color: AppColors.attentionText, bg: AppColors.attentionBg);
    case 'entregado':
    case 'retirado':
      return (color: AppColors.successText, bg: const Color(0xFFD1FAE5));
    default:
      return (color: AppColors.gray500, bg: AppColors.gray100);
  }
}

String estadoPaqueteLabel(String estado) {
  final map = {
    'pendiente': 'En portería',
    'entregado': 'Entregado',
    'retirado': 'Retirado',
  };
  return map[estado.toLowerCase()] ?? estado;
}

// Estado reserva → colors
({Color color, Color bg}) estadoReservaColors(String estado) {
  switch (estado.toLowerCase()) {
    case 'confirmada':
      return (color: AppColors.successText, bg: const Color(0xFFD1FAE5));
    case 'pendiente':
      return (color: AppColors.warningText, bg: AppColors.warningBg);
    case 'cancelada':
      return (color: AppColors.dangerText, bg: AppColors.dangerBg);
    case 'completada':
      return (color: AppColors.gray500, bg: AppColors.gray100);
    default:
      return (color: AppColors.gray500, bg: AppColors.gray100);
  }
}

String estadoReservaLabel(String estado) {
  final map = {
    'confirmada': 'Confirmada',
    'pendiente': 'Pendiente',
    'cancelada': 'Cancelada',
    'completada': 'Completada',
  };
  return map[estado.toLowerCase()] ?? estado;
}
