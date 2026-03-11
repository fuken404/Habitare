class TipoIncidenteModel {
  final String id;
  final String nombre;

  const TipoIncidenteModel({required this.id, required this.nombre});

  factory TipoIncidenteModel.fromJson(Map<String, dynamic> json) {
    return TipoIncidenteModel(
      id: json['id'] as String,
      nombre: json['nombre'] as String,
    );
  }
}
