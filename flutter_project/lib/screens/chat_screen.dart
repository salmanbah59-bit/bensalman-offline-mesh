import 'package:flutter/material.dart';
import '../core/constants.dart';
import '../core/green_filter.dart';
import '../models/friend.dart';
import '../models/message.dart';
import '../services/mesh_service.dart';

class ChatScreen extends StatefulWidget {
  final BensalmanFriend friend;
  final MeshService meshService;

  const ChatScreen({
    super.key,
    required this.friend,
    required this.meshService,
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _textController = TextEditingController();
  final _scrollController = ScrollController();
  bool _isRecordingVoice = false;
  int _voiceSeconds = 0;

  @override
  void initState() {
    super.initState();
    widget.meshService.addListener(_onUpdate);
  }

  @override
  void dispose() {
    widget.meshService.removeListener(_onUpdate);
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onUpdate() {
    if (mounted) setState(() {});
  }

  Color get _statusColor {
    switch (widget.friend.proximityStatus) {
      case FriendProximityStatus.onlineDirect:
        return BensalmanTheme.statusGreen;
      case FriendProximityStatus.nearbyBle:
        return BensalmanTheme.statusYellow;
      case FriendProximityStatus.outOfRange:
        return BensalmanTheme.statusRed;
    }
  }

  String get _statusLabel {
    switch (widget.friend.proximityStatus) {
      case FriendProximityStatus.onlineDirect:
        return "Online Direct (WiFi)";
      case FriendProximityStatus.nearbyBle:
        return "Nearby BLE (~30m)";
      case FriendProximityStatus.outOfRange:
        return "Out of Range (Relayed A->B->C)";
    }
  }

  @override
  Widget build(BuildContext context) {
    final messages = widget.meshService.getMessagesForFriend(widget.friend.phoneNumber);

    return Scaffold(
      backgroundColor: BensalmanTheme.background,
      appBar: AppBar(
        titleSpacing: 0,
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: BensalmanTheme.surfaceLight,
              child: Text(
                widget.friend.displayName[0].toUpperCase(),
                style: const TextStyle(color: BensalmanTheme.gold, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.friend.displayName,
                    style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                  Row(
                    children: [
                      Container(width: 7, height: 7, decoration: BoxDecoration(color: _statusColor, shape: BoxShape.circle)),
                      const SizedBox(width: 5),
                      Text(_statusLabel, style: TextStyle(color: _statusColor, fontSize: 11)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 12),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: BensalmanTheme.surfaceLight,
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: BensalmanTheme.cardBorder),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: const [
                Icon(Icons.shield_outlined, color: BensalmanTheme.greenCharter, size: 14),
                SizedBox(width: 4),
                Text(
                  "GREEN SAFE",
                  style: TextStyle(color: BensalmanTheme.greenCharter, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Safety Banner
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            color: BensalmanTheme.surface,
            child: Row(
              children: [
                const Icon(Icons.lock_outline, color: BensalmanTheme.gold, size: 14),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    "E2E AES-256 Encrypted Offline Mesh. Intermediate relays cannot read this chat.",
                    style: TextStyle(color: Colors.white60, fontSize: 10),
                  ),
                ),
              ],
            ),
          ),

          // Message stream
          Expanded(
            child: messages.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.chat_bubble_outline, color: Colors.white24, size: 48),
                        const SizedBox(height: 12),
                        Text(
                          "Start an offline conversation with ${widget.friend.displayName}",
                          style: const TextStyle(color: Colors.white54, fontSize: 13),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          "Zero Internet & Zero SIM required",
                          style: TextStyle(color: BensalmanTheme.gold, fontSize: 11),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: messages.length,
                    itemBuilder: (context, index) {
                      final msg = messages[index];
                      return _buildMessageBubble(msg);
                    },
                  ),
          ),

          // Voice Recording Indicator
          if (_isRecordingVoice)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              color: BensalmanTheme.surfaceLight,
              child: Row(
                children: [
                  const Icon(Icons.fiber_manual_record, color: BensalmanTheme.statusRed, size: 18),
                  const SizedBox(width: 10),
                  Text(
                    "Recording Voice Note: 00:0${_voiceSeconds}s",
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                  const Spacer(),
                  TextButton(
                    onPressed: _cancelVoiceRecording,
                    child: const Text("Cancel", style: TextStyle(color: Colors.white54)),
                  ),
                  IconButton(
                    icon: const Icon(Icons.send, color: BensalmanTheme.gold),
                    onPressed: _sendVoiceNote,
                  ),
                ],
              ),
            ),

          // Input Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: BensalmanTheme.surface,
              border: const Border(top: BorderSide(color: BensalmanTheme.cardBorder)),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.photo_camera_back_outlined, color: BensalmanTheme.gold),
                    tooltip: "Send Photo (Offline Mesh Chunked)",
                    onPressed: _sendPhotoMessage,
                  ),
                  IconButton(
                    icon: Icon(
                      _isRecordingVoice ? Icons.mic : Icons.mic_none,
                      color: _isRecordingVoice ? BensalmanTheme.statusRed : BensalmanTheme.gold,
                    ),
                    tooltip: "Record Voice Note",
                    onPressed: _toggleVoiceRecording,
                  ),
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        hintText: "Type family-safe offline message...",
                        hintStyle: const TextStyle(color: Colors.white30, fontSize: 13),
                        filled: true,
                        fillColor: BensalmanTheme.surfaceLight,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                      ),
                      onSubmitted: (_) => _sendTextMessage(),
                    ),
                  ),
                  const SizedBox(width: 6),
                  IconButton(
                    icon: const Icon(Icons.send, color: BensalmanTheme.gold),
                    onPressed: _sendTextMessage,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(BensalmanMessage msg) {
    final isMe = msg.isOutgoing;
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isMe ? BensalmanTheme.goldDark.withOpacity(0.35) : BensalmanTheme.surfaceLight,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isMe ? BensalmanTheme.gold.withOpacity(0.4) : BensalmanTheme.cardBorder,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (msg.type == MessageMediaType.text)
              Text(
                msg.content,
                style: const TextStyle(color: Colors.white, fontSize: 14),
              )
            else if (msg.type == MessageMediaType.voice)
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.play_circle_fill, color: BensalmanTheme.gold, size: 28),
                  const SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("Voice Note (Offline BLE/WiFi)", style: TextStyle(color: Colors.white, fontSize: 12)),
                      Text("Duration: ${msg.audioDurationSec ?? 3}s", style: const TextStyle(color: Colors.white54, fontSize: 10)),
                    ],
                  ),
                ],
              )
            else if (msg.type == MessageMediaType.photo)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    height: 140,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Colors.black45,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Center(
                      child: Icon(Icons.photo, color: BensalmanTheme.gold, size: 48),
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text("Offline Compressed Photo", style: TextStyle(color: Colors.white70, fontSize: 11)),
                ],
              ),

            const SizedBox(height: 6),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (msg.relayPath != null) ...[
                  Icon(Icons.route, color: BensalmanTheme.gold.withOpacity(0.7), size: 10),
                  const SizedBox(width: 3),
                  Text(
                    msg.relayPath!,
                    style: TextStyle(color: BensalmanTheme.gold.withOpacity(0.7), fontSize: 9),
                  ),
                  const SizedBox(width: 8),
                ],
                Text(
                  _formatTime(msg.timestamp),
                  style: const TextStyle(color: Colors.white38, fontSize: 9),
                ),
                if (isMe) ...[
                  const SizedBox(width: 4),
                  Icon(
                    msg.status == MessageDeliveryStatus.delivered
                        ? Icons.done_all
                        : Icons.access_time,
                    color: msg.status == MessageDeliveryStatus.delivered
                        ? BensalmanTheme.statusGreen
                        : BensalmanTheme.goldLight,
                    size: 11,
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatTime(int ms) {
    final d = DateTime.fromMillisecondsSinceEpoch(ms);
    return "${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}";
  }

  Future<void> _sendTextMessage() async {
    final text = _textController.text.trim();
    if (text.isEmpty) return;

    // Green Content Charter validation
    final check = GreenFilter.evaluateText(text);
    if (!check.isValid) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: BensalmanTheme.statusRed,
          content: Text("🌿 ${check.violationReason}"),
        ),
      );
      return;
    }

    _textController.clear();
    await widget.meshService.sendMessage(
      recipientPhone: widget.friend.phoneNumber,
      text: text,
      type: MessageMediaType.text,
    );
  }

  void _toggleVoiceRecording() {
    setState(() {
      _isRecordingVoice = !_isRecordingVoice;
      _voiceSeconds = _isRecordingVoice ? 1 : 0;
    });
  }

  void _cancelVoiceRecording() {
    setState(() {
      _isRecordingVoice = false;
      _voiceSeconds = 0;
    });
  }

  Future<void> _sendVoiceNote() async {
    final sec = _voiceSeconds > 0 ? _voiceSeconds : 4;
    _cancelVoiceRecording();
    await widget.meshService.sendMessage(
      recipientPhone: widget.friend.phoneNumber,
      text: "[Voice Note: $sec sec]",
      type: MessageMediaType.voice,
      audioDurationSec: sec,
    );
  }

  Future<void> _sendPhotoMessage() async {
    await widget.meshService.sendMessage(
      recipientPhone: widget.friend.phoneNumber,
      text: "[Photo: Encrypted 128KB Packet]",
      type: MessageMediaType.photo,
    );
  }
}
