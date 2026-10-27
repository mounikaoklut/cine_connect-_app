import 'dart:async';
import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/chat_models.dart';
import '../services/chat_websocket_service.dart';
import '../widgets/chat/chat_message_bubble.dart';
import '../widgets/chat/chat_input_bar.dart';
import '../widgets/chat/typing_indicator.dart';

class ChatRoomScreen extends StatefulWidget {
  final String conversationId;
  final Function(String castingId)? onOpenCasting;

  const ChatRoomScreen({
    super.key,
    required this.conversationId,
    this.onOpenCasting,
  });

  @override
  State<ChatRoomScreen> createState() => _ChatRoomScreenState();
}

class _ChatRoomScreenState extends State<ChatRoomScreen> {
  final ChatWebSocketService _chatService = ChatWebSocketService.instance;
  final ScrollController _scrollController = ScrollController();

  StreamSubscription? _msgSub;
  StreamSubscription? _typingSub;
  StreamSubscription? _receiptSub;

  ChatConversation? _conversation;
  bool _isCounterpartTyping = false;

  @override
  void initState() {
    super.initState();
    _loadConversation();

    // Listen to real-time incoming messages
    _msgSub = _chatService.messageStream.listen((msg) {
      if (msg.conversationId == widget.conversationId && mounted) {
        setState(() {
          _isCounterpartTyping = false;
        });
        _markRead();
      }
    });

    // Listen to typing indicators
    _typingSub = _chatService.typingStream.listen((data) {
      if (data['conversation_id'] == widget.conversationId && mounted) {
        setState(() {
          _isCounterpartTyping = data['is_typing'] == true;
        });
      }
    });

    // Listen to receipt updates
    _receiptSub = _chatService.receiptStream.listen((data) {
      if (data['conversation_id'] == widget.conversationId && mounted) {
        setState(() {});
      }
    });

    _markRead();
  }

  void _loadConversation() {
    _conversation = _chatService.getConversationById(widget.conversationId);
  }

  void _markRead() {
    if (_conversation != null && _conversation!.messages.isNotEmpty) {
      final lastMsg = _conversation!.messages.last;
      _chatService.markAsRead(widget.conversationId, lastMsg.id);
    }
  }

