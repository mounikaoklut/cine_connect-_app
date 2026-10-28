import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import '../models/notification_model.dart';

class NotificationService with WidgetsBindingObserver {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  static NotificationService get instance => _instance;

  NotificationService._internal() {
    _loadInitialMockNotifications();
    WidgetsBinding.instance.addObserver(this);
  }

  // Reactive state notifiers
  final ValueNotifier<int> unreadCountNotifier = ValueNotifier<int>(0);
  final ValueNotifier<List<AppNotification>> notificationsNotifier = ValueNotifier<List<AppNotification>>([]);
  final ValueNotifier<bool> isConnectedNotifier = ValueNotifier<bool>(false);

  // Deep linking callback & stream
  final StreamController<String> _deepLinkController = StreamController<String>.broadcast();
  Stream<String> get deepLinkStream => _deepLinkController.stream;

  // New notification banner event stream
  final StreamController<AppNotification> _incomingNotificationController = StreamController<AppNotification>.broadcast();
  Stream<AppNotification> get incomingNotificationStream => _incomingNotificationController.stream;

  // Configuration
  String _host = "10.0.2.2:8000"; // Android emulator default to localhost
  String _userId = "00000000-0000-0000-0000-000000000001";
  String? _fcmToken;

  WebSocket? _webSocket;
  Timer? _reconnectTimer;
  Timer? _heartbeatTimer;
  int _reconnectAttempts = 0;
  bool _isConnecting = false;

