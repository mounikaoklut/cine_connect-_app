import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/models.dart';

class CreatePostSheet extends StatefulWidget {
  final Function(FeedPost newPost) onPostCreated;

  const CreatePostSheet({super.key, required this.onPostCreated});

  @override
  State<CreatePostSheet> createState() => _CreatePostSheetState();
}

class _CreatePostSheetState extends State<CreatePostSheet> {
  final TextEditingController _contentCtrl = TextEditingController();
  final TextEditingController _tagsCtrl = TextEditingController(text: "#CastingCall #Cinema");
  String _selectedType = "announcement";
  bool _isPublishing = false;

  final List<Map<String, String>> _types = [
    {"id": "announcement", "label": "📣 Update"},
    {"id": "casting", "label": "🎭 Casting"},
    {"id": "showreel", "label": "🎬 Reel"},
    {"id": "pitch", "label": "📜 Pitch"},
  ];

  void _handlePublish() {
    if (_contentCtrl.text.trim().isEmpty) return;

    setState(() => _isPublishing = true);
    Future.delayed(const Duration(milliseconds: 700), () {
      final tags = _tagsCtrl.text.split(" ").where((t) => t.trim().isNotEmpty).toList();
      final post = FeedPost(
        id: "feed-${DateTime.now().millisecondsSinceEpoch}",
        authorName: "Kabir Mehra",
        authorCraft: "Actor",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
        authorVerified: true,
        timestamp: "Just now",
        type: _selectedType,
        content: _contentCtrl.text.trim(),
        tags: tags,
        likes: 0,
        commentsCount: 0,
        shares: 0,
      );

      widget.onPostCreated(post);
      if (mounted) Navigator.pop(context);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppTheme.bgSecondary,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
        top: 16,
        left: 20,
        right: 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(2)),
            ),
          ),
          const SizedBox(height: 16),
          const Text("Share with Cinema Community", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 12),

          // Types
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _types.map((t) {
                final isSelected = _selectedType == t["id"];
                return GestureDetector(
                  onTap: () => setState(() => _selectedType = t["id"]!),
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: isSelected ? AppTheme.accentGold : AppTheme.bgSurface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: isSelected ? AppTheme.accentGold : AppTheme.borderSubtle),
                    ),
                    child: Text(
                      t["label"]!,
                      style: TextStyle(
                        color: isSelected ? Colors.black : Colors.white70,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 14),

          TextField(
            controller: _contentCtrl,
            maxLines: 4,
            style: const TextStyle(color: Colors.white, fontSize: 14),
            decoration: InputDecoration(
              filled: true,
              fillColor: AppTheme.bgSurface,
              hintText: "Describe your casting role, showreel release, or shoot update...",
              hintStyle: const TextStyle(color: AppTheme.textMuted, fontSize: 13),
              contentPadding: const EdgeInsets.all(14),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppTheme.borderSubtle),
              ),
            ),
          ),
          const SizedBox(height: 12),

          TextField(
            controller: _tagsCtrl,
            style: const TextStyle(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              filled: true,
              fillColor: AppTheme.bgSurface,
              prefixIcon: const Icon(Icons.tag, color: AppTheme.accentGold, size: 18),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: AppTheme.borderSubtle),
              ),
            ),
          ),
          const SizedBox(height: 18),

          SizedBox(
            width: double.infinity,
            height: 46,
            child: ElevatedButton(
              onPressed: _isPublishing ? null : _handlePublish,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.accentGold,
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: _isPublishing
                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                  : const Text("Broadcast to Feed 🚀", style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }
}
