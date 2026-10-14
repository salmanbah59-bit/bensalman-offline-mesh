enum MessageDeliveryStatus {
  pendingRelay, // Stored locally waiting for nearby node
  relayedHop,   // In transit through intermediate friend
  delivered,    // Delivered to destination node
  read,         // Acknowledged by recipient
  failed,       // Expired TTL or safety rejection
}

enum MessageMediaType {
  text,
  voice,
  photo,
}

class BensalmanMessage {
  final String id;
  final String senderPhone;
  final String recipientPhone;
  final MessageMediaType type;
  final String content; // Plaintext (if decrypted) or local file path
  final int timestamp;
  MessageDeliveryStatus status;
  final bool isOutgoing;
  final int? audioDurationSec;
  final String? relayPath; // E.g., "A -> B -> C"

  BensalmanMessage({
    required this.id,
    required this.senderPhone,
    required this.recipientPhone,
    required this.type,
    required this.content,
    required this.timestamp,
    required this.status,
    required this.isOutgoing,
    this.audioDurationSec,
    this.relayPath,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'senderPhone': senderPhone,
      'recipientPhone': recipientPhone,
      'type': type.name,
      'content': content,
      'timestamp': timestamp,
      'status': status.name,
      'isOutgoing': isOutgoing,
      'audioDurationSec': audioDurationSec,
      'relayPath': relayPath,
    };
  }

  factory BensalmanMessage.fromMap(Map<String, dynamic> map) {
    return BensalmanMessage(
      id: map['id'],
      senderPhone: map['senderPhone'],
      recipientPhone: map['recipientPhone'],
      type: MessageMediaType.values.firstWhere((e) => e.name == map['type']),
      content: map['content'],
      timestamp: map['timestamp'],
      status: MessageDeliveryStatus.values.firstWhere((e) => e.name == map['status']),
      isOutgoing: map['isOutgoing'],
      audioDurationSec: map['audioDurationSec'],
      relayPath: map['relayPath'],
    );
  }
}
