import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/foundation.dart';
import 'package:hive/hive.dart';
import 'package:nearby_connections/nearby_connections.dart';
import 'package:uuid/uuid.dart';

import '../core/encryption_service.dart';
import '../core/green_filter.dart';
import '../models/friend.dart';
import '../models/mesh_packet.dart';
import '../models/message.dart';

/// BENSALMAN 👑 Offline Core Mesh Engine
/// Uses nearby_connections P2P_CLUSTER for WiFi-Direct + BLE high-bandwidth mesh,
/// paired with Store-and-Forward multi-hop routing (A -> B -> C).
class MeshService extends ChangeNotifier {
  static const String serviceId = "com.bensalman.offline.mesh";
  static const Strategy strategy = Strategy.P2P_CLUSTER;

  final Nearby _nearby = Nearby();
  final Uuid _uuid = const Uuid();

  bool _isAdvertising = false;
  bool _isDiscovering = false;
  String _myPhoneNumber = "";
  String _myDisplayName = "";

  // Active connected endpoints: endpointId -> node metadata
  final Map<String, ConnectedNode> _connectedEndpoints = {};

  // Known friends: phoneNumber -> BensalmanFriend
  final Map<String, BensalmanFriend> _friends = {};

  // Chat messages: friendPhone -> List<BensalmanMessage>
  final Map<String, List<BensalmanMessage>> _chatHistory = {};

  // Store-and-Forward Relay Queue: packets waiting for next hops (persisted in Hive)
  final List<MeshPacket> _relayQueue = [];

  // Packet deduplication cache to prevent loops in mesh
  final Set<String> _seenPacketFingerprints = {};

  // Streams for UI updates
  final StreamController<MeshPacket> _packetStream = StreamController<MeshPacket>.broadcast();
  Stream<MeshPacket> get onPacketReceived => _packetStream.stream;

  Map<String, BensalmanFriend> get friends => _friends;
  Map<String, ConnectedNode> get connectedEndpoints => _connectedEndpoints;
  List<MeshPacket> get relayQueue => List.unmodifiable(_relayQueue);
  bool get isMeshActive => _isAdvertising || _isDiscovering;

  Future<void> initialize({
    required String myPhone,
    required String myName,
  }) async {
    _myPhoneNumber = myPhone;
    _myDisplayName = myName;

    await _loadPersistedState();
    await startMeshNode();
  }

  Future<void> _loadPersistedState() async {
    final relayBox = await Hive.openBox('bensalman_relay_box');
    final rawRelay = relayBox.get('queue', defaultValue: <dynamic>[]);
    for (final item in rawRelay) {
      try {
        _relayQueue.add(MeshPacket.fromJson(item));
      } catch (_) {}
    }

    final friendsBox = await Hive.openBox('bensalman_friends_box');
    final rawFriends = friendsBox.get('friends_list', defaultValue: <dynamic>[]);
    for (final item in rawFriends) {
      try {
        final friend = BensalmanFriend.fromMap(Map<String, dynamic>.from(item));
        _friends[friend.phoneNumber] = friend;
      } catch (_) {}
    }
  }

  Future<void> _persistRelayQueue() async {
    final relayBox = await Hive.openBox('bensalman_relay_box');
    await relayBox.put(
      'queue',
      _relayQueue.map((p) => p.toJson()).toList(),
    );
  }

  Future<void> _persistFriends() async {
    final friendsBox = await Hive.openBox('bensalman_friends_box');
    await friendsBox.put(
      'friends_list',
      _friends.values.map((f) => f.toMap()).toList(),
    );
  }

  /// Start P2P_CLUSTER Advertising and Discovery simultaneously
  Future<void> startMeshNode() async {
    try {
      // 1. Start Advertising this node to the BENSALMAN mesh
      final advertisingPayload = jsonEncode({
        'phone': _myPhoneNumber,
        'name': _myDisplayName,
        'timestamp': DateTime.now().millisecondsSinceEpoch,
      });

      await _nearby.startAdvertising(
        advertisingPayload,
        strategy,
        onConnectionInitiated: (endpointId, connectionInfo) {
          _handleConnectionInitiated(endpointId, connectionInfo);
        },
        onConnectionResult: (endpointId, status) {
          _handleConnectionResult(endpointId, status);
        },
        onDisconnected: (endpointId) {
          _handleDisconnected(endpointId);
        },
        serviceId: serviceId,
      );
      _isAdvertising = true;

      // 2. Start Discovery for adjacent mesh nodes
      await _nearby.startDiscovery(
        _myPhoneNumber,
        strategy,
        onEndpointFound: (endpointId, endpointName, serviceId) {
          _handleEndpointFound(endpointId, endpointName);
        },
        onEndpointLost: (endpointId) {
          _handleEndpointLost(endpointId);
        },
        serviceId: serviceId,
      );
      _isDiscovering = true;
      notifyListeners();
    } catch (e) {
      debugPrint("[BENSALMAN Mesh] Error starting mesh node: $e");
    }
  }

