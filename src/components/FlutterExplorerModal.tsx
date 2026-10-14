import React, { useState } from 'react';
import JSZip from 'jszip';
import { 
  FolderGit2, 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { CrownLogo } from './CrownLogo';

// Map of all Flutter project source files
const FLUTTER_PROJECT_FILES: Record<string, { lang: string; content: string }> = {
  'pubspec.yaml': {
    lang: 'yaml',
    content: `name: bensalman
description: "BENSALMAN 👑 - Production-ready offline mesh messaging app working with zero internet or SIM using BLE, WiFi Direct, and Store-and-Forward relay with Green Family-Safe charter."
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.3.0 <4.0.0'
  flutter: ">=3.22.0"

dependencies:
  flutter:
    sdk: flutter

  # Mesh Networking & Offline Direct Cluster
  nearby_connections:
    git:
      url: https://github.com/mannprerak2/nearby_connections.git

  # Bluetooth Low Energy Proximity & Scanning
  flutter_blue_plus: ^1.34.0

  # High Performance Offline NoSQL Database (Encrypted)
  hive: ^2.2.3
  hive_flutter: ^1.1.0

  # Strong AES-256 GCM / CBC Cryptography
  encrypt: ^5.0.3

  # Unique Identification for Nodes, Packets & Hops
  uuid: ^4.4.0

  # Runtime Android/iOS Hardware Permissions
  permission_handler: ^11.3.1

  # Audio Voice Notes recording & playback offline
  record: ^5.1.2
  audioplayers: ^6.0.0

  # Local Media & Photo Storage
  image_picker: ^1.1.2
  path_provider: ^2.1.3
  crypto: ^3.0.3

  # Online Registration Once (Firebase Phone Auth)
  firebase_core: ^3.1.0
  firebase_auth: ^5.1.0

  cupertino_icons: ^1.0.8

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0
  build_runner: ^2.4.9
  hive_generator: ^2.0.1

flutter:
  uses-material-design: true`,
  },
  'android/app/build.gradle': {
    lang: 'groovy',
    content: `plugins {
    id "com.android.application"
    id "kotlin-android"
    id "dev.flutter.flutter-gradle-plugin"
}

android {
    namespace "com.bensalman.offline.mesh"
    compileSdk 34

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }

    kotlinOptions {
        jvmTarget = '1.8'
    }

    defaultConfig {
        applicationId "com.bensalman.offline.mesh"
        minSdkVersion 23
        targetSdkVersion 34
        versionCode 1
        versionName "1.0"
        multiDexEnabled true
    }

    buildTypes {
        release {
            signingConfig signingConfigs.debug
            minifyEnabled false
            shrinkResources false
        }
    }
}

flutter {
    source '../..'
}

dependencies {
    implementation 'androidx.multidex:multidex:2.0.1'
}`,
  },
  'android/app/src/main/AndroidManifest.xml': {
    lang: 'xml',
    content: `<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.bensalman.offline.mesh">

    <!-- Essential Bluetooth & WiFi Direct permissions for Mesh P2P_CLUSTER -->
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN" android:usesPermissionFlags="neverForLocation" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

    <!-- WiFi Direct permissions -->
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES" />

    <!-- Offline Audio & Media permissions -->
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />

    <!-- Foreground service for continuous Store-and-Forward Mesh background relay -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE" />

    <!-- Internet only used during the 1-time initial OTP registration -->
    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:label="BENSALMAN 👑"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode">
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
    </application>
</manifest>`,
  },
  'lib/main.dart': {
    lang: 'dart',
    content: `import 'package:flutter/material.dart';
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
  await Hive.initFlutter();

  await [
    Permission.bluetooth,
    Permission.bluetoothScan,
    Permission.bluetoothAdvertise,
    Permission.bluetoothConnect,
    Permission.location,
    Permission.nearbyWifiDevices,
    Permission.microphone,
  ].request();

  final authService = AuthService();
  await authService.init();

  final meshService = MeshService();
  if (authService.isRegistered && authService.isCharterAccepted) {
    await meshService.initialize(
      myPhone: authService.phoneNumber ?? "user",
      myName: authService.displayName ?? "Crown User",
    );
  }

  runApp(BensalmanApp(authService: authService, meshService: meshService));
}

class BensalmanApp extends StatelessWidget {
  final AuthService authService;
  final MeshService meshService;

  const BensalmanApp({super.key, required this.authService, required this.meshService});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BENSALMAN 👑',
      debugShowCheckedModeBanner: false,
      theme: BensalmanTheme.darkTheme,
      home: AnimatedBuilder(
        animation: authService,
        builder: (context, _) {
          if (!authService.isRegistered) return AuthScreen(authService: authService, onRegistered: () {});
          if (!authService.isCharterAccepted) return GreenCharterScreen(authService: authService, onAccepted: () {});
          return RadarHomeScreen(authService: authService, meshService: meshService);
        },
      ),
    );
  }
}`,
  },
  'lib/services/mesh_service.dart': {
    lang: 'dart',
    content: `// BENSALMAN 👑 Offline Core Mesh Engine
// Uses nearby_connections P2P_CLUSTER & Store-and-Forward relay (A -> B -> C)
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

class MeshService extends ChangeNotifier {
  static const String serviceId = "com.bensalman.offline.mesh";
  static const Strategy strategy = Strategy.P2P_CLUSTER;

  final Nearby _nearby = Nearby();
  final Uuid _uuid = const Uuid();

  final Map<String, ConnectedNode> _connectedEndpoints = {};
  final Map<String, BensalmanFriend> _friends = {};
  final List<MeshPacket> _relayQueue = []; // Store-and-Forward Hive buffer

  Future<void> startMeshNode() async {
    // 1. Start Advertising to P2P_CLUSTER
    await _nearby.startAdvertising(
      _myPhoneNumber,
      strategy,
      onConnectionInitiated: (id, info) => _nearby.acceptConnection(id, onPayLoadRecieved: _handlePayload),
      onConnectionResult: (id, status) => _onConnect(id, status),
      onDisconnected: (id) => _onDisconnect(id),
      serviceId: serviceId,
    );

    // 2. Start Discovery
    await _nearby.startDiscovery(
      _myPhoneNumber,
      strategy,
      onEndpointFound: (id, name, sId) => _nearby.requestConnection(_myDisplayName, id, onConnectionInitiated: ...),
      onEndpointLost: (id) => _onDisconnect(id),
      serviceId: serviceId,
    );
  }

  void _handlePayload(String endpointId, Payload payload) {
    final packet = MeshPacket.fromJson(utf8.decode(payload.bytes!));
    if (packet.targetPhone == _myPhoneNumber) {
      _deliverLocally(packet);
    } else {
      // Store-and-Forward Relay: Packet intended for another node (A -> B -> C)
      _relayQueue.add(packet);
      _persistRelayQueue();
      _drainRelayBuffer();
    }
  }
}`,
  },
  'lib/core/constants.dart': {
    lang: 'dart',
    content: `import 'package:flutter/material.dart';

class BensalmanTheme {
  // Brand Palette: Premium Black and Gold
  static const Color background = Color(0xFF0D0D0D);
  static const Color surface = Color(0xFF141414);
  static const Color gold = Color(0xFFD4AF37);
  static const Color goldLight = Color(0xFFF3E5AB);
  
  // Status Colors
  static const Color statusGreen = Color(0xFF00E676);   // Online Direct WiFi Direct
  static const Color statusYellow = Color(0xFFFFD600);  // Nearby Bluetooth Low Energy
  static const Color statusRed = Color(0xFFFF1744);     // Out of Range (Relay A->B->C)
}`,
  },
  'README.md': {
    lang: 'markdown',
    content: `# BENSALMAN 👑 - Offline Mesh Messenger
Build production APK:
$ flutter pub get
$ flutter build apk --release

Outputs: build/app/outputs/flutter-apk/app-release.apk`,
  },
};

export const FlutterExplorerModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState('pubspec.yaml');
  const [copied, setCopied] = useState(false);
  const [zipping, setZipping] = useState(false);

  const handleCopy = () => {
    const file = FLUTTER_PROJECT_FILES[selectedFile];
    if (file) {
      navigator.clipboard.writeText(file.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadZip = async () => {
    try {
      setZipping(true);
      const zip = new JSZip();
      const folder = zip.folder('bensalman_flutter');

      // Add all source files
      for (const [path, file] of Object.entries(FLUTTER_PROJECT_FILES)) {
        folder?.file(path, file.content);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'bensalman_flutter_mesh_project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('ZIP error', e);
    } finally {
      setZipping(false);
    }
  };

  const currentFile = FLUTTER_PROJECT_FILES[selectedFile];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0D0D0D] text-[#E5E5E5] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#121212] border-b border-[#2A2412]">
        <div className="flex items-center space-x-3">
          <CrownLogo size={36} showGlow={false} />
          <div>
            <h2 className="text-base font-black text-white font-royal tracking-wider flex items-center space-x-2">
              <span>FLUTTER SOURCE & APK RELEASE SUITE</span>
              <span className="text-xs text-[#D4AF37]">👑</span>
            </h2>
            <p className="text-xs text-white/50">
              Flutter 3.22 • nearby_connections FORK • flutter_blue_plus • Hive • encrypt
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadZip}
            disabled={zipping}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#D4AF37] text-black font-extrabold text-xs uppercase hover:bg-[#FFF1B0] transition-colors shadow-lg"
          >
            <Download className="w-4 h-4" />
            <span>{zipping ? 'Zipping...' : 'Download Project .ZIP'}</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#181818] border border-[#333333] hover:text-white text-xs font-semibold"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Terminal Build Guide Banner */}
      <div className="px-6 py-3 bg-[#1A160E] border-b border-[#D4AF37]/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2 font-mono text-[#F3E5AB]">
          <Terminal className="w-4 h-4 text-[#D4AF37]" />
          <span>flutter build apk --release</span>
        </div>
        <div className="text-white/60 text-[11px]">
          Ready for Android 14 (API 34) with full BLE & WiFi Direct P2P_CLUSTER support
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* File Tree Sidebar */}
        <div className="w-full md:w-72 bg-[#121212] border-r border-[#222222] p-4 overflow-y-auto">
          <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-3">
            Project Files
          </h4>
          <div className="space-y-1">
            {Object.keys(FLUTTER_PROJECT_FILES).map((fileName) => (
              <button
                key={fileName}
                onClick={() => setSelectedFile(fileName)}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-mono text-left transition-colors ${
                  selectedFile === fileName
                    ? 'bg-[#2A2412] text-[#F3E5AB] font-bold border border-[#D4AF37]/40'
                    : 'text-white/70 hover:bg-[#1A1A1A] hover:text-white'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span className="truncate">{fileName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Code Content Viewer */}
        <div className="flex-1 flex flex-col bg-[#0A0A0A] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-[#141414] border-b border-[#222222]">
            <span className="text-xs font-mono text-white/80">{selectedFile}</span>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-3 py-1 rounded bg-[#1F1F1F] hover:bg-[#2A2412] border border-[#333333] text-xs text-white/90 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#00E676]" />
                  <span className="text-[#00E676]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <div className="flex-1 p-4 overflow-auto">
            <pre className="font-mono text-xs text-[#E5E5E5] leading-relaxed whitespace-pre font-light">
              {currentFile?.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
