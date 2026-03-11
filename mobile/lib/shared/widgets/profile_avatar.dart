import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';
import 'package:habitare/shared/providers/profile_photo_provider.dart';

class ProfileAvatar extends ConsumerWidget {
  const ProfileAvatar({
    super.key,
    required this.initials,
    this.size = 56,
    this.editable = false,
  });

  final String initials;
  final double size;
  final bool editable;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final photoAsync = ref.watch(profilePhotoProvider);
    final photo = photoAsync.valueOrNull;
    final badgeSize = size * 0.36;

    final circle = Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: AppColors.primary,
        shape: BoxShape.circle,
        image: photo != null
            ? DecorationImage(
                image: FileImage(photo),
                fit: BoxFit.cover,
              )
            : null,
      ),
      child: photo == null
          ? Center(
              child: Text(
                initials,
                style: (size >= 80
                        ? AppTextStyles.heading1
                        : AppTextStyles.bodyMedium)
                    .copyWith(color: AppColors.white),
              ),
            )
          : null,
    );

    if (!editable) return circle;

    return GestureDetector(
      onTap: () => _showOptions(context, ref, hasPhoto: photo != null),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          circle,
          // ── Badge cámara ─────────────────────────────────────────────
          Positioned(
            right: 0,
            bottom: 0,
            child: Container(
              width: badgeSize,
              height: badgeSize,
              decoration: BoxDecoration(
                color: AppColors.white,
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.gray200, width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 4,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: Icon(
                Icons.camera_alt_rounded,
                size: badgeSize * 0.55,
                color: AppColors.gray600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showOptions(BuildContext context, WidgetRef ref,
      {required bool hasPhoto}) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: AppColors.gray300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Text('Foto de perfil', style: AppTextStyles.heading3),
              const SizedBox(height: 16),
              _OptionTile(
                icon: Icons.photo_library_outlined,
                label: 'Elegir de la galería',
                onTap: () {
                  Navigator.pop(context);
                  ref
                      .read(profilePhotoProvider.notifier)
                      .pick(ImageSource.gallery);
                },
              ),
              _OptionTile(
                icon: Icons.camera_alt_outlined,
                label: 'Tomar foto',
                onTap: () {
                  Navigator.pop(context);
                  ref
                      .read(profilePhotoProvider.notifier)
                      .pick(ImageSource.camera);
                },
              ),
              if (hasPhoto)
                _OptionTile(
                  icon: Icons.delete_outline_rounded,
                  label: 'Eliminar foto',
                  color: AppColors.dangerText,
                  onTap: () {
                    Navigator.pop(context);
                    ref.read(profilePhotoProvider.notifier).remove();
                  },
                ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }
}

class _OptionTile extends StatelessWidget {
  const _OptionTile({
    required this.icon,
    required this.label,
    required this.onTap,
    this.color,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final c = color ?? AppColors.gray900;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 12),
        child: Row(
          children: [
            Icon(icon, size: 22, color: c),
            const SizedBox(width: 14),
            Text(label, style: AppTextStyles.bodyRegular.copyWith(color: c)),
          ],
        ),
      ),
    );
  }
}
