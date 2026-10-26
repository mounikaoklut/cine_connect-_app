import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math';
import '../models/chat_models.dart';

enum ChatConnectionStatus {
  disconnected,
  connecting,
  connected,
  reconnecting,
}

class ChatWebSocketService {
  static final ChatWebSocketService _instance = ChatWebSocketService._internal();
  factory ChatWebSocketService() => _instance;
  static ChatWebSocketService get instance => _instance;

  ChatWebSocketService._internal() {
    _conversations = MockChatData.initialConversations;
  }

  WebSocket? _webSocket;
  Timer? _reconnectTimer;
  Timer? _heartbeatTimer;
  int _reconnectAttempts = 0;
  static const int _maxReconnectBackoffSeconds = 16;

  ChatConnectionStatus _status = ChatConnectionStatus.disconnected;
  ChatConnectionStatus get status => _status;
  bool get isConnected => _status == ChatConnectionStatus.connected;
  bool get isOffline => _status != ChatConnectionStatus.connected;

  String _host = "10.0.2.2:8000"; // Android emulator host to local FastAPI, or localhost
  String? _authToken;

  // Stream controllers
  final _statusController = StreamController<ChatConnectionStatus>.broadcast();
  final _messageController = StreamController<ChatMessage>.broadcast();
  final _typingController = StreamController<Map<String, dynamic>>.broadcast();
  final _receiptController = StreamController<Map<String, dynamic>>.broadcast();

  Stream<ChatConnectionStatus> get statusStream => _statusController.stream;
  Stream<ChatMessage> get messageStream => _messageController.stream;
  Stream<Map<String, dynamic>> get typingStream => _typingController.stream;
  Stream<Map<String, dynamic>> get receiptStream => _receiptController.stream;

  // Local structured in-memory cache
  late List<ChatConversation> _conversations;
  List<ChatConversation> get conversations => List.unmodifiable(_conversations);

  void initialize({String? host, String? token}) {
    if (host != null && host.isNotEmpty) _host = host;
    if (token != null) _authToken = token;
    connect();
  }

  Future<void> connect() async {
    if (_status == ChatConnectionStatus.connected || _status == ChatConnectionStatus.connecting) {
      return;
    }

    _setStatus(_reconnectAttempts > 0 ? ChatConnectionStatus.reconnecting : ChatConnectionStatus.connecting);

    final wsScheme = _host.startsWith("https") || _host.startsWith("wss") ? "wss" : "ws";
    final cleanHost = _host.replaceAll("http://", "").replaceAll("https://", "").replaceAll("ws://", "").replaceAll("wss://", "");
    final urlString = "$wsScheme://$cleanHost/api/v1/ws/chat${_authToken != null ? '?token=$_authToken' : ''}";

    try {
      final uri = Uri.parse(urlString);
      final ws = await WebSocket.connect(
        uri.toString(),
      ).timeout(const Duration(seconds: 4));

      _webSocket = ws;
      _reconnectAttempts = 0;
      _setStatus(ChatConnectionStatus.connected);

      _webSocket!.listen(
        _onMessageReceived,
        onError: (error) {
          _handleDisconnect();
        },
        onDone: () {
          _handleDisconnect();
        },
        cancelOnError: true,
      );

      _startHeartbeat();
    } catch (e) {
      // Backend is unavailable - fallback to offline mock mode
      _handleDisconnect();
    }
  }

  void _setStatus(ChatConnectionStatus newStatus) {
    if (_status != newStatus) {
      _status = newStatus;
      _statusController.add(_status);
    }
  }

  void _onMessageReceived(dynamic data) {
    try {
      final Map<String, dynamic> payload = jsonDecode(data as String);
      final event = payload['event'] ?? payload['action'];

      switch (event) {
        case 'new_message':
          if (payload['message'] != null) {
            final msg = ChatMessage.fromMap(payload['message']);
            _insertMessageIntoCache(msg);
            _messageController.add(msg);
          }
          break;

        case 'typing':
        case 'typing_indicator':
          _typingController.add({
            'conversation_id': payload['conversation_id'],
            'is_typing': payload['is_typing'] == true,
            'user_id': payload['user_id'],
          });
          break;

        case 'mark_read':
        case 'receipt_update':
          _receiptController.add({
            'conversation_id': payload['conversation_id'],
            'message_id': payload['message_id'],
            'status': payload['status'] ?? 'read',
          });
          _updateMessageStatusInCache(
            payload['conversation_id'],
            payload['message_id'],
            MessageDeliveryStatus.read,
          );
          break;

        case 'pong':
          // Heartbeat acknowledged
          break;
      }
    } catch (_) {}
  }

  void _handleDisconnect() {
    _webSocket = null;
    _heartbeatTimer?.cancel();
    _setStatus(ChatConnectionStatus.disconnected);
    _scheduleReconnect();
  }

