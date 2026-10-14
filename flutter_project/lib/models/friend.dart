enum FriendProximityStatus {
  onlineDirect, // Green (Connected directly via WiFi Direct P2P)
  nearbyBle,    // Yellow (Within Bluetooth Low Energy range, ~10-30m)
  outOfRange,   // Red (Out of direct physical range, relies on Store-and-Forward relay)
}

enum FriendshipConsentState {
  pendingIncoming, // Friend sent invite, waiting for your approval
  pendingOutgoing, // You sent invite, waiting for friend's approval
  accepted,        // Mutual consent confirmed, encryption keys active
  declined,
}

class BensalmanFriend {
  final String phoneNumber;
  final String displayName;
  final String? avatarUrl;
  final String pairingSecret; // Shared secret for AES-256 derivation
  FriendshipConsentState consentState;
  FriendProximityStatus proximityStatus;
  int? rssi; // Signal strength in dBm (-30 to -95)
  String? currentEndpointId; // Active Nearby Connections endpoint
  int lastSeenTimestamp;
  int unreadCount;

  BensalmanFriend({
    required this.phoneNumber,
    required this.displayName,
    this.avatarUrl,
    required this.pairingSecret,
    required this.consentState,
    this.proximityStatus = FriendProximityStatus.outOfRange,
    this.rssi,
    this.currentEndpointId,
    required this.lastSeenTimestamp,
    this.unreadCount = 0,
  });

  Map<String, dynamic> toMap() {
    return {
      'phoneNumber': phoneNumber,
      'displayName': displayName,
      'avatarUrl': avatarUrl,
      'pairingSecret': pairingSecret,
      'consentState': consentState.name,
      'proximityStatus': proximityStatus.name,
      'rssi': rssi,
      'currentEndpointId': currentEndpointId,
      'lastSeenTimestamp': lastSeenTimestamp,
      'unreadCount': unreadCount,
    };
  }

  factory BensalmanFriend.fromMap(Map<String, dynamic> map) {
    return BensalmanFriend(
      phoneNumber: map['phoneNumber'],
      displayName: map['displayName'],
      avatarUrl: map['avatarUrl'],
      pairingSecret: map['pairingSecret'],
      consentState: FriendshipConsentState.values.firstWhere(
        (e) => e.name == map['consentState'],
      ),
      proximityStatus: FriendProximityStatus.values.firstWhere(
        (e) => e.name == map['proximityStatus'],
        orElse: () => FriendProximityStatus.outOfRange,
      ),
      rssi: map['rssi'],
      currentEndpointId: map['currentEndpointId'],
      lastSeenTimestamp: map['lastSeenTimestamp'] ?? 0,
      unreadCount: map['unreadCount'] ?? 0,
    );
  }
}
