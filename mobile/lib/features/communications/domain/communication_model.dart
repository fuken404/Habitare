class CommunicationModel {
  final String id;
  final String titulo;
  final String tipo;
  final String estado;
  final String? fechaPublicacion;

  const CommunicationModel({
    required this.id,
    required this.titulo,
    required this.tipo,
    required this.estado,
    this.fechaPublicacion,
  });

  factory CommunicationModel.fromJson(Map<String, dynamic> json) {
    return CommunicationModel(
      id: json['id'] as String,
      titulo: json['titulo'] as String,
      tipo: json['tipo'] as String,
      estado: json['estado'] as String,
      fechaPublicacion: json['fecha_publicacion'] as String?,
    );
  }
}

class CommunicationDetail {
  final String id;
  final String titulo;
  final String contenido;
  final String tipo;
  final String estado;
  final String? fechaPublicacion;

  const CommunicationDetail({
    required this.id,
    required this.titulo,
    required this.contenido,
    required this.tipo,
    required this.estado,
    this.fechaPublicacion,
  });

  factory CommunicationDetail.fromJson(Map<String, dynamic> json) {
    return CommunicationDetail(
      id: json['id'] as String,
      titulo: json['titulo'] as String,
      contenido: json['contenido'] as String,
      tipo: json['tipo'] as String,
      estado: json['estado'] as String,
      fechaPublicacion: json['fecha_publicacion'] as String?,
    );
  }
}
