import 'dart:io';
import 'package:flutter/painting.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

class ProfilePhotoNotifier extends AsyncNotifier<File?> {
  static const _fileName = 'profile_photo.jpg';

  @override
  Future<File?> build() async {
    final dir = await getApplicationDocumentsDirectory();
    final file = File(p.join(dir.path, _fileName));
    return file.existsSync() ? file : null;
  }

  Future<void> pick(ImageSource source) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(
      source: source,
      imageQuality: 85,
      maxWidth: 512,
      maxHeight: 512,
    );
    if (picked == null) return;

    final dir = await getApplicationDocumentsDirectory();
    final dest = File(p.join(dir.path, _fileName));
    await File(picked.path).copy(dest.path);
    // Limpiar el cache de imagen para que Flutter cargue el archivo nuevo
    await FileImage(dest).evict();
    state = AsyncData(dest);
  }

  Future<void> remove() async {
    final dir = await getApplicationDocumentsDirectory();
    final file = File(p.join(dir.path, _fileName));
    if (file.existsSync()) await file.delete();
    state = const AsyncData(null);
  }
}

final profilePhotoProvider =
    AsyncNotifierProvider<ProfilePhotoNotifier, File?>(
  ProfilePhotoNotifier.new,
);