  void _scheduleReconnect() {
    _reconnectTimer?.cancel();
    final delaySeconds = min(pow(2, _reconnectAttempts).toInt(), _maxReconnectBackoffSeconds);
    _reconnectAttempts++;

    _reconnectTimer = Timer(Duration(seconds: delaySeconds), () {
      connect();
    });
  }

  void _startHeartbeat() {
    _heartbeatTimer?.cancel();
    _heartbeatTimer = Timer.periodic(const Duration(seconds: 30), (timer) {
      if (_webSocket != null && _status == ChatConnectionStatus.connected) {
        try {
          _webSocket!.add(jsonEncode({'action': 'ping', 'timestamp': DateTime.now().toIso8601String()}));
        } catch (_) {
          _handleDisconnect();
        }
      }
    });
  }

  // Send message API
  Future<void> sendMessage(ChatMessage message) async {
    // 1. Immediately store in local cache with 'sending' status
    _insertMessageIntoCache(message);

    final payload = {
      'action': 'send_message',
      'conversation_id': message.conversationId,
      'content': message.content,
      'type': message.type.name,
      'media_url': message.mediaUrl,
      'media_thumbnail_url': message.mediaThumbnailUrl,
      'media_duration_seconds': message.mediaDurationSeconds,
      'media_file_name': message.mediaFileName,
      'media_file_size': message.mediaFileSize,
    };

    if (isConnected && _webSocket != null) {
      try {
        _webSocket!.add(jsonEncode(payload));
        // Transition to sent
        _updateMessageStatusInCache(message.conversationId, message.id, MessageDeliveryStatus.sent);
        return;
      } catch (_) {
        // Socket error, fallback to offline simulation
      }
    }

    // Offline / Mock Echo Mode Fallback:
    _simulateOfflineEcho(message);
  }

  void sendTyping(String conversationId, bool isTyping) {
    if (isConnected && _webSocket != null) {
      try {
        _webSocket!.add(jsonEncode({
          'action': 'typing',
          'conversation_id': conversationId,
          'is_typing': isTyping,
        }));
      } catch (_) {}
    }
  }

  void markAsRead(String conversationId, String messageId) {
    _updateMessageStatusInCache(conversationId, messageId, MessageDeliveryStatus.read);

    // Reset unread counter for conversation
    final convIndex = _conversations.indexWhere((c) => c.id == conversationId);
    if (convIndex != -1) {
      _conversations[convIndex].unreadCount = 0;
    }

    if (isConnected && _webSocket != null) {
      try {
        _webSocket!.add(jsonEncode({
          'action': 'mark_read',
          'conversation_id': conversationId,
          'message_id': messageId,
        }));
      } catch (_) {}
    }
  }

  // Offline Mock Echo Handler
  void _simulateOfflineEcho(ChatMessage outgoing) {
    final conv = getConversationById(outgoing.conversationId);
    final participantName = conv?.participant.name ?? "Production Team";
    final isProd = conv?.type == ConversationType.production;

    // Step 1: 300ms -> Mark as sent
    Timer(const Duration(milliseconds: 300), () {
      _updateMessageStatusInCache(outgoing.conversationId, outgoing.id, MessageDeliveryStatus.sent);
    });

    // Step 2: 700ms -> Mark as delivered
    Timer(const Duration(milliseconds: 700), () {
      _updateMessageStatusInCache(outgoing.conversationId, outgoing.id, MessageDeliveryStatus.delivered);
    });

    // Step 3: 1200ms -> Counterpart starts typing
    Timer(const Duration(milliseconds: 1200), () {
      _typingController.add({
        'conversation_id': outgoing.conversationId,
        'is_typing': true,
        'user_id': conv?.participant.id ?? 'echo_bot',
      });
      if (conv != null) {
        conv.isTyping = true;
      }
    });

    // Step 4: 2500ms -> Counterpart sends simulated reply & marks outgoing as read
    Timer(const Duration(milliseconds: 2500), () {
      // Stop typing
      _typingController.add({
        'conversation_id': outgoing.conversationId,
        'is_typing': false,
        'user_id': conv?.participant.id ?? 'echo_bot',
      });
      if (conv != null) {
        conv.isTyping = false;
      }

      // Mark user message as read (gold double checkmark)
      _updateMessageStatusInCache(outgoing.conversationId, outgoing.id, MessageDeliveryStatus.read);

      // Generate contextual mock echo reply
      String replyText;
      if (isProd) {
        if (outgoing.type == MessageType.voice) {
          replyText = "[Simulated Production Echo]\nReceived your voice note! The director will review this articulation for the character callback.";
        } else if (outgoing.type == MessageType.media) {
          replyText = "[Simulated Production Echo]\nAttachment downloaded and added to your audition dossier. Our technical supervisor will inspect the lookbook.";
        } else {
          replyText = "[Simulated Production Echo]\nThank you for confirming. Our casting desk has logged this update for '${conv?.roleTag ?? "this role"}'. We will reach out with the call sheet.";
        }
      } else {
        if (outgoing.type == MessageType.voice) {
          replyText = "[Simulated Talent Echo]\nGot your audio message! Sounds great, let's lock in the schedule for our test shoot.";
        } else {
          replyText = "[Simulated Talent Echo]\nThanks for the message! Let's definitely coordinate on this. I'll check my availability and follow up.";
        }
      }

      final incomingReply = ChatMessage(
        id: "echo-${DateTime.now().millisecondsSinceEpoch}",
        conversationId: outgoing.conversationId,
        senderId: conv?.participant.id ?? "echo-bot",
        senderName: participantName,
        senderAvatar: conv?.participant.avatarUrl,
        isFromTalent: false,
        content: replyText,
        type: MessageType.text,
        status: MessageDeliveryStatus.delivered,
        timestamp: DateTime.now(),
      );

      _insertMessageIntoCache(incomingReply);
      _messageController.add(incomingReply);
    });
  }