  void _handleEndpointFound(String endpointId, String endpointName) {
    debugPrint("[BENSALMAN Mesh] Discovered node $endpointId: $endpointName");
    try {
      // Auto-request connection to stitch the P2P cluster
      _nearby.requestConnection(
        _myDisplayName,
        endpointId,
        onConnectionInitiated: (endpointId, info) {
          _handleConnectionInitiated(endpointId, info);
        },
        onConnectionResult: (endpointId, status) {
          _handleConnectionResult(endpointId, status);
        },
        onDisconnected: (endpointId) {
          _handleDisconnected(endpointId);
        },
      );
    } catch (e) {
      debugPrint("[BENSALMAN Mesh] Request connection error: $e");
    }
  }

  void _handleEndpointLost(String endpointId) {
    debugPrint("[BENSALMAN Mesh] Endpoint lost: $endpointId");
    _connectedEndpoints.remove(endpointId);
    _updateFriendsProximity();
    notifyListeners();
  }

  void _handleConnectionInitiated(String endpointId, ConnectionInfo connectionInfo) {
    // Both endpoints accept immediately for seamless cluster mesh formation
    _nearby.acceptConnection(
      endpointId,
      onPayLoadRecieved: (endpointId, payload) {
        _handleIncomingPayload(endpointId, payload);
      },
    );
  }

  void _handleConnectionResult(String endpointId, Status status) {
    if (status == Status.CONNECTED) {
      _connectedEndpoints[endpointId] = ConnectedNode(
        endpointId: endpointId,
        connectedAt: DateTime.now(),
      );
      _updateFriendsProximity();
      // Drain Store-and-Forward relay buffer for newly connected neighbor!
      _drainRelayBuffer();
      notifyListeners();
    } else {
      _connectedEndpoints.remove(endpointId);
    }
  }

  void _handleDisconnected(String endpointId) {
    _connectedEndpoints.remove(endpointId);
    _updateFriendsProximity();
    notifyListeners();
  }

  /// Process incoming byte payloads over Nearby Connections
  void _handleIncomingPayload(String fromEndpointId, Payload payload) {
    if (payload.type != PayloadType.BYTES || payload.bytes == null) return;

    try {
      final jsonStr = utf8.decode(payload.bytes!);
      final packet = MeshPacket.fromJson(jsonStr);

      // Deduplication check
      final fingerprint = EncryptionService.packetFingerprint(
        packet.packetId,
        packet.payloadCipher,
      );
      if (_seenPacketFingerprints.contains(fingerprint)) {
        return; // Already processed this packet
      }
      _seenPacketFingerprints.add(fingerprint);

      // CASE 1: The packet is intended for ME (Destination)
      if (packet.targetPhone == _myPhoneNumber) {
        _deliverPacketLocally(packet);
        _sendAcknowledgment(packet);
        return;
      }

      // CASE 2: STORE-AND-FORWARD RELAY (A -> B -> C)
      // I am an intermediate relay node B!
      _processRelayPacket(packet, fromEndpointId);
    } catch (e) {
      debugPrint("[BENSALMAN Mesh] Payload parsing error: $e");
    }
  }

  /// Store-and-Forward Relay: Intermediate node stores & forwards to target or next hop
  void _processRelayPacket(MeshPacket packet, String sourceEndpointId) {
    // Check TTL to prevent infinite bouncing
    if (packet.ttl <= 1) {
      debugPrint("[BENSALMAN Relay] Packet ${packet.packetId} expired TTL");
      return;
    }

    // Append my identity to hop record
    packet.ttl -= 1;
    packet.hops.add(_myPhoneNumber);

    // Check if the final target is directly connected right now!
    final targetEndpoint = _findEndpointForPhone(packet.targetPhone);
    if (targetEndpoint != null) {
      // Direct forward!
      _sendRawPacketToEndpoint(targetEndpoint, packet);
      debugPrint("[BENSALMAN Relay] Forwarded packet ${packet.packetId} directly to ${packet.targetPhone}");
    } else {
      // Store in local Relay Queue (Store-and-Forward) until target or intermediary appears!
      _relayQueue.add(packet);
      _persistRelayQueue();
      debugPrint("[BENSALMAN Relay] Stored packet ${packet.packetId} in relay queue for ${packet.targetPhone}");
      notifyListeners();
    }
  }