  @override
  void dispose() {
    _msgSub?.cancel();
    _typingSub?.cancel();
    _receiptSub?.cancel();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessageText(String text) {
    if (_conversation == null) return;

    final newMsg = ChatMessage(
      id: "msg-${DateTime.now().millisecondsSinceEpoch}",
      conversationId: widget.conversationId,
      senderId: "talent-me",
      senderName: "Me",
      isFromTalent: true,
      content: text,
      type: MessageType.text,
      status: MessageDeliveryStatus.sending,
      timestamp: DateTime.now(),
    );

    setState(() {});
    _chatService.sendMessage(newMsg);
  }

  void _sendVoiceNote(int durationSeconds) {
    if (_conversation == null) return;

    final newMsg = ChatMessage(
      id: "msg-voice-${DateTime.now().millisecondsSinceEpoch}",
      conversationId: widget.conversationId,
      senderId: "talent-me",
      senderName: "Me",
      isFromTalent: true,
      content: "Voice note recorded ($durationSeconds sec)",
      type: MessageType.voice,
      mediaDurationSeconds: durationSeconds,
      mediaUrl: "https://cloudfront.cineconnect.studio/audio/user_voice_${DateTime.now().millisecondsSinceEpoch}.mp3",
      status: MessageDeliveryStatus.sending,
      timestamp: DateTime.now(),
    );

    setState(() {});
    _chatService.sendMessage(newMsg);
  }

  void _sendAttachment(String fileName, String type, String url, String size) {
    if (_conversation == null) return;

    final isPdf = type == 'pdf';
    final isVideo = type == 'video';

    final newMsg = ChatMessage(
      id: "msg-media-${DateTime.now().millisecondsSinceEpoch}",
      conversationId: widget.conversationId,
      senderId: "talent-me",
      senderName: "Me",
      isFromTalent: true,
      content: isPdf ? "Attached Screenplay PDF" : (isVideo ? "Attached Reel Video" : "Attached Image"),
      type: MessageType.media,
      mediaUrl: url,
      mediaThumbnailUrl: url,
      mediaFileName: fileName,
      mediaFileSize: size,
      status: MessageDeliveryStatus.sending,
      timestamp: DateTime.now(),
    );

    setState(() {});
    _chatService.sendMessage(newMsg);
  }

  @override
  Widget build(BuildContext context) {
    if (_conversation == null) {
      return Scaffold(
        backgroundColor: AppTheme.bgPrimary,
        appBar: AppBar(title: const Text("Chat")),
        body: const Center(child: Text("Conversation not found")),
      );
    }

    final p = _conversation!.participant;
    final reversedMessages = _conversation!.messages.reversed.toList();

    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      resizeToAvoidBottomInset: true,
      appBar: _buildAppBar(p),
      body: SafeArea(
        top: false,
        child: Column(
          children: [
            // Project Opportunity Header (if linked)
            if (_conversation!.projectTag != null) _buildProjectOpportunityBanner(),

            // Offline / Mock Echo Banner
            StreamBuilder<ChatConnectionStatus>(
              stream: _chatService.statusStream,
              initialData: _chatService.status,
              builder: (context, snapshot) {
                final status = snapshot.data ?? ChatConnectionStatus.disconnected;
                if (status == ChatConnectionStatus.connected) {
                  return const SizedBox.shrink();
                }
                return Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
                  color: const Color(0xCC1A1408),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.wifi_off_rounded, size: 12, color: AppTheme.accentGold),
                      const SizedBox(width: 6),
                      Text(
                        status == ChatConnectionStatus.connecting || status == ChatConnectionStatus.reconnecting
                            ? "Connecting to WebSocket server..."
                            : "Offline test mode • Mock echo active",
                        style: const TextStyle(color: AppTheme.accentGoldLight, fontSize: 10.5, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                );
              },
            ),

            // Message List View (Reversed for bottom-anchored messaging)
            Expanded(
              child: GestureDetector(
                onTap: () => FocusScope.of(context).unfocus(),
                child: ListView.builder(
                  controller: _scrollController,
                  reverse: true,
                  padding: const EdgeInsets.only(top: 10, bottom: 10),
                  itemCount: reversedMessages.length + (_isCounterpartTyping ? 1 : 0),
                  itemBuilder: (context, index) {
                    if (_isCounterpartTyping && index == 0) {
                      return TypingIndicatorBubble(senderName: p.name);
                    }

                    final actualIndex = _isCounterpartTyping ? index - 1 : index;
                    final msg = reversedMessages[actualIndex];

                    // Check if date separator is needed
                    final bool showDateSeparator = _shouldShowDateSeparator(reversedMessages, actualIndex);

                    return Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (showDateSeparator) _buildDateSeparator(msg.timestamp),
                        ChatMessageBubble(
                          message: msg,
                          onAuditionTap: () {
                            if (msg.auditionCallout != null && widget.onOpenCasting != null) {
                              widget.onOpenCasting!(msg.auditionCallout!.castingId);
                            }
                          },
                        ),
                      ],
                    );
                  },
                ),
              ),
            ),

            // Chat Input Bar
            ChatInputBar(
              onSendText: _sendMessageText,
              onSendVoice: _sendVoiceNote,
              onSendAttachment: _sendAttachment,
              onTypingChanged: (isTyping) {
                _chatService.sendTyping(widget.conversationId, isTyping);
              },
            ),
          ],
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(ChatParticipant p) {
    return AppBar(
      backgroundColor: AppTheme.bgSecondary,
      elevation: 0,
      titleSpacing: 0,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
        onPressed: () => Navigator.pop(context),
      ),
      title: Row(
        children: [
          // Avatar
          Stack(
            children: [
              CircleAvatar(
                radius: 19,
                backgroundColor: AppTheme.bgSurface,
                backgroundImage: NetworkImage(p.avatarUrl),
                onBackgroundImageError: (_, __) {},
              ),
              Positioned(
                bottom: 0,
                right: 0,
                child: Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(
                    color: p.isOnline ? AppTheme.accentEmerald : const Color(0xFF64748B),
                    shape: BoxShape.circle,
                    border: Border.all(color: AppTheme.bgSecondary, width: 2),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(width: 10),

          // Name and presence
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        p.name,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (p.isVerified) ...[
                      const SizedBox(width: 4),
                      const Icon(Icons.verified_rounded, color: AppTheme.accentGold, size: 14),
                    ],
                  ],
                ),
                const SizedBox(height: 1),
                Text(
                  _isCounterpartTyping
                      ? "Typing..."
                      : (p.isOnline ? "Online" : p.lastSeenText),
                  style: TextStyle(
                    color: _isCounterpartTyping
                        ? AppTheme.accentGold
                        : (p.isOnline ? AppTheme.accentEmerald : AppTheme.textMuted),
                    fontSize: 11,
                    fontWeight: _isCounterpartTyping ? FontWeight.w700 : FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      actions: [
        if (_conversation!.associatedCastingId != null)
          IconButton(
            tooltip: "View Application Details",
            icon: const Icon(Icons.assignment_outlined, color: AppTheme.accentGold, size: 22),
            onPressed: () {
              if (widget.onOpenCasting != null) {
                widget.onOpenCasting!(_conversation!.associatedCastingId!);
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text("Linked to ${_conversation!.projectTag ?? "Application"}"),
                    backgroundColor: AppTheme.bgSurface,
                  ),
                );
              }
            },
          ),
        const SizedBox(width: 4),
      ],
    );
  }

  Widget _buildProjectOpportunityBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF131722),
        border: Border(
          bottom: BorderSide(color: AppTheme.accentGold.withOpacity(0.2), width: 1),
        ),
      ),
      child: Row(
        children: [
          const Icon(Icons.movie_filter_rounded, color: AppTheme.accentGold, size: 16),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              _conversation!.projectTag!,
              style: const TextStyle(
                color: AppTheme.accentGoldLight,
                fontSize: 11.5,
                fontWeight: FontWeight.w700,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          if (_conversation!.associatedCastingId != null) ...[
            GestureDetector(
              onTap: () {
                if (widget.onOpenCasting != null) {
                  widget.onOpenCasting!(_conversation!.associatedCastingId!);
                }
              },
              child: const Text(
                "View Opportunity ➔",
                style: TextStyle(
                  color: AppTheme.accentGold,
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  bool _shouldShowDateSeparator(List<ChatMessage> list, int currentIndex) {
    if (currentIndex == list.length - 1) return true;
    final currentMsg = list[currentIndex];
    final nextMsg = list[currentIndex + 1];

    final curDate = DateTime(currentMsg.timestamp.year, currentMsg.timestamp.month, currentMsg.timestamp.day);
    final nextDate = DateTime(nextMsg.timestamp.year, nextMsg.timestamp.month, nextMsg.timestamp.day);

    return curDate.isAfter(nextDate);
  }

  Widget _buildDateSeparator(DateTime dt) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final date = DateTime(dt.year, dt.month, dt.day);

    String label;
    if (date == today) {
      label = "Today";
    } else if (date == today.subtract(const Duration(days: 1))) {
      label = "Yesterday";
    } else {
      label = "${dt.day} ${_monthName(dt.month)} ${dt.year}";
    }

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 12),
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFF1E2433),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppTheme.borderSubtle),
          ),
          child: Text(
            label,
            style: const TextStyle(
              color: AppTheme.textMuted,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }

  String _monthName(int month) {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return months[month - 1];
  }
}
