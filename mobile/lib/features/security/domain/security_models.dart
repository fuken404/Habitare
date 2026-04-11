// ── Domain enums ──────────────────────────────────────────────────────────

enum SecurityVisitorStatus { vigente, historial }

enum IncidenciaSeveridad { bajo, media, alta, critica }

// ── API Models ────────────────────────────────────────────────────────────

class SecurityVisitorApiModel {
  const SecurityVisitorApiModel({
    required this.id,
    required this.visitanteNombre,
    this.visitanteApellido,
    required this.tipoDocumento,
    required this.nDocumento,
    required this.fechaVisita,
    required this.requiereParqueadero,
    required this.estado,
    this.unidadId,
    this.numeroUnidad,
    this.nombreTorre,
    this.nombreAutorizadoPor,
  });

  final String id;
  final String visitanteNombre;
  final String? visitanteApellido;
  final String tipoDocumento;
  final String nDocumento;
  final String fechaVisita;
  final bool requiereParqueadero;
  final String estado;
  final String? unidadId;
  final String? numeroUnidad;
  final String? nombreTorre;
  final String? nombreAutorizadoPor;

  factory SecurityVisitorApiModel.fromJson(Map<String, dynamic> json) {
    final visitante = json['visitante'] as Map<String, dynamic>? ?? {};
    return SecurityVisitorApiModel(
      id: json['id'] as String,
      visitanteNombre: visitante['nombre'] as String? ?? '',
      visitanteApellido: visitante['apellido'] as String?,
      tipoDocumento: visitante['tipo_documento'] as String? ?? 'CC',
      nDocumento: visitante['n_documento'] as String? ?? '',
      fechaVisita: json['fecha_visita'] as String? ?? '',
      requiereParqueadero: json['requiere_parqueadero'] as bool? ?? false,
      estado: json['estado'] as String? ?? 'pendiente',
      unidadId: json['unidad_id'] as String?,
      numeroUnidad: json['numero_unidad'] as String?,
      nombreTorre: json['nombre_torre'] as String?,
      nombreAutorizadoPor: json['nombre_autorizado_por'] as String?,
    );
  }

  String get nombreCompleto => visitanteApellido != null
      ? '$visitanteNombre $visitanteApellido'
      : visitanteNombre;

  String get docCompleto => '$tipoDocumento $nDocumento';

  SecurityVisitorStatus get status {
    if (estado == 'cancelada' || estado == 'utilizada') {
      return SecurityVisitorStatus.historial;
    }
    try {
      final dt = DateTime.parse(fechaVisita);
      final today = DateTime.now();
      final visitDate = DateTime(dt.year, dt.month, dt.day);
      final todayDate = DateTime(today.year, today.month, today.day);
      return visitDate.isBefore(todayDate)
          ? SecurityVisitorStatus.historial
          : SecurityVisitorStatus.vigente;
    } catch (_) {
      return SecurityVisitorStatus.historial;
    }
  }

  String get fechaFormateada {
    if (fechaVisita.isEmpty) return '';
    try {
      final dt = DateTime.parse(fechaVisita);
      final today = DateTime.now();
      final todayDate = DateTime(today.year, today.month, today.day);
      final visitDate = DateTime(dt.year, dt.month, dt.day);
      if (visitDate == todayDate) return 'Hoy';
      if (visitDate == todayDate.add(const Duration(days: 1))) return 'Mañana';
      const months = [
        '', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
      ];
      return '${dt.day} ${months[dt.month]}';
    } catch (_) {
      return fechaVisita;
    }
  }
}

class IncidentApiModel {
  const IncidentApiModel({
    required this.id,
    required this.tipoId,
    required this.titulo,
    required this.estado,
    required this.severidad,
    required this.createdAt,
  });

  final String id;
  final String tipoId;
  final String titulo;
  final String estado;
  final String severidad;
  final String createdAt;

  factory IncidentApiModel.fromJson(Map<String, dynamic> json) {
    return IncidentApiModel(
      id: json['id'] as String,
      tipoId: json['tipo_id'] as String,
      titulo: json['titulo'] as String? ?? '',
      estado: json['estado'] as String? ?? 'reportado',
      severidad: json['severidad'] as String? ?? 'media',
      createdAt: json['created_at'] as String? ?? '',
    );
  }

  IncidenciaSeveridad get severidadEnum {
    switch (severidad.toLowerCase()) {
      case 'baja':
        return IncidenciaSeveridad.bajo;
      case 'alta':
        return IncidenciaSeveridad.alta;
      case 'critica':
        return IncidenciaSeveridad.critica;
      default:
        return IncidenciaSeveridad.media;
    }
  }

  String get fechaFormateada {
    if (createdAt.isEmpty) return '';
    try {
      final dt = DateTime.parse(createdAt);
      const months = [
        '', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
      ];
      return '${dt.day} ${months[dt.month]}';
    } catch (_) {
      return '';
    }
  }
}

class TipoIncidenteApiModel {
  const TipoIncidenteApiModel({
    required this.id,
    required this.nombre,
    this.descripcion,
  });

