import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/models.dart';
import 'chat_room_screen.dart';
import '../widgets/career_updates_section.dart';
import '../widgets/notification_bell_icon.dart';

class AuditionsScreen extends StatelessWidget {
  final List<CastingCall> castings;
  final Function(CastingCall call) onSelectCasting;

  const AuditionsScreen({
    super.key,
    required this.castings,
    required this.onSelectCasting,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Casting & Auditions", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        actions: const [
          NotificationBellIcon(),
          SizedBox(width: 8),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: castings.length + 1,
        itemBuilder: (context, index) {
          if (index == 0) {
            return const CareerUpdatesSection();
          }
          final casting = castings[index - 1];
          return Card(
            margin: const EdgeInsets.only(bottom: 16),
            color: AppTheme.bgSecondary,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(
                color: casting.isUrgent ? AppTheme.accentRose.withOpacity(0.5) : AppTheme.borderSubtle,
              ),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppTheme.accentGoldSoft,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(casting.projectType, style: const TextStyle(color: AppTheme.accentGoldLight, fontSize: 10, fontWeight: FontWeight.bold)),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppTheme.accentNeonCyan.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(casting.craft, style: const TextStyle(color: AppTheme.accentNeonCyan, fontSize: 10, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                      if (casting.matchScore != null)
                        Text(
                          "⚡ ${casting.matchScore}% Match",
                          style: const TextStyle(color: AppTheme.accentEmerald, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  Text(
                    casting.title,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.white),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    "${casting.productionHouse}${casting.director != null ? ' • Dir. ${casting.director}' : ''}",
                    style: const TextStyle(color: AppTheme.accentGold, fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),

                  Text(
                    casting.characterDescription,
                    style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary, height: 1.4),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 12),

                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppTheme.bgSurface,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text("Location", style: TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                            Text(casting.location, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            const Text("Compensation", style: TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                            Text(casting.payRange, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.accentEmerald)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        "Deadline: ${casting.deadline}",
                        style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                      ),
                      Row(
                        children: [
                          OutlinedButton.icon(
                            onPressed: () {
                              final convId = casting.id == "cast-101"
                                  ? "conv-prod-1"
                                  : (casting.id == "cast-102"
                                      ? "conv-prod-2"
                                      : "conv-prod-3");
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => ChatRoomScreen(conversationId: convId),
                                ),
                              );
                            },
                            icon: const Icon(Icons.chat_bubble_outline_rounded, size: 13),
                            label: const Text("Chat Desk"),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppTheme.accentGold,
                              side: const BorderSide(color: AppTheme.accentGold, width: 1),
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              textStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          ),
                          const SizedBox(width: 8),
                          ElevatedButton(
                            onPressed: () => onSelectCasting(casting),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.accentGold,
                              foregroundColor: Colors.black,
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            child: const Text("Instant Audition 🎬", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
