import 'package:flutter/material.dart';

class AppColors{
  AppColors._();

  // -- Primarios -----------
  static const Color primary = Color(0xFF2563EB);
  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF000000);

  // -- Semánticos ----------
  static const Color successBg = Color(0xFFFEF3C7);
  static const Color successText  = Color(0xFF16A34A);
  static const Color successBtn   = Color(0xFF10B981);

  static const Color warningBg    = Color(0xFFFEF3C7);
  static const Color warningText  = Color(0xFFD97706);

  static const Color attentionBg  = Color(0xFFFED7AA);
  static const Color attentionText= Color(0xFFEA580C);
  static const Color attentionBtn = Color(0xFFF97316);

  static const Color dangerBg     = Color(0xFFFEE2E2);
  static const Color dangerText   = Color(0xFFDC2626);

  static const Color infoBg       = Color(0xFFE0F2FE);
  static const Color infoText     = Color(0xFF0284C7);

  static const Color info2Bg      = Color(0xFFDBEAFE);
  static const Color info2Text    = Color(0xFF2563EB);

  static const Color purpleBg     = Color(0xFFE9D5FF);
  static const Color purpleText   = Color(0xFF9333EA);

  // ── Escala de grises ───────────────────────────────────
  static const Color gray50       = Color(0xFFF9FAFB);
  static const Color gray100      = Color(0xFFF3F4F6);
  static const Color gray200      = Color(0xFFE5E7EB);
  static const Color gray300      = Color(0xFFD1D5DB);
  static const Color gray400      = Color(0xFF9CA3AF);
  static const Color gray500      = Color(0xFF6B7280);
  static const Color gray600      = Color(0xFF4B5563);
  static const Color gray900      = Color(0xFF111827);

  // ── Overlays y sombras ─────────────────────────────────
  static const Color modalOverlay = Color(0x80000000); // #000 50%
  static const Color shadowCard   = Color(0x10000000); // #000 6%
  static const Color shadowModal  = Color(0x33000000); // #000 20%

  // ── Bottom Navigation ──────────────────────────────────
  static const Color navActive    = Color(0xFF2563EB);
  static const Color navInactive  = Color(0xFF9CA3AF);

  // ── Fondo de página ────────────────────────────────────
  static const Color scaffold     = Color(0xFFF9FAFB); // gray50
}