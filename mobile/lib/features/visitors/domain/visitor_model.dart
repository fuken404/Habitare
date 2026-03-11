enum VisitorStatus { vigente, historial }

class VisitorModel {
  const VisitorModel({
    required this.id,
    required this.name,
    required this.doc,
    required this.date,
    required this.unit,
    this.hasParking = false,
    this.status = VisitorStatus.vigente,
  });

  final String id;
  final String name;
  final String doc;
  final String date;
  final String unit;
  final bool hasParking;
  final VisitorStatus status;
}