  final String id;
  final String nombre;
  final String? descripcion;

  factory TipoIncidenteApiModel.fromJson(Map<String, dynamic> json) {
    return TipoIncidenteApiModel(
      id: json['id'] as String,
      nombre: json['nombre'] as String,
      descripcion: json['descripcion'] as String?,
    );
  }
}

class ZonaApiModel {
  const ZonaApiModel({required this.id, required this.nombre});

  final String id;
  final String nombre;

  factory ZonaApiModel.fromJson(Map<String, dynamic> json) {
    return ZonaApiModel(
      id: json['id'] as String,
      nombre: json['nombre'] as String,
    );
  }
}

class LugarParqueaderoModel {
  const LugarParqueaderoModel({
    required this.id,
    required this.numero,
    required this.tipo,
    required this.isActivo,
    required this.isOcupado,
  });

  final String id;
  final String numero;
  final String tipo;
  final bool isActivo;
  final bool isOcupado;

  factory LugarParqueaderoModel.fromJson(Map<String, dynamic> json) {
    return LugarParqueaderoModel(
      id: json['id'] as String,
      numero: json['numero'] as String,
      tipo: json['tipo'] as String? ?? 'mixto',
      isActivo: json['is_activo'] as bool? ?? true,
      isOcupado: json['is_ocupado'] as bool? ?? false,
    );
  }
}

class VisitorParkingModel {
  const VisitorParkingModel({
    required this.id,
    required this.lugarId,
    required this.numero,
    required this.tipo,
    required this.fechaHoraAsignacion,
    this.nombreVisitante,
    this.tipoVehiculo,
    this.placa,
  });

  final String id;
  final String lugarId;
  final String numero;
  final String tipo;
  final String fechaHoraAsignacion;
  final String? nombreVisitante;
  final String? tipoVehiculo;
  final String? placa;

  factory VisitorParkingModel.fromJson(Map<String, dynamic> json) {
    return VisitorParkingModel(
      id: json['id'] as String,
      lugarId: json['lugar_id'] as String? ?? '',
      numero: json['numero'] as String? ?? '',
      tipo: json['tipo'] as String? ?? 'mixto',
      fechaHoraAsignacion: json['fecha_hora_asignacion'] as String? ?? '',
      nombreVisitante: json['nombre_visitante'] as String?,
      tipoVehiculo: json['tipo_vehiculo'] as String?,
      placa: json['placa'] as String?,
    );
  }

  String get horaFormateada {
    try {
      final dt = DateTime.parse(fechaHoraAsignacion).toLocal();
      final h = dt.hour;
      final m = dt.minute.toString().padLeft(2, '0');
      final period = h >= 12 ? 'PM' : 'AM';
      final h12 = h % 12 == 0 ? 12 : h % 12;
      return '$h12:$m $period';
    } catch (_) {
      return fechaHoraAsignacion;
    }
  }
}

class ReservaApiModel {
  ReservaApiModel({
    required this.id,
    required this.zonaComunId,
    required this.unidadId,
    required this.fechaReserva,
    required this.horaInicio,
    required this.horaFin,
    required this.estado,
    this.zonaNombre,
    this.nombreResidente,
    this.numeroUnidad,
    this.nombreTorre,
  });

  final String id;
  final String zonaComunId;
  final String? unidadId;
  final String fechaReserva;
  final String horaInicio;
  final String horaFin;
  final String estado;
  String? zonaNombre;
  final String? nombreResidente;
  final String? numeroUnidad;
  final String? nombreTorre;

  factory ReservaApiModel.fromJson(Map<String, dynamic> json) {
    return ReservaApiModel(
      id: json['id'] as String,
      zonaComunId: json['zona_comun_id'] as String,
      unidadId: json['unidad_id'] as String?,
      fechaReserva: json['fecha_reserva'] as String? ?? '',
      horaInicio: _formatTime(json['hora_inicio'] as String? ?? ''),
      horaFin: _formatTime(json['hora_fin'] as String? ?? ''),
      estado: json['estado'] as String? ?? 'confirmada',
      nombreResidente: json['nombre_residente'] as String?,
      numeroUnidad: json['numero_unidad'] as String?,
      nombreTorre: json['nombre_torre'] as String?,
    );
  }

  static String _formatTime(String time) {
    // "14:00:00" → "2:00PM"
    try {
      final parts = time.split(':');
      int hour = int.parse(parts[0]);
      final min = parts[1];
      final period = hour >= 12 ? 'PM' : 'AM';
      if (hour > 12) hour -= 12;
      if (hour == 0) hour = 12;
      return min == '00' ? '$hour$period' : '$hour:$min$period';
    } catch (_) {
      return time;
    }
  }

  String get fechaFormateada {
    try {
      final dt = DateTime.parse(fechaReserva);
      const months = [
        '', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
      ];
      return '${dt.day} ${months[dt.month]}, ${dt.year}';
    } catch (_) {
      return fechaReserva;
    }
  }
}