  // Cache helpers
  ChatConversation? getConversationById(String conversationId) {
    try {
      return _conversations.firstWhere((c) => c.id == conversationId);
    } catch (_) {
      return null;
    }
  }

  void _insertMessageIntoCache(ChatMessage msg) {
    final convIndex = _conversations.indexWhere((c) => c.id == msg.conversationId);
    if (convIndex != -1) {
      final conv = _conversations[convIndex];
      // Check if message already exists
      final existingIndex = conv.messages.indexWhere((m) => m.id == msg.id);
      if (existingIndex != -1) {
        conv.messages[existingIndex] = msg;
      } else {
        conv.messages.add(msg);
      }
      conv.lastMessage = msg;
      conv.updatedAt = msg.timestamp;
      if (!msg.isFromTalent) {
        conv.unreadCount += 1;
      }
    }
  }

  void _updateMessageStatusInCache(String conversationId, String messageId, MessageDeliveryStatus status) {
    final conv = getConversationById(conversationId);
    if (conv != null) {
      final msgIndex = conv.messages.indexWhere((m) => m.id == messageId);
      if (msgIndex != -1) {
        final oldMsg = conv.messages[msgIndex];
        conv.messages[msgIndex] = oldMsg.copyWith(status: status);
        if (conv.lastMessage.id == messageId) {
          conv.lastMessage = conv.messages[msgIndex];
        }
        _receiptController.add({
          'conversation_id': conversationId,
          'message_id': messageId,
          'status': status.name,
        });
      }
    }
  }

  // Media Presigned S3 Upload helper
  Future<String> obtainPresignedUrlAndUpload({
    required String fileName,
    required String contentType,
    required List<int> bytes,
    String purpose = "chat_attachment",
  }) async {
    // 1. Try real FastAPI REST endpoint: POST /api/v1/media/upload-url
    try {
      final client = HttpClient();
      final cleanHost = _host.replaceAll("http://", "").replaceAll("https://", "");
      final uri = Uri.parse("http://$cleanHost/api/v1/media/upload-url");
      final request = await client.postUrl(uri);
      request.headers.set('content-type', 'application/json');
      if (_authToken != null) {
        request.headers.set('authorization', 'Bearer $_authToken');
      }
      final body = jsonEncode({
        'filename': fileName,
        'content_type': contentType,
        'purpose': purpose,
      });
      request.write(body);
      final response = await request.close().timeout(const Duration(seconds: 3));

      if (response.statusCode == 200) {
        final respBody = await response.transform(utf8.decoder).join();
        final json = jsonDecode(respBody);
        final uploadUrl = json['upload_url'];
        final publicUrl = json['public_url'];

        // Upload directly to S3 via HTTP PUT
        if (uploadUrl != null) {
          final s3Uri = Uri.parse(uploadUrl);
          final s3Req = await client.putUrl(s3Uri);
          s3Req.headers.set('content-type', contentType);
          s3Req.add(bytes);
          final s3Resp = await s3Req.close();
          if (s3Resp.statusCode >= 200 && s3Resp.statusCode < 300) {
            return publicUrl ?? uploadUrl;
          }
        }
      }
    } catch (_) {}

    // Fallback: Return simulated CloudFront CDN url
    final randomId = Random().nextInt(999999);
    final ext = fileName.split('.').last;
    return "https://cloudfront.cineconnect.studio/uploads/${purpose}_$randomId.$ext";
  }

  void dispose() {
    _reconnectTimer?.cancel();
    _heartbeatTimer?.cancel();
    _webSocket?.close();
    _statusController.close();
    _messageController.close();
    _typingController.close();
    _receiptController.close();
  }
}
