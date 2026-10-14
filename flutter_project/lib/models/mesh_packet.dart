import 'dart:convert';

enum PacketType {
  text,
  voice,
  photo,
  friendRequest,
  friendAccept,
  ack,
  heartbeat,
  relayEnvelope,
}

/// Mesh packet transferred over Nearby Connections P2P_CLUSTER.
/// Supports multi-hop routing, Store-and-Forward (A -> B -> C), and loop prevention.
class MeshPacket {
  final String packetId;
  final String senderPhone;
  final String targetPhone;
  final PacketType type;
  final String payloadCipher; // E2E Encrypted payload
  final int timestamp;
  int ttl; // Decrements at each hop (default: 5)
  List<String> hops; // List of intermediate node IDs traversed
  final String? meta; // E.g., duration for audio, dimensions for photo

  MeshPacket({
    required this.packetId,
    required this.senderPhone,
    required this.targetPhone,
    required this.type,
    required this.payloadCipher,
    required this.timestamp,
    this.ttl = 5,
    List<String>? hops,
    this.meta,
  }) : hops = hops ?? [];

  Map<String, dynamic> toMap() {
    return {
      'packetId': packetId,
      'senderPhone': senderPhone,
      'targetPhone': targetPhone,
      'type': type.name,
      'payloadCipher': payloadCipher,
      'timestamp': timestamp,
      'ttl': ttl,
      'hops': hops,
      'meta': meta,
    };
  }

  factory MeshPacket.fromMap(Map<String, dynamic> map) {
    return MeshPacket(
      packetId: map['packetId'] ?? '',
      senderPhone: map['senderPhone'] ?? '',
      targetPhone: map['targetPhone'] ?? '',
      type: PacketType.values.firstWhere(
        (e) => e.name == map['type'],
        orElse: () => PacketType.text,
      ),
      payloadCipher: map['payloadCipher'] ?? '',
      timestamp: map['timestamp'] ?? 0,
      ttl: map['ttl'] ?? 5,
      hops: List<String>.from(map['hops'] ?? []),
      meta: map['meta'],
    );
  }

  String toJson() => jsonEncode(toMap());

  factory MeshPacket.fromJson(String source) =>
      MeshPacket.fromMap(jsonDecode(source));
}