  /// Tries to deliver any stored packets in the relay queue
  void _drainRelayBuffer() {
    if (_relayQueue.isEmpty) return;

    final toRemove = <MeshPacket>[];
    for (final packet in _relayQueue) {
      final targetEndpoint = _findEndpointForPhone(packet.targetPhone);
      if (targetEndpoint != null) {
        _sendRawPacketToEndpoint(targetEndpoint, packet);
        toRemove.add(packet);
      } else {
        // Forward to any other connected cluster peer who has not seen this packet
        for (final entry in _connectedEndpoints.entries) {
          _sendRawPacketToEndpoint(entry.key, packet);
        }
      }
    }

    if (toRemove.isNotEmpty) {
      _relayQueue.removeWhere((p) => toRemove.contains(p));
      _persistRelayQueue();
      notifyListeners();
    }
  }

  String? _findEndpointForPhone(String phone) {
    final friend = _friends[phone];
    if (friend != null && friend.currentEndpointId != null) {
      return friend.currentEndpointId;
    }
    return null;
  }

  void _deliverPacketLocally(MeshPacket packet) {
    final friend = _friends[packet.senderPhone];
    if (friend == null) return;

    // Mutual consent check: Only decrypt if friendship was accepted
    if (friend.consentState != FriendshipConsentState.accepted) return;

    final key = EncryptionService.derivePairwiseKey(
      _myPhoneNumber,
      packet.senderPhone,
      friend.pairingSecret,
    );

    final decrypted = EncryptionService.decryptPayload(
      cipherPackage: packet.payloadCipher,
      key: key,
    );

    if (decrypted == null) return;

    // Green Content Charter check on decrypted content
    final safetyCheck = GreenFilter.evaluateText(decrypted);
    final finalContent = safetyCheck.isValid
        ? decrypted
        : "⚠️ [Non-Green Content Filtered]: ${safetyCheck.violationReason}";

    final message = BensalmanMessage(
      id: packet.packetId,
      senderPhone: packet.senderPhone,
      recipientPhone: _myPhoneNumber,
      type: packet.type == PacketType.voice
          ? MessageMediaType.voice
          : packet.type == PacketType.photo
              ? MessageMediaType.photo
              : MessageMediaType.text,
      content: finalContent,
      timestamp: packet.timestamp,
      status: MessageDeliveryStatus.delivered,
      isOutgoing: false,
      relayPath: packet.hops.isNotEmpty ? "${packet.hops.join(' -> ')} -> Me" : "Direct",
    );

    _chatHistory.putIfAbsent(packet.senderPhone, () => []).add(message);
    friend.unreadCount += 1;
    friend.lastSeenTimestamp = DateTime.now().millisecondsSinceEpoch;
    _packetStream.add(packet);
    notifyListeners();
  }

  void _sendAcknowledgment(MeshPacket packet) {
    // Generate ACK packet
    final ack = MeshPacket(
      packetId: _uuid.v4(),
      senderPhone: _myPhoneNumber,
      targetPhone: packet.senderPhone,
      type: PacketType.ack,
      payloadCipher: packet.packetId,
      timestamp: DateTime.now().millisecondsSinceEpoch,
    );
    sendPacket(ack);
  }

  /// Sends a packet either directly or broadcasts via cluster
  Future<void> sendPacket(MeshPacket packet) async {
    final targetEndpoint = _findEndpointForPhone(packet.targetPhone);

    if (targetEndpoint != null) {
      // Direct high-bandwidth transfer
      await _sendRawPacketToEndpoint(targetEndpoint, packet);
    } else {
      // Target is out of direct range! Send to all available adjacent nodes for Store-and-Forward
      for (final endpoint in _connectedEndpoints.keys) {
        await _sendRawPacketToEndpoint(endpoint, packet);
      }
      // Also queue locally in case no nodes are currently adjacent
      _relayQueue.add(packet);
      await _persistRelayQueue();
      notifyListeners();
    }
  }

  Future<void> _sendRawPacketToEndpoint(String endpointId, MeshPacket packet) async {
    try {
      final bytes = Uint8List.fromList(utf8.encode(packet.toJson()));
      await _nearby.sendPayload(endpointId, Payload.fromBytes(bytes));
    } catch (e) {
      debugPrint("[BENSALMAN Mesh] Send error: $e");
    }
  }

