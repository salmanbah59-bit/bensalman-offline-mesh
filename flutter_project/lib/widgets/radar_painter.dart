import 'dart:math';
import 'package:flutter/material.dart';
import '../core/constants.dart';
import '../models/friend.dart';

class RadarWidget extends StatefulWidget {
  final List<BensalmanFriend> friends;
  final ValueChanged<BensalmanFriend>? onFriendSelected;

  const RadarWidget({
    super.key,
    required this.friends,
    this.onFriendSelected,
  });

  @override
  State<RadarWidget> createState() => _RadarWidgetState();
}

class _RadarWidgetState extends State<RadarWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 1.0,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return CustomPaint(
            painter: RadarPainter(
              sweepAngle: _controller.value * 2 * pi,
              friends: widget.friends,
            ),
          );
        },
      ),
    );
  }
}

class RadarPainter extends CustomPainter {
  final double sweepAngle;
  final List<BensalmanFriend> friends;

  RadarPainter({required this.sweepAngle, required this.friends});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    // Background circle
    final bgPaint = Paint()
      ..color = const Color(0xFF0F0F0F)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, radius, bgPaint);

    // Concentric gold rings
    final ringPaint = Paint()
      ..color = BensalmanTheme.gold.withOpacity(0.18)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    final ringCount = 4;
    for (int i = 1; i <= ringCount; i++) {
      canvas.drawCircle(center, radius * (i / ringCount), ringPaint);
    }

    // Crosshairs
    final crosshairPaint = Paint()
      ..color = BensalmanTheme.gold.withOpacity(0.12)
      ..strokeWidth = 1.0;
    canvas.drawLine(Offset(center.dx, 0), Offset(center.dx, size.height), crosshairPaint);
    canvas.drawLine(Offset(0, center.dy), Offset(size.width, center.dy), crosshairPaint);

    // Rotating Radar Sweep sector
    final sweepPaint = Paint()
      ..shader = SweepGradient(
        center: Alignment.center,
        startAngle: 0,
        endAngle: pi / 2,
        colors: [
          BensalmanTheme.gold.withOpacity(0.35),
          BensalmanTheme.gold.withOpacity(0.0),
        ],
        transform: GradientRotation(sweepAngle - pi / 2),
      ).createShader(Rect.fromCircle(center: center, radius: radius));

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      sweepAngle - pi / 2,
      pi / 2,
      true,
      sweepPaint,
    );

    // Radar Center Crown Core
    final centerCorePaint = Paint()
      ..color = BensalmanTheme.gold
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, 4, centerCorePaint);

    // Draw Friends as radar blips
    final rand = Random(42);
    for (int i = 0; i < friends.length; i++) {
      final f = friends[i];
      final angle = (i * (2 * pi / max(1, friends.length))) + 0.3;
      double distFraction;
      Color statusColor;

      switch (f.proximityStatus) {
        case FriendProximityStatus.onlineDirect:
          distFraction = 0.35;
          statusColor = BensalmanTheme.statusGreen;
          break;
        case FriendProximityStatus.nearbyBle:
          distFraction = 0.65;
          statusColor = BensalmanTheme.statusYellow;
          break;
        case FriendProximityStatus.outOfRange:
          distFraction = 0.90;
          statusColor = BensalmanTheme.statusRed;
          break;
      }

      final blipX = center.dx + cos(angle) * (radius * distFraction);
      final blipY = center.dy + sin(angle) * (radius * distFraction);
      final blipPos = Offset(blipX, blipY);

      // Blip glow
      final glowPaint = Paint()
        ..color = statusColor.withOpacity(0.4)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(blipPos, 8, glowPaint);

      // Blip dot
      final dotPaint = Paint()
        ..color = statusColor
        ..style = PaintingStyle.fill;
      canvas.drawCircle(blipPos, 4, dotPaint);
    }
  }

  @override
  bool shouldRepaint(covariant RadarPainter oldDelegate) {
    return oldDelegate.sweepAngle != sweepAngle || oldDelegate.friends != friends;
  }
}
