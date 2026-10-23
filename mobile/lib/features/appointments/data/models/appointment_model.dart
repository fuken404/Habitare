class DisponibilidadModel {
  final String id;
  final String fecha;
  final String horaInicio;
  final String horaFin;
  final int cuposTotales;
  final int cuposDisponibles;

  const DisponibilidadModel({
    required this.id,
    required this.fecha,
    required this.horaInicio,
    required this.horaFin,
    required this.cuposTotales,
    required this.cuposDisponibles,
  });

  factory DisponibilidadModel.fromJson(Map<String, dynamic> json) {
    return DisponibilidadModel(
      id: json['id'] as String,
      fecha: json['fecha'] as String? ?? '',
      horaInicio: json['hora_inicio'] as String? ?? '',
      horaFin: json['hora_fin'] as String? ?? '',
      cuposTotales: json['cupos_totales'] as int? ?? 1,
      cuposDisponibles: json['cupos_disponibles'] as int? ?? 0,
    );
  }

  bool get tieneDisponibilidad => cuposDisponibles > 0;
}

class CitaModel {
  final String id;
  final String disponibilidadId;
  final String motivo;
  final String estado;
  final String? observacionesAdmin;
  final String? fecha;
  final String? horaInicio;
  final String? horaFin;
  final String createdAt;

  const CitaModel({
    required this.id,
    required this.disponibilidadId,
    required this.motivo,
    required this.estado,
    this.observacionesAdmin,
    this.fecha,
    this.horaInicio,
    this.horaFin,
    required this.createdAt,
  });

  factory CitaModel.fromJson(Map<String, dynamic> json) {
    return CitaModel(
      id: json['id'] as String,
      disponibilidadId: json['disponibilidad_id'] as String,
      motivo: json['motivo'] as String? ?? '',
      estado: json['estado'] as String? ?? 'solicitada',
      observacionesAdmin: json['observaciones_admin'] as String?,
      fecha: json['fecha'] as String?,
      horaInicio: json['hora_inicio'] as String?,
      horaFin: json['hora_fin'] as String?,
      createdAt: json['created_at'] as String? ?? '',
    );
  }
}
