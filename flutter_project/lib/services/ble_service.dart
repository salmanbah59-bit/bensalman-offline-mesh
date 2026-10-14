import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';

class BleService extends ChangeNotifier {
  static const String bensalmanServiceUuid = "0000BEEF-0000-1000-8000-00805F9B34FB";

  bool _isScanning = false;
  final Map<String, int> _deviceRssiMap = {};

  bool get isScanning => _isScanning;
  Map<String, int> get deviceRssiMap => _deviceRssiMap;

  Future<void> startContinuousScan() async {
    try {
      if (await FlutterBluePlus.isSupported == false) {
        debugPrint("[BLE Service] Bluetooth not supported on this hardware");
        return;
      }

      // Check adapter state
      final adapterState = await FlutterBluePlus.adapterState.first;
      if (adapterState != BluetoothAdapterState.on) {
        debugPrint("[BLE Service] Bluetooth adapter is off");
        return;
      }

      FlutterBluePlus.scanResults.listen((results) {
        for (final ScanResult r in results) {
          final id = r.device.remoteId.str;
          _deviceRssiMap[id] = r.rssi;
        }
        notifyListeners();
      });

      await FlutterBluePlus.startScan(
        timeout: const Duration(seconds: 15),
        androidUsesFineLocation: true,
      );
      _isScanning = true;
      notifyListeners();
    } catch (e) {
      debugPrint("[BLE Service] Error starting scan: $e");
    }
  }

  Future<void> stopScan() async {
    try {
      await FlutterBluePlus.stopScan();
      _isScanning = false;
      notifyListeners();
    } catch (_) {}
  }
}
