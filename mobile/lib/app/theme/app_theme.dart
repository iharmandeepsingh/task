import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // CT University Brand Colors
  static const Color primaryBlue = Color(0xFF1E3A8A); // Royal Dark Blue
  static const Color primaryLight = Color(0xFF3B82F6);
  static const Color accentIndigo = Color(0xFF6366F1);
  static const Color backgroundLight = Color(0xFFF8FAFC);
  static const Color surfaceWhite = Color(0xFFFFFFFF);
  static const Color textDark = Color(0xFF0F172A);
  static const Color textMuted = Color(0xFF64748B);

  // Deadline Health Colors (Box 4 of Flowchart)
  static const Color greenDeadline = Color(0xFF10B981);  // On track / finished on time
  static const Color yellowDeadline = Color(0xFFF59E0B); // Near deadline (3-7 days)
  static const Color orangeDeadline = Color(0xFFF97316); // Almost at deadline (<3 days)
  static const Color redDeadline = Color(0xFFEF4444);    // Overdue / Past deadline

  // Role Pill Colors
  static const Color roleSuperAdmin = Color(0xFF8B5CF6);
  static const Color roleHead = Color(0xFF2563EB);
  static const Color roleHR = Color(0xFFEC4899);
  static const Color roleFaculty = Color(0xFF059669);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryBlue,
        primary: primaryBlue,
        secondary: accentIndigo,
        surface: surfaceWhite,
        background: backgroundLight,
      ),
      scaffoldBackgroundColor: backgroundLight,
      textTheme: GoogleFonts.interTextTheme(),
      appBarTheme: AppBarTheme(
        backgroundColor: primaryBlue,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.outfit(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: Colors.white,
        ),
      ),
      cardTheme: CardTheme(
        color: surfaceWhite,
        elevation: 1.5,
        shadowColor: Colors.black.withOpacity(0.06),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFFE2E8F0), width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryBlue,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}