  /// Helper to send a text or voice message to a friend
  Future<BensalmanMessage?> sendMessage({
    required String recipientPhone,
    required String text,
    required MessageMediaType type,
    int? audioDurationSec,
  }) async {
    final friend = _friends[recipientPhone];
    if (friend == null) return null;

    // Green Content Charter pre-validation
    final greenCheck = GreenFilter.evaluateText(text);
    if (!greenCheck.isValid && type == MessageMediaType.text) {
      throw Exception(greenCheck.violationReason);
    }

    final key = EncryptionService.derivePairwiseKey(
      _myPhoneNumber,
      recipientPhone,
      friend.pairingSecret,
    );

    final cipher = EncryptionService.encryptPayload(plainText: text, key: key);
    final packetId = _uuid.v4();

    final packet = MeshPacket(
      packetId: packetId,
      senderPhone: _myPhoneNumber,
      targetPhone: recipientPhone,
      type: type == MessageMediaType.voice
          ? PacketType.voice
          : type == MessageMediaType.photo
              ? PacketType.photo
              : PacketType.text,
      payloadCipher: cipher,
      timestamp: DateTime.now().millisecondsSinceEpoch,
      meta: audioDurationSec != null ? '$audioDurationSec' : null,
    );

    final isDirect = friend.proximityStatus != FriendProximityStatus.outOfRange;
    final message = BensalmanMessage(
      id: packetId,
      senderPhone: _myPhoneNumber,
      recipientPhone: recipientPhone,
      type: type,
      content: text,
      timestamp: packet.timestamp,
      status: isDirect ? MessageDeliveryStatus.relayedHop : MessageDeliveryStatus.pendingRelay,
      isOutgoing: true,
      audioDurationSec: audioDurationSec,
      relayPath: isDirect ? "Direct" : "Pending Mesh Relay (A->B->C)",
    );

    _chatHistory.putIfAbsent(recipientPhone, () => []).add(message);
    await sendPacket(packet);
    notifyListeners();
    return message;
  }

  /// Mutual consent: Add friend invitation
  Future<void> inviteFriend({
    required String phoneNumber,
    required String displayName,
  }) async {
    final pairingSecret = _uuid.v4().substring(0, 8);
    final friend = BensalmanFriend(
      phoneNumber: phoneNumber,
      displayName: displayName,
      pairingSecret: pairingSecret,
      consentState: FriendshipConsentState.pendingOutgoing,
      lastSeenTimestamp: DateTime.now().millisecondsSinceEpoch,
    );
    _friends[phoneNumber] = friend;
    await _persistFriends();

    // Broadcast friend request mesh packet
    final packet = MeshPacket(
      packetId: _uuid.v4(),
      senderPhone: _myPhoneNumber,
      targetPhone: phoneNumber,
      type: PacketType.friendRequest,
      payloadCipher: jsonEncode({
        'senderName': _myDisplayName,
        'pairingSecret': pairingSecret,
      }),
      timestamp: DateTime.now().millisecondsSinceEpoch,
    );
    await sendPacket(packet);
    notifyListeners();
  }

  /// Accept incoming friend invitation (Mutual consent)
  Future<void> acceptFriendInvite(String phoneNumber) async {
    final friend = _friends[phoneNumber];
    if (friend != null) {
      friend.consentState = FriendshipConsentState.accepted;
      await _persistFriends();

      // Send friend accept confirmation packet
      final packet = MeshPacket(
        packetId: _uuid.v4(),
        senderPhone: _myPhoneNumber,
        targetPhone: phoneNumber,
        type: PacketType.friendAccept,
        payloadCipher: 'ACCEPTED',
        timestamp: DateTime.now().millisecondsSinceEpoch,
      );
      await sendPacket(packet);
      notifyListeners();
    }
  }

  void _updateFriendsProximity() {
    // In real hardware, BLE and WiFi direct endpoints map to proximity state:
    // Green = Direct WiFi Connected, Yellow = BLE scanned, Red = Out of range
    for (final friend in _friends.values) {
      if (friend.currentEndpointId != null &&
          _connectedEndpoints.containsKey(friend.currentEndpointId)) {
        friend.proximityStatus = FriendProximityStatus.onlineDirect;
      } else if (friend.rssi != null && friend.rssi! > -85) {
        friend.proximityStatus = FriendProximityStatus.nearbyBle;
      } else {
        friend.proximityStatus = FriendProximityStatus.outOfRange;
      }
    }
  }

  List<BensalmanMessage> getMessagesForFriend(String phoneNumber) {
    return _chatHistory[phoneNumber] ?? [];
  }
}

class ConnectedNode {
  final String endpointId;
  final DateTime connectedAt;
  ConnectedNode({required this.endpointId, required this.connectedAt});
}
