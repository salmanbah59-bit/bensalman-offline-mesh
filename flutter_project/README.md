# BENSALMAN 👑 - Offline Mesh Messenger

Production-ready, Zero-Internet, Zero-SIM offline messaging application built with **Flutter 3.22**, **Nearby Connections P2P_CLUSTER fork**, **Flutter Blue Plus (BLE)**, and **Store-and-Forward Relay**.

---

## 🏛️ Core Principles & Architecture

1. **One-Time Registration**: Phone number + OTP via Firebase Auth. Once registered, tokens are stored in an encrypted Hive box; **no internet or SIM card is ever required again**.
2. **Green Content Charter**: Strict family-safe oath and on-device offline keyword heuristics reject hate, toxicity, and non-green content.
3. **Mutual Consent Only**: Neither node can force a message. Friends are invited by phone and must reciprocally accept before AES-256 keys activate.
4. **Offline Core Mesh & Proximity**:
   - **Green**: Online (Connected directly via WiFi Direct P2P)
   - **Yellow**: Nearby Bluetooth Low Energy (~10-30m)
   - **Red**: Out of Range (Routed via Store-and-Forward Relay `A -> B -> C`)
5. **Store-and-Forward Multi-Hop Relay**:
   - Node A wishes to send to Node C (Red - Out of Range).
   - Node A routes through Node B (Yellow - Nearby).
   - Node B buffers the encrypted packet in Hive storage without being able to decrypt the payload.
   - When Node B encounters Node C, Node B automatically drains its relay buffer and delivers the packet to C!

---

## 🛠️ Mandatory Stack & Dependencies

- **Flutter 3.22+**
- **nearby_connections FORK**: `https://github.com/mannprerak2/nearby_connections.git`
- **flutter_blue_plus: ^1.34.0** (BLE Proximity & Beacon Scanning)
- **hive: ^2.2.3** & **hive_flutter: ^1.1.0** (Encrypted Offline Storage)
- **encrypt: ^5.0.3** (AES-256 GCM / CBC Cryptography)
- **uuid: ^4.4.0** (Packet & Session Unique IDs)
- **permission_handler: ^11.3.1** (Android 12+ BLE, WiFi-Direct, Audio & Location)
- **record: ^5.1.2** & **audioplayers: ^6.0.0** (Offline Voice Notes)

---

## 🚀 How to Build the Release APK

### 1. Prerequisites
Ensure Flutter 3.22 and Android SDK 34 are installed:
```bash
flutter doctor
```

### 2. Fetch Dependencies
```bash
flutter pub get
```

### 3. Build APK
To produce the standalone production APK:
```bash
flutter build apk --release
```

The APK will be generated at:
`build/app/outputs/flutter-apk/app-release.apk`

To build an Android App Bundle (AAB) for Google Play:
```bash
flutter build appbundle --release
```

---

## 📱 Hardware Permissions Configured
- `BLUETOOTH_SCAN`, `BLUETOOTH_ADVERTISE`, `BLUETOOTH_CONNECT`
- `NEARBY_WIFI_DEVICES`, `ACCESS_FINE_LOCATION`, `CHANGE_WIFI_STATE`
- `RECORD_AUDIO`, `CAMERA`, `READ_MEDIA_AUDIO`, `READ_MEDIA_IMAGES`
- `FOREGROUND_SERVICE` & `FOREGROUND_SERVICE_CONNECTED_DEVICE`
