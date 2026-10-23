class PqrsModel {
  final String id;
  final String asunto;
  final String estado;
  final String prioridad;
  final String? tipo;
  final String? tipoIncidenteId;
  final String? categoriaId;
  final String? numeroRadicado;
  final String? severidad;
  final String? ubicacion;
  final String radicadoPor;
  final String createdAt;

  const PqrsModel({
    required this.id,
    required this.asunto,
    required this.estado,
    required this.prioridad,
    this.tipo,
    this.tipoIncidenteId,
    this.categoriaId,
    this.numeroRadicado,
    this.severidad,
    this.ubicacion,
    required this.radicadoPor,
    required this.createdAt,
  });

  factory PqrsModel.fromJson(Map<String, dynamic> json) {
    return PqrsModel(
      id: json['id'] as String,
      asunto: json['asunto'] as String,
      estado: json['estado'] as String,
      prioridad: json['prioridad'] as String,
      tipo: json['tipo'] as String?,
      tipoIncidenteId: json['tipo_incidente_id'] as String?,
      categoriaId: json['categoria_id'] as String?,
      numeroRadicado: json['numero_radicado'] as String?,
      severidad: json['severidad'] as String?,
      ubicacion: json['ubicacion'] as String?,
      radicadoPor: json['radicado_por'] as String,
      createdAt: json['created_at'] as String,
    );
  }
}

class PqrsCategoriaModel {
  final String id;
  final String nombre;

  const PqrsCategoriaModel({required this.id, required this.nombre});

  factory PqrsCategoriaModel.fromJson(Map<String, dynamic> json) {
    return PqrsCategoriaModel(
      id: json['id'] as String,
      nombre: json['nombre'] as String,
    );
  }
}

class MensajePqrsModel {
  final String id;
  final String autorId;
  final String contenido;
  final bool isInterno;
  final String createdAt;

  const MensajePqrsModel({
    required this.id,
    required this.autorId,
    required this.contenido,
    required this.isInterno,
    required this.createdAt,
  });

  factory MensajePqrsModel.fromJson(Map<String, dynamic> json) {
    return MensajePqrsModel(
      id: json['id'] as String,
      autorId: json['autor_id'] as String,
      contenido: json['contenido'] as String,
      isInterno: json['is_interno'] as bool,
      createdAt: json['created_at'] as String,
    );
  }
}

class AdjuntoPqrsModel {
  final String id;
  final String nombre;
  final String? mimeType;
  final String contenidoB64;

  const AdjuntoPqrsModel({
    required this.id,
    required this.nombre,
    this.mimeType,
    required this.contenidoB64,
  });

  factory AdjuntoPqrsModel.fromJson(Map<String, dynamic> json) {
    return AdjuntoPqrsModel(
      id: json['id'] as String,
      nombre: json['nombre'] as String,
      mimeType: json['mime_type'] as String?,
      contenidoB64: json['contenido_b64'] as String? ?? '',
    );
  }
}

class PqrsDetailModel {
  final String id;
  final String asunto;
  final String descripcion;
  final String estado;
  final String prioridad;
  final String? tipo;
  final String? tipoIncidenteId;
  final String? categoriaId;
  final String? numeroRadicado;
  final String? severidad;
  final String? ubicacion;
  final String radicadoPor;
  final String createdAt;
  final List<MensajePqrsModel> mensajes;
  final List<AdjuntoPqrsModel> adjuntos;

  const PqrsDetailModel({
    required this.id,
    required this.asunto,
    required this.descripcion,
    required this.estado,
    required this.prioridad,
    this.tipo,
    this.tipoIncidenteId,
    this.categoriaId,
    this.numeroRadicado,
    this.severidad,
    this.ubicacion,
    required this.radicadoPor,
    required this.createdAt,
    required this.mensajes,
    required this.adjuntos,
  });

  factory PqrsDetailModel.fromJson(Map<String, dynamic> json) {
    return PqrsDetailModel(
      id: json['id'] as String,
      asunto: json['asunto'] as String,
      descripcion: json['descripcion'] as String,
      estado: json['estado'] as String,
      prioridad: json['prioridad'] as String,
      tipo: json['tipo'] as String?,
      tipoIncidenteId: json['tipo_incidente_id'] as String?,
      categoriaId: json['categoria_id'] as String?,
      numeroRadicado: json['numero_radicado'] as String?,
      severidad: json['severidad'] as String?,
      ubicacion: json['ubicacion'] as String?,
      radicadoPor: json['radicado_por'] as String,
      createdAt: json['created_at'] as String,
      mensajes: (json['mensajes'] as List<dynamic>)
          .map((m) => MensajePqrsModel.fromJson(m as Map<String, dynamic>))
          .toList(),
      adjuntos: (json['adjuntos'] as List<dynamic>? ?? [])
          .map((a) => AdjuntoPqrsModel.fromJson(a as Map<String, dynamic>))
          .toList(),
    );
  }
}
