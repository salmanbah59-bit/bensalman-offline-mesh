import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:permission_handler/permission_handler.dart';

import 'core/constants.dart';
import 'screens/auth_screen.dart';
import 'screens/green_charter_screen.dart';
import 'screens/radar_home_screen.dart';
import 'services/auth_service.dart';
import 'services/mesh_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Encrypted Hive NoSQL Database for offline persistence
  await Hive.initFlutter();

  // Request all hardware permissions for offline mesh
  await _requestPermissions();

  final authService = AuthService();
  await authService.init();

  final meshService = MeshService();
  if (authService.isRegistered && authService.isCharterAccepted) {
    await meshService.initialize(
      myPhone: authService.phoneNumber ?? "unknown",
      myName: authService.displayName ?? "Crown User",
    );
  }

  runApp(BensalmanApp(
    authService: authService,
    meshService: meshService,
  ));
}

Future<void> _requestPermissions() async {
  await [
    Permission.bluetooth,
    Permission.bluetoothScan,
    Permission.bluetoothAdvertise,
    Permission.bluetoothConnect,
    Permission.location,
    Permission.nearbyWifiDevices,
    Permission.microphone,
    Permission.camera,
  ].request();
}

class BensalmanApp extends StatelessWidget {
  final AuthService authService;
  final MeshService meshService;

  const BensalmanApp({
    super.key,
    required this.authService,
    required this.meshService,
  });

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BENSALMAN 👑',
      debugShowCheckedModeBanner: false,
      theme: BensalmanTheme.darkTheme,
      home: _resolveInitialScreen(context),
    );
  }

  Widget _resolveInitialScreen(BuildContext context) {
    return AnimatedBuilder(
      animation: authService,
      builder: (context, _) {
        // Step 1: Online Registration once (Phone number + OTP)
        if (!authService.isRegistered) {
          return AuthScreen(
            authService: authService,
            onRegistered: () {
              // Proceed to Step 2
            },
          );
        }

        // Step 2: Must accept the Green Content Charter
        if (!authService.isCharterAccepted) {
          return GreenCharterScreen(
            authService: authService,
            onAccepted: () async {
              await meshService.initialize(
                myPhone: authService.phoneNumber ?? "user",
                myName: authService.displayName ?? "Crown User",
              );
            },
          );
        }

        // Step 3: Offline Core Radar Home Screen
        return RadarHomeScreen(
          authService: authService,
          meshService: meshService,
        );
      },
    );
  }
}
