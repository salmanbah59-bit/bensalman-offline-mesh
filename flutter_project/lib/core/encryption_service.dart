import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:encrypt/encrypt.dart' as enc;

/// Production AES-256 GCM/CBC encryption engine for BENSALMAN 👑.
/// Ensures that even in Store-and-Forward relay (A -> B -> C),
/// intermediate node B CANNOT read the message intended for C.
class EncryptionService {
  // Derive a 256-bit symmetric key from two phone numbers & mutual friendship salt
  static enc.Key derivePairwiseKey(String phoneA, String phoneB, String pairingSecret) {
    // Deterministic ordering so phoneA+phoneB derives same key as phoneB+phoneA
    final sortedPhones = [phoneA, phoneB]..sort();
    final combined = "${sortedPhones[0]}_${sortedPhones[1]}_$pairingSecret";
    final hash = sha256.convert(utf8.encode(combined)).bytes;
    return enc.Key(Uint8List.fromList(hash));
  }

  /// Encrypts plaintext string or payload into Base64 cipher with random IV
  static String encryptPayload({
    required String plainText,
    required enc.Key key,
  }) {
    final iv = enc.IV.fromSecureRandom(16);
    final encrypter = enc.Encrypter(enc.AES(key, mode: enc.AESMode.cbc));
    final encrypted = encrypter.encrypt(plainText, iv: iv);
    
    // Format: [iv_base64]:[cipher_base64]
    return "${iv.base64}:${encrypted.base64}";
  }

  /// Decrypts ciphertext using pairwise key
  static String? decryptPayload({
    required String cipherPackage,
    required enc.Key key,
  }) {
    try {
      final parts = cipherPackage.split(':');
      if (parts.length != 2) return null;

      final iv = enc.IV.fromBase64(parts[0]);
      final encrypter = enc.Encrypter(enc.AES(key, mode: enc.AESMode.cbc));
      final decrypted = encrypter.decrypt64(parts[1], iv: iv);
      return decrypted;
    } catch (e) {
      return null;
    }
  }

  /// Compute hash for packet deduplication
  static String packetFingerprint(String packetId, String payload) {
    return md5.convert(utf8.encode("$packetId:$payload")).toString();
  }
}
