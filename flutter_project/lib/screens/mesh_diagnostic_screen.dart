import 'package:flutter/material.dart';
import '../core/constants.dart';
import '../services/mesh_service.dart';

class MeshDiagnosticScreen extends StatefulWidget {
  final MeshService meshService;

  const MeshDiagnosticScreen({
    super.key,
    required this.meshService,
  });

  @override
  State<MeshDiagnosticScreen> createState() => _MeshDiagnosticScreenState();
}

class _MeshDiagnosticScreenState extends State<MeshDiagnosticScreen> {
  @override
  void initState() {
    super.initState();
    widget.meshService.addListener(_onUpdate);
  }

  @override
  void dispose() {
    widget.meshService.removeListener(_onUpdate);
    super.dispose();
  }

  void _onUpdate() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final relayQueue = widget.meshService.relayQueue;
    final endpoints = widget.meshService.connectedEndpoints;

    return Scaffold(
      backgroundColor: BensalmanTheme.background,
      appBar: AppBar(
        title: const Text("MESH DIAGNOSTICS 👑"),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Architecture Info
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: BensalmanTheme.surface,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: BensalmanTheme.gold.withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    "STORE-AND-FORWARD RELAY ARCHITECTURE",
                    style: TextStyle(color: BensalmanTheme.gold, fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  SizedBox(height: 6),
                  Text(
                    "Strategy: Strategy.P2P_CLUSTER (Nearby Connections)\n"
                    "Relay Rule: If recipient C is unreachable, node A sends to node B (Yellow). "
                    "Node B stores in local encrypted Hive buffer, then forwards when C connects.",
                    style: TextStyle(color: Colors.white70, fontSize: 11, height: 1.4),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Connected Physical Endpoints
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  "DIRECT P2P PEERS",
                  style: TextStyle(color: BensalmanTheme.gold, fontWeight: FontWeight.bold, fontSize: 12),
                ),
                Text("${endpoints.length} connected", style: const TextStyle(color: Colors.white54, fontSize: 11)),
              ],
            ),
            const SizedBox(height: 8),
            if (endpoints.isEmpty)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: BensalmanTheme.surface, borderRadius: BorderRadius.circular(8)),
                child: const Text("No direct peers currently in WiFi Direct / BLE range.", style: TextStyle(color: Colors.white38, fontSize: 12)),
              )
            else
              ...endpoints.values.map((ep) => Container(
                    margin: const EdgeInsets.only(bottom: 6),
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(color: BensalmanTheme.surface, borderRadius: BorderRadius.circular(8)),
                    child: Row(
                      children: [
                        const Icon(Icons.router, color: BensalmanTheme.statusGreen, size: 18),
                        const SizedBox(width: 8),
                        Text(ep.endpointId, style: const TextStyle(color: Colors.white, fontSize: 12, fontFamily: 'monospace')),
                        const Spacer(),
                        const Text("Active Cluster Link", style: TextStyle(color: BensalmanTheme.statusGreen, fontSize: 10)),
                      ],
                    ),
                  )),

            const SizedBox(height: 20),

            // Store-and-Forward Buffer
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  "STORE-AND-FORWARD BUFFER (A -> B -> C)",
                  style: TextStyle(color: BensalmanTheme.gold, fontWeight: FontWeight.bold, fontSize: 12),
                ),
                Text("${relayQueue.length} queued", style: const TextStyle(color: Colors.white54, fontSize: 11)),
              ],
            ),
            const SizedBox(height: 8),

            if (relayQueue.isEmpty)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: BensalmanTheme.surface, borderRadius: BorderRadius.circular(8)),
                child: const Center(
                  child: Text(
                    "Relay buffer is clear. All packets successfully routed!",
                    style: TextStyle(color: Colors.white38, fontSize: 12),
                  ),
                ),
              )
            else
              ...relayQueue.map((p) => Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: BensalmanTheme.surface,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: BensalmanTheme.cardBorder),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(color: BensalmanTheme.goldDark, borderRadius: BorderRadius.circular(4)),
                              child: Text(p.type.name.toUpperCase(), style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                            ),
                            const SizedBox(width: 8),
                            Text("TTL: ${p.ttl}", style: const TextStyle(color: BensalmanTheme.goldLight, fontSize: 11)),
                            const Spacer(),
                            Text("Hops: ${p.hops.length}", style: const TextStyle(color: Colors.white54, fontSize: 11)),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text("From: ${p.senderPhone} ➔ Target: ${p.targetPhone}", style: const TextStyle(color: Colors.white, fontSize: 12)),
                        if (p.hops.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Text("Traversed: ${p.hops.join(' ➔ ')}", style: const TextStyle(color: Colors.white38, fontSize: 10)),
                        ],
                      ],
                    ),
                  )),
          ],
        ),
      ),
    );
  }
}
