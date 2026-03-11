class PackageModel {
  final String id;
  final String unidadId;
  final String estado;
  final String fechaRecepcion;
  final String? fechaEntrega;

  const PackageModel({
    required this.id,
    required this.unidadId,
    required this.estado,
    required this.fechaRecepcion,
    this.fechaEntrega,
  });

  factory PackageModel.fromJson(Map<String, dynamic> json) {
    return PackageModel(
      id: json['id'] as String,
      unidadId: json['unidad_id'] as String,
      estado: json['estado'] as String,
      fechaRecepcion: json['fecha_recepcion'] as String,
      fechaEntrega: json['fecha_entrega'] as String?,
    );
  }
}
