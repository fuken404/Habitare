class IngresoExternoModel {
  final String id;
  final String nombre;
  final String? empresa;
  final String motivo;
  final String fechaHoraIngreso;
  final String? fechaHoraSalida;

  const IngresoExternoModel({
    required this.id,
    required this.nombre,
    this.empresa,
    required this.motivo,
    required this.fechaHoraIngreso,
    this.fechaHoraSalida,
  });

  factory IngresoExternoModel.fromJson(Map<String, dynamic> json) {
    return IngresoExternoModel(
      id: json['id'] as String,
      nombre: json['nombre'] as String? ?? '',
      empresa: json['empresa'] as String?,
      motivo: json['motivo'] as String? ?? '',
      fechaHoraIngreso: json['fecha_hora_ingreso'] as String? ?? '',
      fechaHoraSalida: json['fecha_hora_salida'] as String?,
    );
  }

  bool get tieneSalida => fechaHoraSalida != null;
}
