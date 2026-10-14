import 'package:flutter/material.dart';
import '../core/constants.dart';
import '../services/auth_service.dart';
import '../widgets/crown_logo.dart';

class AuthScreen extends StatefulWidget {
  final AuthService authService;
  final VoidCallback onRegistered;

  const AuthScreen({
    super.key,
    required this.authService,
    required this.onRegistered,
  });

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _phoneController = TextEditingController(text: "+966 50 123 4567");
  final _nameController = TextEditingController(text: "Salman");
  final _otpController = TextEditingController();

  bool _isCodeSent = false;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: BensalmanTheme.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 28.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const CrownLogo(size: 88),
                const SizedBox(height: 20),
                const Text(
                  "BENSALMAN 👑",
                  style: TextStyle(
                    color: BensalmanTheme.gold,
                    fontSize: 26,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 2.0,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  "ZERO-INTERNET • ZERO-SIM OFFLINE MESH",
                  style: TextStyle(
                    color: Colors.white60,
                    fontSize: 11,
                    letterSpacing: 1.5,
                  ),
                ),
                const SizedBox(height: 32),

                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: BensalmanTheme.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: BensalmanTheme.cardBorder),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _isCodeSent ? "VERIFY OTP CODE" : "ONE-TIME REGISTRATION",
                        style: const TextStyle(
                          color: BensalmanTheme.gold,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        _isCodeSent
                            ? "Enter the 6-digit code sent to ${_phoneController.text}. After this step, NO internet is ever required."
                            : "Internet is required ONLY ONCE for device token attestation. Afterwards, the app operates 100% offline.",
                        style: const TextStyle(color: Colors.white70, fontSize: 12),
                      ),
                      const SizedBox(height: 20),

                      if (!_isCodeSent) ...[
                        TextField(
                          controller: _nameController,
                          style: const TextStyle(color: Colors.white),
                          decoration: InputDecoration(
                            labelText: "Your Display Name",
                            labelStyle: const TextStyle(color: BensalmanTheme.gold),
                            prefixIcon: const Icon(Icons.person, color: BensalmanTheme.gold),
                            filled: true,
                            fillColor: BensalmanTheme.surfaceLight,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                        const SizedBox(height: 14),
                        TextField(
                          controller: _phoneController,
                          keyboardType: TextInputType.phone,
                          style: const TextStyle(color: Colors.white),
                          decoration: InputDecoration(
                            labelText: "Phone Number",
                            labelStyle: const TextStyle(color: BensalmanTheme.gold),
                            prefixIcon: const Icon(Icons.phone, color: BensalmanTheme.gold),
                            filled: true,
                            fillColor: BensalmanTheme.surfaceLight,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ] else ...[
                        TextField(
                          controller: _otpController,
                          keyboardType: TextInputType.number,
                          maxLength: 6,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: BensalmanTheme.gold,
                            fontSize: 24,
                            letterSpacing: 8,
                            fontWeight: FontWeight.bold,
                          ),
                          decoration: InputDecoration(
                            hintText: "••••••",
                            hintStyle: TextStyle(color: Colors.white24, letterSpacing: 8),
                            filled: true,
                            fillColor: BensalmanTheme.surfaceLight,
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        ),
                      ],

                      if (_errorMessage != null) ...[
                        const SizedBox(height: 12),
                        Text(
                          _errorMessage!,
                          style: const TextStyle(color: BensalmanTheme.statusRed, fontSize: 12),
                        ),
                      ],

                      const SizedBox(height: 22),
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _handleSubmit,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: BensalmanTheme.gold,
                            foregroundColor: BensalmanTheme.background,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: _isLoading
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : Text(
                                  _isCodeSent ? "VERIFY & PROCEED" : "SEND OTP CODE",
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _handleSubmit() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      if (!_isCodeSent) {
        if (_phoneController.text.trim().isEmpty || _nameController.text.trim().isEmpty) {
          throw Exception("Please fill in both name and phone number");
        }
        await widget.authService.sendOtp(
          phone: _phoneController.text.trim(),
          name: _nameController.text.trim(),
        );
        setState(() => _isCodeSent = true);
      } else {
        final success = await widget.authService.verifyOtp(code: _otpController.text.trim());
        if (success) {
          widget.onRegistered();
        } else {
          throw Exception("Invalid OTP. Try 123456");
        }
      }
    } catch (e) {
      setState(() => _errorMessage = e.toString().replaceAll("Exception: ", ""));
    } finally {
      setState(() => _isLoading = false);
    }
  }
}
