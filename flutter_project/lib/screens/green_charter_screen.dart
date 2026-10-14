import 'package:flutter/material.dart';
import '../core/constants.dart';
import '../services/auth_service.dart';

class GreenCharterScreen extends StatefulWidget {
  final AuthService authService;
  final VoidCallback onAccepted;

  const GreenCharterScreen({
    super.key,
    required this.authService,
    required this.onAccepted,
  });

  @override
  State<GreenCharterScreen> createState() => _GreenCharterScreenState();
}

class _GreenCharterScreenState extends State<GreenCharterScreen> {
  bool _agreedToPrinciples = false;
  bool _agreedToMutualConsent = false;
  bool _agreedToSafeContent = false;

  bool get _canProceed =>
      _agreedToPrinciples && _agreedToMutualConsent && _agreedToSafeContent;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: BensalmanTheme.background,
      appBar: AppBar(
        title: const Text("GREEN CHARTER 🌿"),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: BensalmanTheme.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: BensalmanTheme.gold.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.verified_user, color: BensalmanTheme.gold, size: 36),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text(
                            "FAMILY-SAFE CODE OF CONDUCT",
                            style: TextStyle(
                              color: BensalmanTheme.gold,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          SizedBox(height: 4),
                          Text(
                            "BENSALMAN is built for wholesome, private offline communication.",
                            style: TextStyle(color: Colors.white70, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              
              // Oath Banner
              const Text(
                "The Sacred Oath",
                style: TextStyle(
                  color: BensalmanTheme.goldLight,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: BensalmanTheme.surfaceLight,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  GreenCharterRules.oath,
                  style: TextStyle(
                    color: Colors.white,
                    fontStyle: FontStyle.italic,
                    height: 1.4,
                    fontSize: 13,
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Checkbox agreements
              Expanded(
                child: ListView(
                  children: [
                    CheckboxListTile(
                      value: _agreedToPrinciples,
                      activeColor: BensalmanTheme.gold,
                      checkColor: BensalmanTheme.background,
                      title: const Text(
                        "I pledge 100% Family Safe content",
                        style: TextStyle(color: Colors.white, fontSize: 14),
                      ),
                      subtitle: const Text(
                        "No profanity, vulgarity, hate speech, or abuse.",
                        style: TextStyle(color: Colors.white54, fontSize: 12),
                      ),
                      onChanged: (val) => setState(() => _agreedToPrinciples = val ?? false),
                    ),
                    CheckboxListTile(
                      value: _agreedToMutualConsent,
                      activeColor: BensalmanTheme.gold,
                      checkColor: BensalmanTheme.background,
                      title: const Text(
                        "Mutual Consent Requirement",
                        style: TextStyle(color: Colors.white, fontSize: 14),
                      ),
                      subtitle: const Text(
                        "Both users must agree before any offline message can be exchanged.",
                        style: TextStyle(color: Colors.white54, fontSize: 12),
                      ),
                      onChanged: (val) => setState(() => _agreedToMutualConsent = val ?? false),
                    ),
                    CheckboxListTile(
                      value: _agreedToSafeContent,
                      activeColor: BensalmanTheme.gold,
                      checkColor: BensalmanTheme.background,
                      title: const Text(
                        "Mesh Relay Confidentiality",
                        style: TextStyle(color: Colors.white, fontSize: 14),
                      ),
                      subtitle: const Text(
                        "Relayed packets are E2E encrypted. Intermediate nodes cannot tamper.",
                        style: TextStyle(color: Colors.white54, fontSize: 12),
                      ),
                      onChanged: (val) => setState(() => _agreedToSafeContent = val ?? false),
                    ),
                  ],
                ),
              ),

              // Button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _canProceed
                      ? () async {
                          await widget.authService.acceptCharter();
                          widget.onAccepted();
                        }
                      : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: BensalmanTheme.gold,
                    disabledBackgroundColor: Colors.grey.shade800,
                    foregroundColor: BensalmanTheme.background,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: const Text(
                    "ACCEPT CHARTER & ENTER MESH 👑",
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                      letterSpacing: 1.1,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
