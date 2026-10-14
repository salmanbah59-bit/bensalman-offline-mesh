import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:hive/hive.dart';

class AuthService extends ChangeNotifier {
  static const String boxName = 'bensalman_auth_box';
  
  String? _phoneNumber;
  String? _displayName;
  bool _isCharterAccepted = false;
  bool _isRegistered = false;
  String? _verificationId;

  String? get phoneNumber => _phoneNumber;
  String? get displayName => _displayName;
  bool get isCharterAccepted => _isCharterAccepted;
  bool get isRegistered => _isRegistered;

  Future<void> init() async {
    final box = await Hive.openBox(boxName);
    _phoneNumber = box.get('phoneNumber');
    _displayName = box.get('displayName') ?? 'Crown User';
    _isCharterAccepted = box.get('isCharterAccepted', defaultValue: false);
    _isRegistered = box.get('isRegistered', defaultValue: false);
    notifyListeners();
  }

  /// Request OTP for the one-time registration
  Future<bool> sendOtp({required String phone, required String name}) async {
    _phoneNumber = phone;
    _displayName = name;
    // In production, Firebase Phone Auth triggers verifyPhoneNumber.
    // Simulating instant delivery for smooth offline onboarding.
    _verificationId = 'simulated-otp-token-${phone.hashCode}';
    notifyListeners();
    return true;
  }

  /// Verify OTP code
  Future<bool> verifyOtp({required String code}) async {
    if (code.length >= 4) {
      _isRegistered = true;
      final box = await Hive.openBox(boxName);
      await box.put('phoneNumber', _phoneNumber);
      await box.put('displayName', _displayName);
      await box.put('isRegistered', true);
      notifyListeners();
      return true;
    }
    return false;
  }

  /// Accept the Green Content Charter (MANDATORY step)
  Future<void> acceptCharter() async {
    _isCharterAccepted = true;
    final box = await Hive.openBox(boxName);
    await box.put('isCharterAccepted', true);
    notifyListeners();
  }

  Future<void> reset() async {
    final box = await Hive.openBox(boxName);
    await box.clear();
    _phoneNumber = null;
    _displayName = null;
    _isCharterAccepted = false;
    _isRegistered = false;
    notifyListeners();
  }
}
