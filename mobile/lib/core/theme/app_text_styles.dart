import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:habitare/core/theme/app_colors.dart';

class AppTextStyles {
  AppTextStyles._();

  static TextStyle _base({
    required double size,
    required FontWeight weight,
    required double height,
    double letterSpacing = 0,
    Color color = AppColors.black,
  }) =>
      GoogleFonts.instrumentSans(
        fontSize: size,
        fontWeight: weight,
        height: height / size,
        letterSpacing: letterSpacing,
        color: color,
      );

  // ── Escala tipográfica ─────────────────────────────────
  static TextStyle get display => _base(
        size: 32, weight: FontWeight.w700,
        height: 40, letterSpacing: -0.16,
      );

  static TextStyle get heading1 => _base(
        size: 24, weight: FontWeight.w700,
        height: 32, letterSpacing: -0.12,
      );

  static TextStyle get heading2 => _base(
        size: 20, weight: FontWeight.w600,
        height: 28, letterSpacing: -0.08,
      );

  static TextStyle get heading3 => _base(
        size: 18, weight: FontWeight.w600,
        height: 24, letterSpacing: -0.054,
      );

  static TextStyle get bodyLarge => _base(
        size: 16, weight: FontWeight.w600,
        height: 20, letterSpacing: -0.048,
      );

  static TextStyle get bodySemibold => _base(
        size: 15, weight: FontWeight.w600,
        height: 20, letterSpacing: -0.045,
      );

  static TextStyle get body => _base(
        size: 15, weight: FontWeight.w400,
        height: 20, letterSpacing: -0.045,
      );

  static TextStyle get bodyRegular => _base(
        size: 14, weight: FontWeight.w400,
        height: 18, letterSpacing: -0.042,
      );

  static TextStyle get bodyMedium => _base(
        size: 14, weight: FontWeight.w500,
        height: 18, letterSpacing: -0.042,
      );

  static TextStyle get small => _base(
        size: 13, weight: FontWeight.w400,
        height: 16, letterSpacing: -0.026,
      );

  static TextStyle get smallSemibold => _base(
        size: 13, weight: FontWeight.w600,
        height: 16, letterSpacing: -0.026,
      );

  static TextStyle get badge => _base(
        size: 12, weight: FontWeight.w500,
        height: 16, letterSpacing: -0.024,
      );

  // ── Helpers de color ───────────────────────────────────
  static TextStyle get bodySecondary =>
      body.copyWith(color: AppColors.gray500);

  static TextStyle get smallSecondary =>
      small.copyWith(color: AppColors.gray500);

  static TextStyle get placeholder =>
      bodyRegular.copyWith(color: AppColors.gray400);
}
