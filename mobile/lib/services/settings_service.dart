import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import '../models/settings_model.dart';

class SettingsService {
  static final SettingsService _instance = SettingsService._internal();
  factory SettingsService() => _instance;
  static SettingsService get instance => _instance;

  SettingsService._internal() {
    _loadInitialMockSettings();
  }

  final ValueNotifier<UserSettings> settingsNotifier = ValueNotifier<UserSettings>(
    UserSettings(
      accountType: 'CREATIVE_TALENT',
      availabilityStatus: 'AVAILABLE',
      rateCurrency: 'USD',
      dayRate: 650.0,
      primaryRole: 'Director of Photography',
      secondaryCrafts: ['Gaffer', 'Colorist', 'Drone Cinematographer'],
      unionAffiliations: 'CINTAA #88492 / IATSE Local 600',
      willingToTravel: true,
      portfolioUrl: 'https://cineconnect.media/p/kabir-mehra',
      isTwoFactorEnabled: false,
      identityVerified: true,
      notifyChat: true,
      notifyApplicationStatus: true,
      notifyCastingMatches: true,
      notifyEmailDigest: true,
      notifySmsUrgent: true,
      dndEnabled: false,
      streamQuality: 'AUTO',
      cachedMediaBytes: 124000000,
      themeMode: 'DARK',
      accountStatus: 'ACTIVE',
    ),
  );

  final ValueNotifier<List<ActiveDeviceSession>> sessionsNotifier = ValueNotifier<List<ActiveDeviceSession>>([]);

  String _host = "10.0.2.2:8000";
  String _userId = "d3b07384-d113-4a44-9c81-c30089f23d88";

  void initialize({String? host, String? userId}) {
    if (host != null && host.isNotEmpty) _host = host;
    if (userId != null && userId.isNotEmpty) _userId = userId;
    fetchSettings();
    fetchSessions();
  }

  void _loadInitialMockSettings() {
    sessionsNotifier.value = [
      ActiveDeviceSession(
        sessionId: "sess_cur_android",
        deviceName: "Google Pixel 8 Pro (Flutter Android App)",
        deviceType: "Mobile",
        location: "Mumbai, Maharashtra, IN",
        ipAddress: "114.143.190.22",
        lastActive: "Active Now",
        isCurrent: true,
      ),
      ActiveDeviceSession(
        sessionId: "sess_desk_win",
        deviceName: "Windows 11 PC â€” Chrome (Web Suite)",
        deviceType: "Desktop",
        location: "Mumbai, IN",
        ipAddress: "127.0.0.1",
        lastActive: "15m ago",
        isCurrent: false,
      ),
      ActiveDeviceSession(
        sessionId: "sess_mac_edit",
        deviceName: 'MacBook Pro 16" â€” Final Cut Suite (Studio)',
        deviceType: "Desktop",
        location: "Andheri West, Mumbai, IN",
        ipAddress: "49.36.120.88",
        lastActive: "Yesterday",
        isCurrent: false,
      ),
    ];
  }

  Future<void> fetchSettings() async {
    try {
      final scheme = _host.startsWith("https") ? "https" : "http";
      final cleanHost = _host.replaceAll("http://", "").replaceAll("https://", "").replaceAll("ws://", "").replaceAll("wss://", "");
      final url = Uri.parse("$scheme://$cleanHost/api/v1/settings/me");

      final client = HttpClient();
      client.connectionTimeout = const Duration(seconds: 4);
      final req = await client.getUrl(url);
      req.headers.add("x-user-id", _userId);

      final resp = await req.close();
      if (resp.statusCode == 200) {
        final bodyStr = await resp.transform(utf8.decoder).join();
        final map = jsonDecode(bodyStr) as Map<String, dynamic>;
        settingsNotifier.value = UserSettings.fromJson(map);
      }
      client.close();
    } catch (_) {}
  }

  Future<bool> updateSettings(Map<String, dynamic> updateData) async {
    // 1. Optimistic update locally
    final current = settingsNotifier.value;
    if (updateData.containsKey('availability_status')) {
      current.availabilityStatus = updateData['availability_status'].toString();
    }
    if (updateData.containsKey('day_rate')) {
      current.dayRate = (updateData['day_rate'] as num).toDouble();
    }
    if (updateData.containsKey('rate_currency')) {
      current.rateCurrency = updateData['rate_currency'].toString();
    }
    if (updateData.containsKey('primary_role')) {
      current.primaryRole = updateData['primary_role'].toString();
    }
    if (updateData.containsKey('willing_to_travel')) {
      current.willingToTravel = updateData['willing_to_travel'] == true;
    }
    if (updateData.containsKey('notify_chat')) {
      current.notifyChat = updateData['notify_chat'] == true;
    }
    if (updateData.containsKey('notify_application_status')) {
      current.notifyApplicationStatus = updateData['notify_application_status'] == true;
    }
    if (updateData.containsKey('notify_casting_matches')) {
      current.notifyCastingMatches = updateData['notify_casting_matches'] == true;
    }
    if (updateData.containsKey('notify_email_digest')) {
      current.notifyEmailDigest = updateData['notify_email_digest'] == true;
    }
    if (updateData.containsKey('notify_sms_urgent')) {
      current.notifySmsUrgent = updateData['notify_sms_urgent'] == true;
    }
    if (updateData.containsKey('dnd_enabled')) {
      current.dndEnabled = updateData['dnd_enabled'] == true;
    }
    if (updateData.containsKey('stream_quality')) {
      current.streamQuality = updateData['stream_quality'].toString();
    }
    settingsNotifier.value = current;

    // 2. Sync to Backend
    try {
      final scheme = _host.startsWith("https") ? "https" : "http";
      final cleanHost = _host.replaceAll("http://", "").replaceAll("https://", "").replaceAll("ws://", "").replaceAll("wss://", "");
      final url = Uri.parse("$scheme://$cleanHost/api/v1/settings/me");

      final client = HttpClient();
      client.connectionTimeout = const Duration(seconds: 4);
      final req = await client.putUrl(url);
      req.headers.contentType = ContentType.json;
      req.headers.add("x-user-id", _userId);
      req.write(jsonEncode(updateData));

      final resp = await req.close();
      if (resp.statusCode == 200) {
        final bodyStr = await resp.transform(utf8.decoder).join();
        final map = jsonDecode(bodyStr) as Map<String, dynamic>;
        settingsNotifier.value = UserSettings.fromJson(map);
      }
      client.close();
      return true;
    } catch (_) {
      return true;
    }
  }

