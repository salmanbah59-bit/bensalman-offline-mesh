import 'package:flutter/material.dart';
import '../core/constants.dart';

/// Royal Crown Logo: "B" with crown, rendered in Gold #D4AF37
class CrownLogo extends StatelessWidget {
  final double size;
  final bool showGlow;

  const CrownLogo({
    super.key,
    this.size = 64,
    this.showGlow = true,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: BensalmanTheme.surface,
        border: Border.all(
          color: BensalmanTheme.gold,
          width: 2,
        ),
        boxShadow: showGlow
            ? [
                BoxShadow(
                  color: BensalmanTheme.gold.withOpacity(0.3),
                  blurRadius: 16,
                  spreadRadius: 2,
                ),
              ]
            : null,
      ),
      child: Center(
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Crown top
            Positioned(
              top: size * 0.14,
              child: Icon(
                Icons.emoji_events,
                color: BensalmanTheme.gold,
                size: size * 0.35,
              ),
            ),
            // Letter 'B'
            Positioned(
              bottom: size * 0.12,
              child: Text(
                'B',
                style: TextStyle(
                  color: BensalmanTheme.goldLight,
                  fontSize: size * 0.44,
                  fontWeight: FontWeight.w900,
                  fontFamily: 'serif',
                  letterSpacing: -1,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