  void initialize({String? host, String? userId, String? fcmToken}) {
    if (host != null && host.isNotEmpty) _host = host;
    if (userId != null && userId.isNotEmpty) _userId = userId;
    if (fcmToken != null) {
      _fcmToken = fcmToken;
      registerDeviceToken(fcmToken, "ANDROID");
    }

    connect();
    fetchNotifications();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      // Refresh notifications and ensure websocket is active
      fetchNotifications();
      if (!isConnectedNotifier.value) {
        connect();
      }
    }
  }

  Future<void> connect() async {
    if (_isConnecting || isConnectedNotifier.value) return;
    _isConnecting = true;

    _reconnectTimer?.cancel();
    final wsScheme = _host.startsWith("https") || _host.startsWith("wss") ? "wss" : "ws";
    final cleanHost = _host.replaceAll("http://", "").replaceAll("https://", "").replaceAll("ws://", "").replaceAll("wss://", "");
    final urlString = "$wsScheme://$cleanHost/ws/notifications/$_userId";

    try {
      final ws = await WebSocket.connect(urlString).timeout(const Duration(seconds: 4));
      _webSocket = ws;
      _reconnectAttempts = 0;
      _isConnecting = false;
      isConnectedNotifier.value = true;

      _webSocket!.listen(
        _onSocketMessage,
        onError: (err) => _handleDisconnect(),
        onDone: () => _handleDisconnect(),
        cancelOnError: true,
      );

      _startHeartbeat();
    } catch (e) {
      _handleDisconnect();
    } finally {
      _isConnecting = false;
    }
  }

  void _startHeartbeat() {
    _heartbeatTimer?.cancel();
    _heartbeatTimer = Timer.periodic(const Duration(seconds: 25), (timer) {
      if (_webSocket != null && _webSocket!.readyState == WebSocket.open) {
        try {
          _webSocket!.add(jsonEncode({"type": "ping"}));
        } catch (_) {}
      }
    });
  }

  void _handleDisconnect() {
    _webSocket = null;
    _heartbeatTimer?.cancel();
    isConnectedNotifier.value = false;
    _isConnecting = false;

    // Exponential backoff reconnect
    _reconnectAttempts++;
    final delaySeconds = (_reconnectAttempts < 5) ? (2 * _reconnectAttempts) : 20;
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(Duration(seconds: delaySeconds), () {
      connect();
    });
  }

  void _onSocketMessage(dynamic rawData) {
    try {
      final data = jsonDecode(rawData.toString());
      if (data is! Map<String, dynamic>) return;

      final type = data['type']?.toString();

      if (type == 'NEW_NOTIFICATION') {
        final notifData = data['notification'];
        if (notifData is Map<String, dynamic>) {
          final newNotification = AppNotification.fromJson(notifData);
          final currentList = List<AppNotification>.from(notificationsNotifier.value);
          // Prepend new item
          currentList.removeWhere((item) => item.id == newNotification.id);
          currentList.insert(0, newNotification);
          notificationsNotifier.value = currentList;
          unreadCountNotifier.value = unreadCountNotifier.value + 1;

          _incomingNotificationController.add(newNotification);
          try {
            HapticFeedback.mediumImpact();
          } catch (_) {}
        }
      } else if (type == 'UNREAD_COUNT') {
        final count = data['unread_count'];
        if (count is num) {
          unreadCountNotifier.value = count.toInt();
        }
      } else if (type == 'STATUS_UPDATE') {
        final notifData = data['notification'];
        if (notifData is Map<String, dynamic>) {
          final updatedNotif = AppNotification.fromJson(notifData);
          final currentList = List<AppNotification>.from(notificationsNotifier.value);
          currentList.removeWhere((item) => item.id == updatedNotif.id);
          currentList.insert(0, updatedNotif);
          notificationsNotifier.value = currentList;
          unreadCountNotifier.value = (data['unread_count'] as num?)?.toInt() ?? (unreadCountNotifier.value + 1);

          _incomingNotificationController.add(updatedNotif);
          try {
            HapticFeedback.heavyImpact();
          } catch (_) {}
        }
      }
    } catch (e) {
      debugPrint("NotificationService: Error parsing socket message: $e");
    }
  }

  // REST API Methods (Using native HttpClient for zero external dependency bloat)
  Future<void> fetchNotifications({String filter = 'all'}) async {
    try {
      final scheme = _host.startsWith("https") ? "https" : "http";
      final cleanHost = _host.replaceAll("http://", "").replaceAll("https://", "").replaceAll("ws://", "").replaceAll("wss://", "");
      final url = Uri.parse("$scheme://$cleanHost/api/v1/notifications?filter_type=$filter&limit=40");

      final client = HttpClient();
      client.connectionTimeout = const Duration(seconds: 4);
      final request = await client.getUrl(url);
      request.headers.add("x-user-id", _userId);

      final response = await request.close();
      if (response.statusCode == 200) {
        final responseBody = await response.transform(utf8.decoder).join();
        final jsonMap = jsonDecode(responseBody) as Map<String, dynamic>;
        final items = jsonMap['items'] as List<dynamic>? ?? [];
        final unread = jsonMap['unread_count'] as num? ?? 0;

        final parsedList = items.map((i) => AppNotification.fromJson(i as Map<String, dynamic>)).toList();
        notificationsNotifier.value = parsedList;
        unreadCountNotifier.value = unread.toInt();
      }
      client.close();
    } catch (e) {
      // Silent catch - falls back to current local state
    }
  }

  Future<void> markAsRead(String notificationId) async {
    // 1. Optimistic update
    final currentList = List<AppNotification>.from(notificationsNotifier.value);
    final index = currentList.indexWhere((n) => n.id == notificationId);
    if (index != -1 && !currentList[index].isRead) {
      currentList[index].isRead = true;
      notificationsNotifier.value = currentList;
      if (unreadCountNotifier.value > 0) {
        unreadCountNotifier.value = unreadCountNotifier.value - 1;
      }
    }

    // 2. Network sync
    try {
      final scheme = _host.startsWith("https") ? "https" : "http";
      final cleanHost = _host.replaceAll("http://", "").replaceAll("https://", "").replaceAll("ws://", "").replaceAll("wss://", "");
      final url = Uri.parse("$scheme://$cleanHost/api/v1/notifications/$notificationId/read");

      final client = HttpClient();
      client.connectionTimeout = const Duration(seconds: 3);
      final request = await client.patchUrl(url);
      request.headers.add("x-user-id", _userId);
      await request.close();
      client.close();
    } catch (_) {}
  }

  Future<void> markAllAsRead() async {
    // 1. Optimistic update
    final currentList = notificationsNotifier.value.map((n) {
      n.isRead = true;
      return n;
    }).toList();
    notificationsNotifier.value = currentList;
    unreadCountNotifier.value = 0;

    // 2. Network sync
    try {
      final scheme = _host.startsWith("https") ? "https" : "http";
      final cleanHost = _host.replaceAll("http://", "").replaceAll("https://", "").replaceAll("ws://", "").replaceAll("wss://", "");
      final url = Uri.parse("$scheme://$cleanHost/api/v1/notifications/mark-all-read");

      final client = HttpClient();
      client.connectionTimeout = const Duration(seconds: 3);
      final request = await client.postUrl(url);
      request.headers.add("x-user-id", _userId);
      await request.close();
      client.close();
    } catch (_) {}
  }

  Future<void> registerDeviceToken(String token, String deviceType) async {
    try {
      final scheme = _host.startsWith("https") ? "https" : "http";
      final cleanHost = _host.replaceAll("http://", "").replaceAll("https://", "").replaceAll("ws://", "").replaceAll("wss://", "");
      final url = Uri.parse("$scheme://$cleanHost/api/v1/notifications/device-token");

      final client = HttpClient();
      client.connectionTimeout = const Duration(seconds: 4);
      final request = await client.postUrl(url);
      request.headers.contentType = ContentType.json;
      request.headers.add("x-user-id", _userId);
      request.write(jsonEncode({"token": token, "device_type": deviceType}));
      await request.close();
      client.close();
    } catch (_) {}
  }

  /// Trigger a live status change event on the backend
  Future<bool> triggerTestStatusUpdate({
    required String status,
    required String projectTitle,
    required String roleName,
    required String productionHouse,
  }) async {
    try {
      final scheme = _host.startsWith("https") ? "https" : "http";
      final cleanHost = _host.replaceAll("http://", "").replaceAll("https://", "").replaceAll("ws://", "").replaceAll("wss://", "");
      final url = Uri.parse("$scheme://$cleanHost/api/v1/notifications/trigger-status-update");

      final client = HttpClient();
      client.connectionTimeout = const Duration(seconds: 5);
      final request = await client.postUrl(url);
      request.headers.contentType = ContentType.json;
      request.write(jsonEncode({
        "user_id": _userId,
        "application_id": "app-${DateTime.now().millisecondsSinceEpoch}",
        "status": status,
        "project_title": projectTitle,
        "role_name": roleName,
        "production_house": productionHouse,
        "director_note": status == "SELECTED"
            ? "Congratulations! The director loved your reel. Onboarding starts next Monday."
            : status == "UNDER_REVIEW"
                ? "Your audition tape has passed round 1 screening and is with the lead casting director."
                : "Thank you for auditioning. Profile kept on active file for future roles.",
      }));
      final response = await request.close();
      client.close();
      return response.statusCode == 200;
    } catch (e) {
      // Local injection fallback if backend is offline
      _injectLocalMockStatusUpdate(status, projectTitle, roleName, productionHouse);
      return true;
    }
  }

  void _injectLocalMockStatusUpdate(String status, String projectTitle, String roleName, String productionHouse) {
    String title = "";
    String body = "";
    switch (status) {
      case "SELECTED":
        title = "🎉 Congratulations! You have been Selected!";
        body = "$productionHouse has confirmed your selection for '$roleName' in '$projectTitle'.";
        break;
      case "UNDER_REVIEW":
        title = "⏳ Audition Under Review";
        body = "Your audition for '$roleName' in '$projectTitle' is being reviewed by the director.";
        break;
      case "NOT_SELECTED":
        title = "Application Update";
        body = "Thank you for auditioning for '$roleName' in '$projectTitle'. Profile archived for upcoming roles.";
        break;
    }

    final newNotif = AppNotification(
      id: "sim-${DateTime.now().millisecondsSinceEpoch}",
      userId: _userId,
      title: title,
      body: body,
      notificationType: NotificationType.APPLICATION_STATUS,
      deepLinkRoute: "/opportunities/applications/app-${DateTime.now().millisecondsSinceEpoch}",
      metadataJson: {
        "status": status,
        "project_title": projectTitle,
        "role_name": roleName,
        "production_house": productionHouse,
        "director_note": status == "SELECTED" ? "Rehearsals begin Nov 10th at Film City." : null,
      },
      isRead: false,
      createdAt: DateTime.now(),
    );

    final currentList = List<AppNotification>.from(notificationsNotifier.value);
    currentList.insert(0, newNotif);
    notificationsNotifier.value = currentList;
    unreadCountNotifier.value = unreadCountNotifier.value + 1;
    _incomingNotificationController.add(newNotif);
  }

  void handleDeepLink(String route) {
    _deepLinkController.add(route);
  }

  void _loadInitialMockNotifications() {
    final now = DateTime.now();
    final mockList = [
      AppNotification(
        id: "notif-1",
        userId: _userId,
        title: "🎉 Congratulations! Selected for 'Echoes of the Stage'",
        body: "Dharma Productions has finalized their casting decision. You have been selected for the role of Lead Actor (Kabir).",
        notificationType: NotificationType.APPLICATION_STATUS,
        deepLinkRoute: "/opportunities/applications/app-dharma-01",
        metadataJson: {
          "status": "SELECTED",
          "project_title": "Echoes of the Stage",
          "role_name": "Lead Actor (Kabir)",
          "production_house": "Dharma Productions",
          "director_note": "Your intense emotional range during the monologue was phenomenal. Production call is on Monday.",
          "next_step": "Sign contract & schedule wardrobe test",
        },
        isRead: false,
        createdAt: now.subtract(const Duration(minutes: 12)),
      ),
      AppNotification(
        id: "notif-2",
        userId: _userId,
        title: "⏳ Screen Test Under Review",
        body: "Excel Entertainment casting associate reviewed your self-tape for 'Mirzapur: The Movie'.",
        notificationType: NotificationType.APPLICATION_STATUS,
        deepLinkRoute: "/opportunities/applications/app-excel-02",
        metadataJson: {
          "status": "UNDER_REVIEW",
          "project_title": "Mirzapur: The Movie",
          "role_name": "Supporting Antagonist (Munna's Cousin)",
          "production_house": "Excel Entertainment",
          "progress_stage": "Director Review (Round 2)",
        },
        isRead: false,
        createdAt: now.subtract(const Duration(hours: 2)),
      ),
      AppNotification(
        id: "notif-3",
        userId: _userId,
        title: "📅 Callback Interview Scheduled",
        body: "Yash Raj Films has invited you to an in-person screen test on Oct 25th at 3:00 PM.",
        notificationType: NotificationType.INTERVIEW_SCHEDULE,
        deepLinkRoute: "/opportunities/applications/app-yrf-03",
        metadataJson: {
          "interview_date": "Oct 25, 2026",
          "interview_time": "3:00 PM IST",
          "location": "YRF Studios, Studio 3, Andheri West",
        },
        isRead: false,
        createdAt: now.subtract(const Duration(hours: 5)),
      ),
      AppNotification(
        id: "notif-4",
        userId: _userId,
        title: "Application Update: Red Chillies VFX",
        body: "Thank you for auditioning for 'The Lost Realm'. While another candidate was chosen, your reel is saved in our database.",
        notificationType: NotificationType.APPLICATION_STATUS,
        deepLinkRoute: "/opportunities/applications/app-rc-04",
        metadataJson: {
          "status": "NOT_SELECTED",
          "project_title": "The Lost Realm",
          "role_name": "Lead Voice Artist",
          "production_house": "Red Chillies Entertainment",
        },
        isRead: true,
        createdAt: now.subtract(const Duration(days: 1, hours: 3)),
      ),
      AppNotification(
        id: "notif-5",
        userId: _userId,
        title: "💬 New Direct Message",
        body: "Rohit Shetty Picturez: 'Hi Kabir, loved your monologue. Are you available for stunts training in November?'",
        notificationType: NotificationType.DIRECT_MESSAGE,
        deepLinkRoute: "/messages/thread-rohit-01",
        metadataJson: {
          "sender_name": "Rohit Shetty Picturez",
        },
        isRead: true,
        createdAt: now.subtract(const Duration(days: 2)),
      ),
    ];

    notificationsNotifier.value = mockList;
    unreadCountNotifier.value = mockList.where((n) => !n.isRead).length;
  }

  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _webSocket?.close();
    _reconnectTimer?.cancel();
    _heartbeatTimer?.cancel();
    _deepLinkController.close();
    _incomingNotificationController.close();
  }
}
