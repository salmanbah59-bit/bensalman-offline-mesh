import 'package:flutter/material.dart';
import '../core/constants.dart';
import '../models/friend.dart';
import '../services/mesh_service.dart';

class FriendsScreen extends StatefulWidget {
  final MeshService meshService;

  const FriendsScreen({
    super.key,
    required this.meshService,
  });

  @override
  State<FriendsScreen> createState() => _FriendsScreenState();
}

class _FriendsScreenState extends State<FriendsScreen> {
  final _phoneController = TextEditingController();
  final _nameController = TextEditingController();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    widget.meshService.addListener(_onUpdate);
  }

  @override
  void dispose() {
    widget.meshService.removeListener(_onUpdate);
    _phoneController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  void _onUpdate() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final friends = widget.meshService.friends.values.toList();
    final pendingIncoming = friends.where((f) => f.consentState == FriendshipConsentState.pendingIncoming).toList();
    final acceptedFriends = friends.where((f) => f.consentState == FriendshipConsentState.accepted).toList();
    final pendingOutgoing = friends.where((f) => f.consentState == FriendshipConsentState.pendingOutgoing).toList();

    return Scaffold(
      backgroundColor: BensalmanTheme.background,
      appBar: AppBar(
        title: const Text("FRIENDS & CONSENT 🤝"),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Consent Guarantee Notice
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: BensalmanTheme.surface,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: BensalmanTheme.gold.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.handshake_outlined, color: BensalmanTheme.gold, size: 28),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text(
                            "MUTUAL CONSENT ONLY",
                            style: TextStyle(color: BensalmanTheme.gold, fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                          SizedBox(height: 2),
                          Text(
                            "No user can force-message you. Both parties must mutually exchange cryptographic pairing keys.",
                            style: TextStyle(color: Colors.white70, fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Add Friend Section
              const Text(
                "Invite Friend to Offline Mesh",
                style: TextStyle(color: BensalmanTheme.goldLight, fontWeight: FontWeight.bold, fontSize: 14),
              ),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: BensalmanTheme.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: BensalmanTheme.cardBorder),
                ),
                child: Column(
                  children: [
                    TextField(
                      controller: _nameController,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        labelText: "Friend's Name",
                        labelStyle: const TextStyle(color: BensalmanTheme.gold, fontSize: 13),
                        filled: true,
                        fillColor: BensalmanTheme.surfaceLight,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      style: const TextStyle(color: Colors.white),
                      decoration: InputDecoration(
                        labelText: "Friend's Phone Number",
                        labelStyle: const TextStyle(color: BensalmanTheme.gold, fontSize: 13),
                        filled: true,
                        fillColor: BensalmanTheme.surfaceLight,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                    const SizedBox(height: 14),
                    SizedBox(
                      width: double.infinity,
                      height: 46,
                      child: ElevatedButton.icon(
                        icon: const Icon(Icons.send_outlined, size: 18),
                        label: const Text("SEND PAIRING REQUEST (BLE / MESH)", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: BensalmanTheme.gold,
                          foregroundColor: BensalmanTheme.background,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        onPressed: _isLoading ? null : _handleInvite,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Incoming Pending Invitations
              if (pendingIncoming.isNotEmpty) ...[
                const Text(
                  "Pending Invitations (Requires Your Consent)",
                  style: TextStyle(color: BensalmanTheme.statusYellow, fontWeight: FontWeight.bold, fontSize: 13),
                ),
                const SizedBox(height: 8),
                ...pendingIncoming.map((f) => _buildIncomingCard(f)),
                const SizedBox(height: 20),
              ],

              // Outgoing Pending
              if (pendingOutgoing.isNotEmpty) ...[
                const Text(
                  "Awaiting Friend's Acceptance",
                  style: TextStyle(color: Colors.white60, fontWeight: FontWeight.bold, fontSize: 13),
                ),
                const SizedBox(height: 8),
                ...pendingOutgoing.map((f) => _buildOutgoingCard(f)),
                const SizedBox(height: 20),
              ],

              // Mutually Paired Friends
              const Text(
                "Active Mutually Paired Friends",
                style: TextStyle(color: BensalmanTheme.gold, fontWeight: FontWeight.bold, fontSize: 13),
              ),
              const SizedBox(height: 8),
              if (acceptedFriends.isEmpty)
                const Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Center(
                    child: Text("No paired friends yet", style: TextStyle(color: Colors.white38, fontSize: 13)),
                  ),
                )
              else
                ...acceptedFriends.map((f) => _buildAcceptedCard(f)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildIncomingCard(BensalmanFriend friend) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: BensalmanTheme.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: BensalmanTheme.statusYellow.withOpacity(0.5)),
      ),
      child: Row(
        children: [
          CircleAvatar(backgroundColor: BensalmanTheme.surfaceLight, child: const Icon(Icons.person, color: BensalmanTheme.statusYellow)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(friend.displayName, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                Text(friend.phoneNumber, style: const TextStyle(color: Colors.white60, fontSize: 11)),
              ],
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: BensalmanTheme.statusGreen, foregroundColor: Colors.black),
            onPressed: () => widget.meshService.acceptFriendInvite(friend.phoneNumber),
            child: const Text("ACCEPT"),
          ),
        ],
      ),
    );
  }

  Widget _buildOutgoingCard(BensalmanFriend friend) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: BensalmanTheme.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: BensalmanTheme.cardBorder),
      ),
      child: Row(
        children: [
          CircleAvatar(backgroundColor: BensalmanTheme.surfaceLight, child: const Icon(Icons.hourglass_top, color: Colors.white38)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(friend.displayName, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                Text("Invite sent to ${friend.phoneNumber}", style: const TextStyle(color: Colors.white54, fontSize: 11)),
              ],
            ),
          ),
          const Text("Pending...", style: TextStyle(color: BensalmanTheme.gold, fontSize: 11)),
        ],
      ),
    );
  }

  Widget _buildAcceptedCard(BensalmanFriend friend) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: BensalmanTheme.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: BensalmanTheme.cardBorder),
      ),
      child: Row(
        children: [
          CircleAvatar(backgroundColor: BensalmanTheme.surfaceLight, child: const Icon(Icons.check, color: BensalmanTheme.statusGreen)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(friend.displayName, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                Text("${friend.phoneNumber} • Key: AES-256 Verified", style: const TextStyle(color: Colors.white54, fontSize: 11)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _handleInvite() async {
    final name = _nameController.text.trim();
    final phone = _phoneController.text.trim();
    if (name.isEmpty || phone.isEmpty) return;

    setState(() => _isLoading = true);
    await widget.meshService.inviteFriend(phoneNumber: phone, displayName: name);
    _nameController.clear();
    _phoneController.clear();
    setState(() => _isLoading = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: BensalmanTheme.surfaceLight,
          content: Text("👑 Invitation broadcasted via BLE/Mesh cluster!"),
        ),
      );
    }
  }
}
