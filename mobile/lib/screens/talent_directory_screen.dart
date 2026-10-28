import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/models.dart';
import 'chat_room_screen.dart';

class TalentDirectoryScreen extends StatefulWidget {
  final List<Talent> talents;
  final Function(Talent talent) onSelectTalent;

  const TalentDirectoryScreen({
    super.key,
    required this.talents,
    required this.onSelectTalent,
  });

  @override
  State<TalentDirectoryScreen> createState() => _TalentDirectoryScreenState();
}

class _TalentDirectoryScreenState extends State<TalentDirectoryScreen> {
  String _selectedCraft = "all";

  final List<Map<String, String>> _crafts = [
    {"id": "all", "label": "All Crafts"},
    {"id": "acting", "label": "Actors"},
    {"id": "camera", "label": "DOPs"},
    {"id": "sound", "label": "Sound"},
    {"id": "writing", "label": "Writers"},
  ];

  @override
  Widget build(BuildContext context) {
    final filteredTalents = _selectedCraft == "all"
        ? widget.talents
        : widget.talents.where((t) => t.category == _selectedCraft).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text("Creative Talent Directory", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
      ),
      body: Column(
        children: [
          // Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: _crafts.map((c) {
                final isSelected = _selectedCraft == c["id"];
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: ChoiceChip(
                    label: Text(c["label"]!),
                    selected: isSelected,
                    selectedColor: AppTheme.accentGoldSoft,
                    backgroundColor: AppTheme.bgSecondary,
                    labelStyle: TextStyle(
                      color: isSelected ? AppTheme.accentGold : AppTheme.textSecondary,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                    side: BorderSide(color: isSelected ? AppTheme.accentGold : AppTheme.borderSubtle),
                    onSelected: (val) {
                      if (val) setState(() => _selectedCraft = c["id"]!);
                    },
                  ),
                );
              }).toList(),
            ),
          ),

          // Talent Grid / List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: filteredTalents.length,
              itemBuilder: (context, index) {
                final talent = filteredTalents[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 14),
                  color: AppTheme.bgSecondary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: const BorderSide(color: AppTheme.borderSubtle),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(14.0),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        CircleAvatar(
                          radius: 28,
                          backgroundImage: NetworkImage(talent.avatar),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    talent.name,
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white),
                                  ),
                                  if (talent.verified) ...[
                                    const SizedBox(width: 4),
                                    const Icon(Icons.check_circle, color: AppTheme.accentGold, size: 14),
                                  ],
                                ],
                              ),
                              Text(
                                talent.craft,
                                style: const TextStyle(color: AppTheme.accentGold, fontSize: 12),
                              ),
                              Text(
                                "${talent.creditsCount} Credits • ${talent.city}",
                                style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                              ),
                              const SizedBox(height: 8),
                              Wrap(
                                spacing: 4,
                                children: talent.skills.take(2).map((s) => Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: Colors.white10,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(s, style: const TextStyle(fontSize: 10, color: Colors.white70)),
                                )).toList(),
                              ),
                            ],
                          ),
                        ),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.chat_bubble_outline_rounded, color: AppTheme.accentGold, size: 22),
                              tooltip: "Message ${talent.name}",
                              onPressed: () {
                                final convId = talent.id == "tal-1"
                                    ? "conv-dm-1"
                                    : (talent.id == "tal-2" ? "conv-dm-2" : "conv-dm-3");
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => ChatRoomScreen(conversationId: convId),
                                  ),
                                );
                              },
                            ),
                            IconButton(
                              icon: const Icon(Icons.play_circle_fill, color: AppTheme.accentGold, size: 28),
                              tooltip: "Watch Showreel",
                              onPressed: () => widget.onSelectTalent(talent),
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
}