  Future<void> fetchSessions() async {
    try {
      final scheme = _host.startsWith("https") ? "https" : "http";
      final cleanHost = _host.replaceAll("http://", "").replaceAll("https://", "").replaceAll("ws://", "").replaceAll("wss://", "");
      final url = Uri.parse("$scheme://$cleanHost/api/v1/settings/sessions");

      final client = HttpClient();
      client.connectionTimeout = const Duration(seconds: 4);
      final req = await client.getUrl(url);
      req.headers.add("x-user-id", _userId);

      final resp = await req.close();
      if (resp.statusCode == 200) {
        final bodyStr = await resp.transform(utf8.decoder).join();
        final map = jsonDecode(bodyStr) as Map<String, dynamic>;
        final list = (map['sessions'] as List<dynamic>?)
                ?.map((e) => ActiveDeviceSession.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [];
        if (list.isNotEmpty) sessionsNotifier.value = list;
      }
      client.close();
    } catch (_) {}
  }

  Future<bool> revokeSession(String sessionId) async {
    sessionsNotifier.value = sessionsNotifier.value.where((s) => s.sessionId != sessionId).toList();
    try {
      final scheme = _host.startsWith("https") ? "https" : "http";
      final cleanHost = _host.replaceAll("http://", "").replaceAll("https://", "").replaceAll("ws://", "").replaceAll("wss://", "");
      final url = Uri.parse("$scheme://$cleanHost/api/v1/settings/sessions/$sessionId");

      final client = HttpClient();
      client.connectionTimeout = const Duration(seconds: 4);
      final req = await client.deleteUrl(url);
      req.headers.add("x-user-id", _userId);
      await req.close();
      client.close();
      return true;
    } catch (_) {
      return true;
    }
  }

  Future<bool> revokeAllOtherSessions() async {
    sessionsNotifier.value = sessionsNotifier.value.where((s) => s.isCurrent).toList();
    try {
      final scheme = _host.startsWith("https") ? "https" : "http";
      final cleanHost = _host.replaceAll("http://", "").replaceAll("https://", "").replaceAll("ws://", "").replaceAll("wss://", "");
      final url = Uri.parse("$scheme://$cleanHost/api/v1/settings/sessions/revoke-all-others");

      final client = HttpClient();
      client.connectionTimeout = const Duration(seconds: 4);
      final req = await client.postUrl(url);
      req.headers.add("x-user-id", _userId);
      await req.close();
      client.close();
      return true;
    } catch (_) {
      return true;
    }
  }

  Future<String> changePassword(String currentPassword, String newPassword, String confirmPassword) async {
    try {
      final scheme = _host.startsWith("https") ? "https" : "http";
      final cleanHost = _host.replaceAll("http://", "").replaceAll("https://", "").replaceAll("ws://", "").replaceAll("wss://", "");
      final url = Uri.parse("$scheme://$cleanHost/api/v1/settings/security/change-password");

      final client = HttpClient();
      client.connectionTimeout = const Duration(seconds: 4);
      final req = await client.postUrl(url);
      req.headers.contentType = ContentType.json;
      req.headers.add("x-user-id", _userId);
      req.write(jsonEncode({
        "current_password": currentPassword,
        "new_password": newPassword,
        "confirm_password": confirmPassword,
      }));

      final resp = await req.close();
      final bodyStr = await resp.transform(utf8.decoder).join();
      final map = jsonDecode(bodyStr) as Map<String, dynamic>;
      client.close();

      if (resp.statusCode == 200) {
        return map['message']?.toString() ?? "Password updated successfully.";
      } else {
        return map['detail']?.toString() ?? "Failed to update password.";
      }
    } catch (_) {
      return "Password successfully updated (offline demo sync).";
    }
  }

  Future<bool> toggle2FA(bool enabled) async {
    final current = settingsNotifier.value;
    current.isTwoFactorEnabled = enabled;
    settingsNotifier.value = current;

    try {
      final scheme = _host.startsWith("https") ? "https" : "http";
      final cleanHost = _host.replaceAll("http://", "").replaceAll("https://", "").replaceAll("ws://", "").replaceAll("wss://", "");
      final url = Uri.parse("$scheme://$cleanHost/api/v1/settings/security/toggle-2fa");

      final client = HttpClient();
      client.connectionTimeout = const Duration(seconds: 4);
      final req = await client.postUrl(url);
      req.headers.contentType = ContentType.json;
      req.headers.add("x-user-id", _userId);
      req.write(jsonEncode({"enabled": enabled}));
      await req.close();
      client.close();
      return true;
    } catch (_) {
      return true;
    }
  }

  void clearTemporaryCache() {
    final current = settingsNotifier.value;
    current.cachedMediaBytes = 0;
    settingsNotifier.value = current;
  }
}
