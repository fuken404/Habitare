class CommonAreaModel {
  final String id;
  final String nombre;
  final int? capacidadMaxima;
  final bool requiereAprobacion;
  final bool isActiva;

  const CommonAreaModel({
    required this.id,
    required this.nombre,
    this.capacidadMaxima,
    required this.requiereAprobacion,
    required this.isActiva,
  });

  factory CommonAreaModel.fromJson(Map<String, dynamic> json) {
    return CommonAreaModel(
      id: json['id'] as String,
      nombre: json['nombre'] as String,
      capacidadMaxima: json['capacidad_maxima'] as int?,
      requiereAprobacion: json['requiere_aprobacion'] as bool,
      isActiva: json['is_activa'] as bool,
    );
  }
}

class ReservaModel {
  final String id;
  final String zonaComunId;
  final String unidadId;
  final String fechaReserva;
  final String horaInicio;
  final String horaFin;
  final String estado;

  const ReservaModel({
    required this.id,
    required this.zonaComunId,
    required this.unidadId,
    required this.fechaReserva,
    required this.horaInicio,
    required this.horaFin,
    required this.estado,
  });

  factory ReservaModel.fromJson(Map<String, dynamic> json) {
    return ReservaModel(
      id: json['id'] as String,
      zonaComunId: json['zona_comun_id'] as String,
      unidadId: json['unidad_id'] as String,
      fechaReserva: json['fecha_reserva'] as String,
      horaInicio: json['hora_inicio'] as String,
      horaFin: json['hora_fin'] as String,
      estado: json['estado'] as String,
    );
  }
}
