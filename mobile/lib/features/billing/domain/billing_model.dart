class FacturaModel {
  final String id;
  final String unidadId;
  final String numeroFactura;
  final String periodo;
  final String fechaVencimiento;
  final String montoTotal;
  final String estado;

  const FacturaModel({
    required this.id,
    required this.unidadId,
    required this.numeroFactura,
    required this.periodo,
    required this.fechaVencimiento,
    required this.montoTotal,
    required this.estado,
  });

  factory FacturaModel.fromJson(Map<String, dynamic> json) {
    return FacturaModel(
      id: json['id'] as String,
      unidadId: json['unidad_id'] as String,
      numeroFactura: json['numero_factura'] as String,
      periodo: json['periodo'] as String,
      fechaVencimiento: json['fecha_vencimiento'] as String,
      montoTotal: json['monto_total'] as String,
      estado: json['estado'] as String,
    );
  }
}
