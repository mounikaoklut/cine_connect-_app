import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/models.dart';
import '../widgets/notification_bell_icon.dart';

class HomeFeedScreen extends StatefulWidget {
  final List<FeedPost> posts;
  final Function(String postId) onToggleLike;
  final VoidCallback onOpenCreatePost;
  final Function(String castingId) onApplyCasting;
  final Function(String talentId) onViewReel;
  final Function(String pitchId) onRequestPitch;

  const HomeFeedScreen({
    super.key,
    required this.posts,
    required this.onToggleLike,
    required this.onOpenCreatePost,
    required this.onApplyCasting,
    required this.onViewReel,
    required this.onRequestPitch,
  });

  @override
  State<HomeFeedScreen> createState() => _HomeFeedScreenState();
}

class _HomeFeedScreenState extends State<HomeFeedScreen> {
  String _activeFilter = "all";

  final List<Map<String, String>> _filterOptions = [
    {"id": "all", "label": "All Feed"},
    {"id": "casting", "label": "🎭 Castings"},
    {"id": "showreel", "label": "🎬 Reels"},
    {"id": "pitch", "label": "📜 Pitches"},
    {"id": "bts", "label": "📸 BTS"},
  ];

  @override
  Widget build(BuildContext context) {
    final filteredPosts = _activeFilter == "all"
        ? widget.posts
        : widget.posts.where((p) => p.type == _activeFilter).toList();

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: AppTheme.accentGold,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.movie, color: Colors.black, size: 20),
            ),
            const SizedBox(width: 8),
            const Text("Studio Feed", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          ],
        ),
        actions: [
          // 1. Notification Button (Real-Time Animated Engine)
          const NotificationBellIcon(),
          // 2. Message Button (Instagram DM Style)
          IconButton(
            tooltip: "Messages",
            icon: Stack(
              clipBehavior: Clip.none,
              children: [
                Transform.rotate(
                  angle: -0.25,
                  child: const Icon(Icons.send_rounded, color: Colors.white, size: 21),
                ),
                Positioned(
                  right: -2,
                  top: -2,
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      color: AppTheme.accentEmerald,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.black, width: 1.5),
                    ),
                    constraints: const BoxConstraints(minWidth: 14, minHeight: 14),
                    child: const Text(
                      "2",
                      style: TextStyle(color: Colors.black, fontSize: 8, fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
              ],
            ),
            onPressed: () => _showMessagesDialog(context),
          ),
          const SizedBox(width: 4),
        ],
      ),
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 76.0),
        child: FloatingActionButton(
          onPressed: widget.onOpenCreatePost,
          backgroundColor: AppTheme.accentGold,
          foregroundColor: Colors.black,
          elevation: 6,
          child: const Icon(Icons.add, size: 28),
        ),
      ),
      body: Column(
        children: [
          // Posts List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.only(left: 16, right: 16, top: 8, bottom: 90),
              itemCount: filteredPosts.length,
              itemBuilder: (context, index) {
                final post = filteredPosts[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 16),
                  color: AppTheme.bgSecondary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: const BorderSide(color: AppTheme.borderSubtle),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Author Bar
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 20,
                              backgroundImage: NetworkImage(post.authorAvatar),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Text(
                                        post.authorName,
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white),
                                      ),
                                      if (post.authorVerified) ...[
                                        const SizedBox(width: 4),
                                        const Icon(Icons.check_circle, color: AppTheme.accentGold, size: 14),
                                      ],
                                    ],
                                  ),
                                  Text(
                                    "${post.authorCraft} • ${post.timestamp}",
                                    style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: post.type == "casting"
                                    ? AppTheme.accentRose.withOpacity(0.2)
                                    : post.type == "showreel"
                                        ? AppTheme.accentGoldSoft
                                        : AppTheme.accentPurple.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                post.type.toUpperCase(),
                                style: TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                  color: post.type == "casting"
                                      ? AppTheme.accentRose
                                      : post.type == "showreel"
                                          ? AppTheme.accentGoldLight
                                          : AppTheme.accentPurple,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),

                        // Content
                        Text(
                          post.content,
                          style: const TextStyle(fontSize: 13, height: 1.5, color: AppTheme.textPrimary),
                        ),
                        const SizedBox(height: 10),

                        // Media Image
                        if (post.mediaUrl != null) ...[
                          ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: Image.network(
                              post.mediaUrl!,
                              height: 190,
                              width: double.infinity,
                              fit: BoxFit.cover,
                            ),
                          ),
                          const SizedBox(height: 10),
                        ],

                        // Tags
                        Wrap(
                          spacing: 6,
                          children: post.tags.map((t) => Text(
                            t,
                            style: const TextStyle(color: AppTheme.accentGold, fontSize: 11, fontWeight: FontWeight.bold),
                          )).toList(),
                        ),
                        const SizedBox(height: 12),

                        // Action Bar
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                GestureDetector(
                                  onTap: () => widget.onToggleLike(post.id),
                                  child: Row(
                                    children: [
                                      Icon(
                                        post.isLiked ? Icons.favorite : Icons.favorite_border,
                                        color: post.isLiked ? AppTheme.accentRose : AppTheme.textMuted,
                                        size: 18,
                                      ),
                                      const SizedBox(width: 4),
                                      Text("${post.likes}", style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Row(
                                  children: [
                                    const Icon(Icons.mode_comment_outlined, color: AppTheme.textMuted, size: 18),
                                    const SizedBox(width: 4),
                                    Text("${post.commentsCount}", style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                                  ],
                                ),
                                const SizedBox(width: 16),
                                Row(
                                  children: [
                                    const Icon(Icons.share_outlined, color: AppTheme.textMuted, size: 18),
                                    const SizedBox(width: 4),
                                    Text("${post.shares}", style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                                  ],
                                ),
                              ],
                            ),

                            // Action CTA
                            if (post.actionLabel != null)
                              ElevatedButton(
                                onPressed: () {
                                  if (post.actionType == "apply" && post.actionTargetId != null) {
                                    widget.onApplyCasting(post.actionTargetId!);
                                  } else if (post.actionType == "view_reel" && post.actionTargetId != null) {
                                    widget.onViewReel(post.actionTargetId!);
                                  } else if (post.actionType == "request_pitch" && post.actionTargetId != null) {
                                    widget.onRequestPitch(post.actionTargetId!);
                                  }
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppTheme.accentGold,
                                  foregroundColor: Colors.black,
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  minimumSize: const Size(0, 30),
                                ),
                                child: Text(post.actionLabel!, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _showMessagesDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0F131C),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.chat_bubble_outline, color: AppTheme.accentGold, size: 20),
                    SizedBox(width: 8),
                    Text("Production Messages", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppTheme.accentEmerald.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text("2 New", style: TextStyle(color: AppTheme.accentEmerald, fontSize: 11, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const CircleAvatar(
                backgroundImage: NetworkImage("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"),
              ),
              title: const Text("Shanoo Sharma (YRF)", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              subtitle: const Text("Director approved your tape. Chemistry read tomorrow 4 PM.", style: TextStyle(color: Colors.white70, fontSize: 12)),
              trailing: const Text("12m ago", style: TextStyle(color: Colors.white38, fontSize: 10)),
              onTap: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Opened chat thread with Shanoo Sharma (YRF Casting)")),
                );
              },
            ),
            const Divider(color: Colors.white10),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const CircleAvatar(
                backgroundImage: NetworkImage("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"),
              ),
              title: const Text("Rohit Shetty Picturez", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              subtitle: const Text("Pitch deck NDA verified and logged into Vault.", style: TextStyle(color: Colors.white70, fontSize: 12)),
              trailing: const Text("1h ago", style: TextStyle(color: Colors.white38, fontSize: 10)),
              onTap: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text("Opened chat thread with Rohit Shetty Picturez")),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showNotificationsDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0F131C),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.notifications_none, color: AppTheme.accentGold, size: 20),
                SizedBox(width: 8),
                Text("Notifications", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ],
            ),
            const SizedBox(height: 16),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: AppTheme.accentGold.withOpacity(0.15), shape: BoxShape.circle),
                child: const Icon(Icons.star, color: AppTheme.accentGold, size: 18),
              ),
              title: const Text("Audition Callback Scheduled!", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.accentGold)),
              subtitle: const Text("Dharma Productions invited you to a Screen Test on Oct 24th.", style: TextStyle(color: Colors.white70, fontSize: 12)),
              trailing: const Text("20m ago", style: TextStyle(color: Colors.white38, fontSize: 10)),
            ),
            const Divider(color: Colors.white10),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: Colors.purpleAccent.withOpacity(0.15), shape: BoxShape.circle),
                child: const Icon(Icons.bolt, color: Colors.purpleAccent, size: 18),
              ),
              title: const Text("New 98% AI Casting Match", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              subtitle: const Text("Prime Video series has an open call for Male Lead Antagonist.", style: TextStyle(color: Colors.white70, fontSize: 12)),
              trailing: const Text("2h ago", style: TextStyle(color: Colors.white38, fontSize: 10)),
            ),
          ],
        ),
      ),
    );
  }
}
