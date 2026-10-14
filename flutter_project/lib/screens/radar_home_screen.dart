import 'package:flutter/material.dart';
import '../core/constants.dart';
import '../models/friend.dart';
import '../services/auth_service.dart';
import '../services/mesh_service.dart';
import '../widgets/crown_logo.dart';
import '../widgets/radar_painter.dart';
import 'chat_screen.dart';
import 'friends_screen.dart';
import 'mesh_diagnostic_screen.dart';

class RadarHomeScreen extends StatefulWidget {
  final AuthService authService;
  final MeshService meshService;

  const RadarHomeScreen({
    super.key,
    required this.authService,
    required this.meshService,
  });

  @override
  State<RadarHomeScreen> createState() => _RadarHomeScreenState();
}

class _RadarHomeScreenState extends State<RadarHomeScreen> {
  @override
  void initState() {
    super.initState();
    widget.meshService.addListener(_onMeshUpdate);
  }

  @override
  void dispose() {
    widget.meshService.removeListener(_onMeshUpdate);
    super.dispose();
  }

  void _onMeshUpdate() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final friendsList = widget.meshService.friends.values.toList();
    final relayCount = widget.meshService.relayQueue.length;
    final activeEndpointsCount = widget.meshService.connectedEndpoints.length;

    return Scaffold(
      backgroundColor: BensalmanTheme.background,
      appBar: AppBar(
        leading: Padding(
          padding: const EdgeInsets.all(8.0),
          child: const CrownLogo(size: 32, showGlow: false),
        ),
        title: Column(
          children: [
            const Text(
              "BENSALMAN 👑",
              style: TextStyle(
                color: BensalmanTheme.gold,
                fontSize: 18,
                fontWeight: FontWeight.w900,
                letterSpacing: 1.5,
              ),
            ),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(
                    color: BensalmanTheme.statusGreen,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 4),
                const Text(
                  "OFFLINE MESH ACTIVE",
                  style: TextStyle(
                    color: Colors.white54,
                    fontSize: 9,
                    letterSpacing: 1.0,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.hub_outlined, color: BensalmanTheme.gold),
            tooltip: "Mesh Diagnostics & Relays",
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => MeshDiagnosticScreen(meshService: widget.meshService),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.person_add_alt_1, color: BensalmanTheme.gold),
            tooltip: "Add Friends (Mutual Consent)",
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => FriendsScreen(meshService: widget.meshService),
                ),
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Store & Forward Relay Banner if packets queued
            if (relayCount > 0)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                color: BensalmanTheme.goldDark.withOpacity(0.3),
                child: Row(
                  children: [
                    const Icon(Icons.sync_alt, color: BensalmanTheme.goldLight, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        "Relaying $relayCount packet(s) in background (Store & Forward A->B->C)",
                        style: const TextStyle(color: BensalmanTheme.goldLight, fontSize: 11),
                      ),
                    ),
                  ],
                ),
              ),

            // Radar Section
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  RadarWidget(
                    friends: friendsList,
                    onFriendSelected: (friend) {
                      _openChat(friend);
                    },
                  ),
                  // Center Radar Badge
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: BensalmanTheme.background,
                      border: Border.all(color: BensalmanTheme.gold, width: 2),
                      boxShadow: [
                        BoxShadow(
                          color: BensalmanTheme.gold.withOpacity(0.4),
                          blurRadius: 10,
                        ),
                      ],
                    ),
                    child: const Center(
                      child: Text(
                        "👑",
                        style: TextStyle(fontSize: 20),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Proximity Status Legend
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _legendItem(BensalmanTheme.statusGreen, "Direct WiFi Direct"),
                  _legendItem(BensalmanTheme.statusYellow, "Nearby BLE (~30m)"),
                  _legendItem(BensalmanTheme.statusRed, "Out of Range (Relay)"),
                ],
              ),
            ),

            const SizedBox(height: 12),
            const Divider(color: BensalmanTheme.cardBorder, height: 1),

            // Friends Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    "MUTUAL FRIENDS",
                    style: TextStyle(
                      color: BensalmanTheme.gold,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                    ),
                  ),
                  Text(
                    "${friendsList.length} paired • $activeEndpointsCount active nodes",
                    style: const TextStyle(color: Colors.white54, fontSize: 11),
                  ),
                ],
              ),
            ),

            // Friends List
            Expanded(
              child: friendsList.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.people_outline, color: Colors.white24, size: 48),
                          const SizedBox(height: 12),
                          const Text(
                            "No friends in mesh yet",
                            style: TextStyle(color: Colors.white54, fontSize: 14),
                          ),
                          const SizedBox(height: 4),
                          TextButton(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => FriendsScreen(meshService: widget.meshService),
                                ),
                              );
                            },
                            child: const Text(
                              "+ Invite Friend by Phone",
                              style: TextStyle(color: BensalmanTheme.gold),
                            ),
                          ),
                        ],
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      itemCount: friendsList.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (context, index) {
                        final friend = friendsList[index];
                        return _buildFriendCard(friend);
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _legendItem(Color color, String label) {
    return Row(
      children: [
        Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 10)),
      ],
    );
  }

  Widget _buildFriendCard(BensalmanFriend friend) {
    Color statusColor;
    String statusText;
    switch (friend.proximityStatus) {
      case FriendProximityStatus.onlineDirect:
        statusColor = BensalmanTheme.statusGreen;
        statusText = "Online (Direct WiFi Direct)";
        break;
      case FriendProximityStatus.nearbyBle:
        statusColor = BensalmanTheme.statusYellow;
        statusText = "Nearby Bluetooth (~20m)";
        break;
      case FriendProximityStatus.outOfRange:
        statusColor = BensalmanTheme.statusRed;
        statusText = "Out of Range (Relayed A->B->C)";
        break;
    }

    final isAccepted = friend.consentState == FriendshipConsentState.accepted;

    return InkWell(
      onTap: isAccepted ? () => _openChat(friend) : null,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: BensalmanTheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: BensalmanTheme.cardBorder),
        ),
        child: Row(
          children: [
            // Avatar with proximity status ring
            Stack(
              alignment: Alignment.bottomRight,
              children: [
                CircleAvatar(
                  radius: 22,
                  backgroundColor: BensalmanTheme.surfaceLight,
                  child: Text(
                    friend.displayName.isNotEmpty ? friend.displayName[0].toUpperCase() : '?',
                    style: const TextStyle(
                      color: BensalmanTheme.goldLight,
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                ),
                Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: statusColor,
                    shape: BoxShape.circle,
                    border: Border.all(color: BensalmanTheme.surface, width: 2),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 14),

            // Friend Name & Status
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        friend.displayName,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      if (!isAccepted) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: BensalmanTheme.goldDark.withOpacity(0.3),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            "PENDING",
                            style: TextStyle(color: BensalmanTheme.goldLight, fontSize: 9),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.wifi_tethering, color: statusColor, size: 12),
                      const SizedBox(width: 4),
                      Text(
                        statusText,
                        style: TextStyle(color: statusColor, fontSize: 11),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Action
            if (isAccepted)
              IconButton(
                icon: const Icon(Icons.chat_bubble_outline, color: BensalmanTheme.gold),
                onPressed: () => _openChat(friend),
              )
            else
              Text(
                "Awaiting Consent",
                style: TextStyle(color: Colors.white38, fontSize: 11),
              ),
          ],
        ),
      ),
    );
  }

  void _openChat(BensalmanFriend friend) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ChatScreen(
          friend: friend,
          meshService: widget.meshService,
        ),
      ),
    );
  }
}
