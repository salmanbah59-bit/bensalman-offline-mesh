import 'constants.dart';

/// Green Content Charter Enforcement Engine.
/// Operates 100% offline on-device to enforce family-safe standards.
class GreenFilter {
  // Common abusive, offensive, explicit, and non-green keywords
  static final Set<String> _blacklist = {
    'profanity', 'curse', 'swear', 'toxic', 'hate', 'vulgar', 'abuse', 
    'nude', 'nsfw', 'porn', 'scam', 'fraud', 'drugs', 'weapon', 'kill'
  };

  /// Validates text before sending or upon receiving
  static GreenCheckResult evaluateText(String text) {
    if (text.trim().isEmpty) {
      return GreenCheckResult(isValid: true);
    }

    final lower = text.toLowerCase();
    for (final pattern in _blacklist) {
      if (lower.contains(pattern)) {
        return GreenCheckResult(
          isValid: false,
          violationReason: "Contains non-green content keyword: '$pattern'. BENSALMAN is strictly family-safe.",
        );
      }
    }

    return GreenCheckResult(isValid: true);
  }

  /// Sanitizes text by masking non-green phrases
  static String sanitize(String text) {
    String clean = text;
    for (final pattern in _blacklist) {
      final reg = RegExp(pattern, caseSensitive: false);
      clean = clean.replaceAll(reg, '🌿[GREEN MASKED]🌿');
    }
    return clean;
  }
}

class GreenCheckResult {
  final bool isValid;
  final String? violationReason;

  GreenCheckResult({required this.isValid, this.violationReason});
}
