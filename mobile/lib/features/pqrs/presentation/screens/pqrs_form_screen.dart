import 'dart:convert';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:habitare/core/network/api_client.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/features/auth/presentation/providers/auth_provider.dart';
import 'package:habitare/features/pqrs/presentation/providers/pqrs_provider.dart';

const _tiposMap = {
  'Petición': 'peticion',
  'Queja': 'queja',
  'Reclamo': 'reclamo',
  'Sugerencia': 'sugerencia',
};

class PqrsFormScreen extends ConsumerStatefulWidget {
  const PqrsFormScreen({super.key});

  @override
  ConsumerState<PqrsFormScreen> createState() => _PqrsFormScreenState();
}

class _PqrsFormScreenState extends ConsumerState<PqrsFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _descripcionCtrl = TextEditingController();
  final _asuntoCtrl = TextEditingController();
  String _tipoPQRS = 'Petición';
  bool _isLoading = false;
  String? _errorMsg;
  final List<XFile> _adjuntos = [];
  final _picker = ImagePicker();

  @override
  void dispose() {
    _descripcionCtrl.dispose();
    _asuntoCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    final file = await _picker.pickImage(
      source: source,
      imageQuality: 70,
      maxWidth: 1280,
    );
    if (file != null) {
      setState(() => _adjuntos.add(file));
    }
  }

  void _showPickerOptions() {
    showModalBottomSheet(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt_outlined, color: AppColors.primary),
              title: Text('Tomar foto', style: AppTextStyles.bodyRegular),
              onTap: () {
                Navigator.pop(ctx);
                _pickImage(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined, color: AppColors.primary),
              title: Text('Elegir de galería', style: AppTextStyles.bodyRegular),
              onTap: () {
                Navigator.pop(ctx);
                _pickImage(ImageSource.gallery);
              },
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final unidadId = ref.read(authProvider).user?.unidadId;
    if (unidadId == null) {
      setState(() => _errorMsg = 'No se encontró la unidad del usuario');
      return;
    }

    setState(() { _isLoading = true; _errorMsg = null; });

    try {
      // Convertir adjuntos a base64
      final adjuntosData = <Map<String, dynamic>>[];
      for (final file in _adjuntos) {
        final bytes = await file.readAsBytes();
        final b64 = base64Encode(bytes);
        final nombre = file.name;
        final mime = nombre.endsWith('.png') ? 'image/png' : 'image/jpeg';
        adjuntosData.add({'nombre': nombre, 'mime_type': mime, 'contenido_b64': b64});
      }

      final res = await ApiClient.instance.post('/pqrs', data: {
        'tipo': _tiposMap[_tipoPQRS],
        'asunto': _asuntoCtrl.text.trim(),
        'descripcion': _descripcionCtrl.text.trim(),
        'unidad_id': unidadId,
        'adjuntos': adjuntosData,
      });

      final radicado = (res.data as Map<String, dynamic>)['numero_radicado'] as String?;
      ref.invalidate(pqrsProvider);
      if (!mounted) return;
      context.pushReplacement('/pqrs/success', extra: radicado);
    } on DioException catch (e) {
      final data = e.response?.data;
      setState(() {
        _errorMsg = data is Map
            ? (data['detail'] ?? 'Error al radicar la PQRS')
            : 'Error al radicar la PQRS';
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffold,
      appBar: AppBar(
        title: Text('Radicar PQRS', style: AppTextStyles.heading2),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Tipo de PQRS', style: AppTextStyles.smallSemibold),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _tiposMap.keys.map((t) {
                  final isSelected = _tipoPQRS == t;
                  return GestureDetector(
                    onTap: () => setState(() => _tipoPQRS = t),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primary : AppColors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isSelected
                              ? AppColors.primary
                              : AppColors.gray200,
                        ),
                      ),
                      child: Text(
                        t,
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: isSelected
                              ? AppColors.white
                              : AppColors.gray900,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),

              Text('Asunto', style: AppTextStyles.smallSemibold),
              const SizedBox(height: 8),
              TextFormField(
                controller: _asuntoCtrl,
                textCapitalization: TextCapitalization.sentences,
                style: AppTextStyles.bodyRegular,
                decoration: const InputDecoration(
                  hintText: 'Describe brevemente el asunto',
                ),
                validator: (v) => (v == null || v.trim().isEmpty)
                    ? 'Ingresa el asunto'
                    : null,
              ),
              const SizedBox(height: 20),

              Text('Descripción detallada', style: AppTextStyles.smallSemibold),
              const SizedBox(height: 8),
              TextFormField(
                controller: _descripcionCtrl,
                maxLines: 5,
                textCapitalization: TextCapitalization.sentences,
                style: AppTextStyles.bodyRegular,
                decoration: const InputDecoration(
                  hintText:
                      'Describe con detalle tu petición, queja, reclamo o sugerencia...',
                  contentPadding: EdgeInsets.all(14),
                  alignLabelWithHint: true,
                ),
                validator: (v) {
                  if (v == null || v.trim().isEmpty) {
                    return 'Ingresa la descripción';
                  }
                  if (v.trim().length < 20) {
                    return 'La descripción debe tener al menos 20 caracteres';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 20),

              // ── Adjuntos ──────────────────────────────────────────────────
              Text('Adjuntos', style: AppTextStyles.smallSemibold),
              const SizedBox(height: 8),
              if (_adjuntos.isNotEmpty) ...[
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _adjuntos.asMap().entries.map((entry) {
                    final i = entry.key;
                    final file = entry.value;
                    return Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.file(
                            File(file.path),
                            width: 72,
                            height: 72,
                            fit: BoxFit.cover,
                          ),
                        ),
                        Positioned(
                          top: 2,
                          right: 2,
                          child: GestureDetector(
                            onTap: () => setState(() => _adjuntos.removeAt(i)),
                            child: Container(
                              width: 20,
                              height: 20,
                              decoration: const BoxDecoration(
                                color: AppColors.dangerText,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.close,
                                  size: 12, color: AppColors.white),
                            ),
                          ),
                        ),
                      ],
                    );
                  }).toList(),
                ),
                const SizedBox(height: 8),
              ],
              GestureDetector(
                onTap: _showPickerOptions,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  decoration: BoxDecoration(
                    color: AppColors.white,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                        color: AppColors.gray200, style: BorderStyle.solid),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.attach_file_rounded,
                          size: 18, color: AppColors.gray500),
                      const SizedBox(width: 6),
                      Text(
                        _adjuntos.isEmpty
                            ? 'Agregar imagen adjunta'
                            : 'Agregar otra imagen',
                        style: AppTextStyles.small
                            .copyWith(color: AppColors.gray500),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.infoBg,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.info_outline_rounded,
                        size: 16, color: AppColors.infoText),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Tu PQRS será radicada con número de seguimiento. Recibirás respuesta en un plazo máximo de 15 días hábiles.',
                        style: AppTextStyles.small
                            .copyWith(color: AppColors.infoText),
                      ),
                    ),
                  ],
                ),
              ),

              if (_errorMsg != null) ...[
                const SizedBox(height: 12),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.dangerBg,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(_errorMsg!,
                      style: AppTextStyles.small
                          .copyWith(color: AppColors.dangerText)),
                ),
              ],
              const SizedBox(height: 32),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _submit,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: AppColors.white),
                        )
                      : const Text('Radicar PQRS'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
