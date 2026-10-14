import 'package:flutter/material.dart';

class BensalmanTheme {
  // Brand Palette: Premium Black and Gold
  static const Color background = Color(0xFF0D0D0D);
  static const Color surface = Color(0xFF141414);
  static const Color surfaceLight = Color(0xFF1F1F1F);
  static const Color cardBorder = Color(0xFF2A2412);
  
  static const Color gold = Color(0xFFD4AF37);
  static const Color goldLight = Color(0xFFF3E5AB);
  static const Color goldDark = Color(0xFFAA820A);
  
  // Status Colors required by specifications
  static const Color statusGreen = Color(0xFF00E676);   // Online / Connected Direct WiFi
  static const Color statusYellow = Color(0xFFFFD600);  // Nearby Bluetooth Low Energy
  static const Color statusRed = Color(0xFFFF1744);     // Out of Range / Multi-Hop Relay Pending

  // Green / Family Safe Charter Accent
  static const Color greenCharter = Color(0xFF10B981);

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: background,
      primaryColor: gold,
      colorScheme: const ColorScheme.dark(
        primary: gold,
        secondary: goldLight,
        surface: surface,
        error: statusRed,
      ),
      fontFamily: 'Roboto',
      appBarTheme: const AppBarTheme(
        backgroundColor: background,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: gold),
        titleTextStyle: TextStyle(
          color: gold,
          fontSize: 20,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.2,
        ),
      ),
    );
  }
}

class GreenCharterRules {
  static const String title = "BENSALMAN Green Content Charter 🌿👑";
  static const String oath = 
      "I hereby pledge to uphold the sanctity of family-safe communication. "
      "No hate speech, no profanity, no vulgarity, no harassment, and no unapproved distribution. "
      "Offline freedom is protected by mutual respect.";

  static const List<String> principles = [
    "1. 100% Family Safe: Pure communication suitable for all ages.",
    "2. Mutual Consent: Nobody can message you without reciprocal approval.",
    "3. Zero Hate & Harassment: Automated offline heuristics reject toxic words.",
    "4. Community Relay Honor: Stored packets are strictly encrypted end-to-end; intermediate relays cannot inspect payloads.",
  ];

  static const List<String> prohibitedPatterns = [
    "curse", "swear", "toxic", "hate", "vulgar", "abuse", "scam"
  ];
}
