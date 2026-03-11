import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';

class AppTheme {
  AppTheme._();

  static ThemeData get light => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primary,
          primary: AppColors.primary,
          surface: AppColors.white,
          error: AppColors.dangerText,
        ),
        scaffoldBackgroundColor: AppColors.scaffold,
        textTheme: GoogleFonts.instrumentSansTextTheme(),

        // ── AppBar ────────────────────────────────────────
        appBarTheme: AppBarTheme(
          backgroundColor: AppColors.white,
          foregroundColor: AppColors.black,
          elevation: 0,
          centerTitle: false,
          titleTextStyle: AppTextStyles.heading2,
          surfaceTintColor: Colors.transparent,
          shadowColor: AppColors.gray200,
        ),

        // ── ElevatedButton ────────────────────────────────
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: AppColors.white,
            minimumSize: const Size(double.infinity, 52),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            textStyle: AppTextStyles.bodyLarge,
            elevation: 0,
          ),
        ),

        // ── OutlinedButton ────────────────────────────────
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.gray500,
            minimumSize: const Size(double.infinity, 52),
            side: const BorderSide(color: AppColors.gray300),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            textStyle: AppTextStyles.bodyLarge,
          ),
        ),

        // ── InputDecoration ───────────────────────────────
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: AppColors.white,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16),
          constraints: const BoxConstraints(minHeight: 44),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.gray300),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.gray300),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.primary, width: 2),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.dangerText),
          ),
          disabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.gray200),
          ),
          hintStyle: AppTextStyles.placeholder,
          labelStyle: AppTextStyles.bodyRegular,
          errorStyle: AppTextStyles.small.copyWith(color: AppColors.dangerText),
        ),

        // ── Card ──────────────────────────────────────────
        cardTheme: CardThemeData(
          color: AppColors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: const BorderSide(color: AppColors.gray200),
          ),
          margin: EdgeInsets.zero,
        ),

        // ── BottomNavigationBar ───────────────────────────
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: AppColors.white,
          selectedItemColor: AppColors.navActive,
          unselectedItemColor: AppColors.navInactive,
          showSelectedLabels: true,
          showUnselectedLabels: true,
          type: BottomNavigationBarType.fixed,
          elevation: 0,
        ),

        // ── Divider ───────────────────────────────────────
        dividerTheme: const DividerThemeData(
          color: AppColors.gray200,
          thickness: 1,
          space: 0,
        ),
      );
}
