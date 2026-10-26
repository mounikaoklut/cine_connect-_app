import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/chat_models.dart';
import '../services/chat_websocket_service.dart';
import '../widgets/chat/conversation_tile.dart';
import 'chat_room_screen.dart';

class ChatInboxScreen extends StatefulWidget {
  final Function(String castingId)? onOpenCasting;

  const ChatInboxScreen({
    super.key,
    this.onOpenCasting,
  });

  @override
  State<ChatInboxScreen> createState() => _ChatInboxScreenState();
}

class _ChatInboxScreenState extends State<ChatInboxScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = "";
  bool _isSearchActive = false;

  final ChatWebSocketService _chatService = ChatWebSocketService.instance;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    // Connect to WebSocket service on screen mount
    _chatService.connect();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  List<ChatConversation> _filterConversations(ConversationType type) {
    return _chatService.conversations.where((conv) {
      if (conv.type != type) return false;
      if (_searchQuery.isEmpty) return true;

      final query = _searchQuery.toLowerCase();
      final nameMatches = conv.participant.name.toLowerCase().contains(query);
      final projectMatches = conv.projectTag?.toLowerCase().contains(query) ?? false;
      final roleMatches = conv.roleTag?.toLowerCase().contains(query) ?? false;
      final lastMsgMatches = conv.lastMessage.content.toLowerCase().contains(query);

      return nameMatches || projectMatches || roleMatches || lastMsgMatches;
    }).toList();
  }

  void _openConversation(ChatConversation conv) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ChatRoomScreen(
          conversationId: conv.id,
          onOpenCasting: widget.onOpenCasting,
        ),
      ),
    ).then((_) {
      setState(() {});
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgPrimary,
      appBar: _buildAppBar(),
      body: Column(
        children: [
          // Offline Banner Indicator
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
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
                color: const Color(0xFF261E0A),
                child: Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: AppTheme.accentGold,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        status == ChatConnectionStatus.connecting || status == ChatConnectionStatus.reconnecting
                            ? "Connecting to CineConnect WebSocket... (Retrying)"
                            : "Waiting for network • Simulated Production Echo enabled",
                        style: const TextStyle(
                          color: AppTheme.accentGoldLight,
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    InkWell(
                      onTap: () => _chatService.connect(),
                      child: const Text(
                        "Reconnect",
                        style: TextStyle(
                          color: AppTheme.accentGold,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),

          // Search Field (if toggled)
          if (_isSearchActive) _buildSearchBar(),

          // Segmented Tabs Header
          _buildSegmentTabs(),

          // Tab Views
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                // Tab 1: Production Chats
                _buildConversationList(ConversationType.production),

                // Tab 2: Direct Messages
                _buildConversationList(ConversationType.direct),
              ],
            ),
          ),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: AppTheme.bgPrimary,
      elevation: 0,
      titleSpacing: 16,
      title: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: AppTheme.accentGold.withOpacity(0.15),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppTheme.accentGold.withOpacity(0.3)),
            ),
            child: const Icon(Icons.chat_bubble_rounded, color: AppTheme.accentGold, size: 18),
          ),
          const SizedBox(width: 10),
          const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Messages & Pitch Room",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.3,
                ),
              ),
              Text(
                "Direct Production Access",
                style: TextStyle(
                  color: AppTheme.textMuted,
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
      actions: [
        IconButton(
          onPressed: () {
            setState(() {
              _isSearchActive = !_isSearchActive;
              if (!_isSearchActive) {
                _searchQuery = "";
                _searchController.clear();
              }
            });
          },
          icon: Icon(
            _isSearchActive ? Icons.search_off_rounded : Icons.search_rounded,
            color: _isSearchActive ? AppTheme.accentGold : Colors.white,
          ),
          splashRadius: 20,
        ),
        const SizedBox(width: 6),
      ],
    );
  }

  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 10),
      color: AppTheme.bgPrimary,
      child: Container(
        height: 42,
        decoration: BoxDecoration(
          color: AppTheme.bgSecondary,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.borderSubtle),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12),
        child: Row(
          children: [
            const Icon(Icons.search_rounded, color: AppTheme.textMuted, size: 18),
            const SizedBox(width: 8),
            Expanded(
              child: TextField(
                controller: _searchController,
                autofocus: true,
                style: const TextStyle(color: Colors.white, fontSize: 13.5),
                cursorColor: AppTheme.accentGold,
                onChanged: (val) {
                  setState(() {
                    _searchQuery = val.trim();
                  });
                },
                decoration: const InputDecoration(
                  hintText: "Search conversations, productions, or roles...",
                  hintStyle: TextStyle(color: AppTheme.textMuted, fontSize: 13),
                  border: InputBorder.none,
                  isDense: true,
                ),
              ),
            ),
            if (_searchQuery.isNotEmpty)
              GestureDetector(
                onTap: () {
                  setState(() {
                    _searchQuery = "";
                    _searchController.clear();
                  });
                },
                child: const Icon(Icons.cancel, color: AppTheme.textMuted, size: 16),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSegmentTabs() {
    final prodCount = _filterConversations(ConversationType.production)
        .fold<int>(0, (sum, c) => sum + c.unreadCount);
    final directCount = _filterConversations(ConversationType.direct)
        .fold<int>(0, (sum, c) => sum + c.unreadCount);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      height: 44,
      decoration: BoxDecoration(
        color: AppTheme.bgSecondary,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.borderSubtle),
      ),
      child: TabBar(
        controller: _tabController,
        indicator: BoxDecoration(
          color: AppTheme.accentGold,
          borderRadius: BorderRadius.circular(10),
          boxShadow: [
            BoxShadow(
              color: AppTheme.accentGold.withOpacity(0.35),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        labelColor: Colors.black,
        unselectedLabelColor: AppTheme.textSecondary,
        labelStyle: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800),
        unselectedLabelStyle: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600),
        dividerColor: Colors.transparent,
        tabs: [
          Tab(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.movie_filter_rounded, size: 16),
                const SizedBox(width: 6),
                const Text("Production Chats"),
                if (prodCount > 0) ...[
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                    decoration: BoxDecoration(
                      color: Colors.black,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      "$prodCount",
                      style: const TextStyle(color: AppTheme.accentGold, fontSize: 10, fontWeight: FontWeight.w900),
                    ),
                  ),
                ],
              ],
            ),
          ),
          Tab(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.people_alt_rounded, size: 16),
                const SizedBox(width: 6),
                const Text("Direct Messages"),
                if (directCount > 0) ...[
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                    decoration: BoxDecoration(
                      color: Colors.black,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      "$directCount",
                      style: const TextStyle(color: AppTheme.accentGold, fontSize: 10, fontWeight: FontWeight.w900),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildConversationList(ConversationType type) {
    final list = _filterConversations(type);

    if (list.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: AppTheme.bgSurface,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppTheme.borderSubtle),
                ),
                child: Icon(
                  type == ConversationType.production
                      ? Icons.video_camera_back_outlined
                      : Icons.chat_bubble_outline_rounded,
                  color: AppTheme.textMuted,
                  size: 30,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                _searchQuery.isNotEmpty
                    ? "No conversations matching '$_searchQuery'"
                    : (type == ConversationType.production
                        ? "No Active Production Threads"
                        : "No Direct Messages Yet"),
                style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 6),
              Text(
                type == ConversationType.production
                    ? "Apply to auditions or pitch to studio executives to start official communications."
                    : "Connect with cinematographers, directors, actors and crew from the talent directory.",
                style: const TextStyle(color: AppTheme.textMuted, fontSize: 12, height: 1.4),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.only(top: 4, bottom: 80),
      itemCount: list.length,
      itemBuilder: (context, index) {
        final conv = list[index];
        return ConversationTile(
          conversation: conv,
          onTap: () => _openConversation(conv),
        );
      },
    );
  }
}
