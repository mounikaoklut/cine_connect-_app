import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/models.dart';

class PipelineScreen extends StatelessWidget {
  final List<PipelineItem> pipelineItems;

  const PipelineScreen({super.key, required this.pipelineItems});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Audition Pipeline Tracker", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: pipelineItems.length,
        itemBuilder: (context, index) {
          final item = pipelineItems[index];
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
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppTheme.accentGoldSoft,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          item.stage,
                          style: const TextStyle(color: AppTheme.accentGoldLight, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                      Text("Applied: ${item.appliedDate}", style: const TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                    ],
                  ),
                  const SizedBox(height: 10),

                  Text(
                    item.projectTitle,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.white),
                  ),
                  Text(
                    "Role: ${item.roleTitle} • ${item.productionHouse}",
                    style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                  ),
                  const SizedBox(height: 14),

                  // Progress Bar
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: item.progressPercent,
                      backgroundColor: Colors.white10,
                      valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.accentGold),
                      minHeight: 6,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text("Submitted", style: TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                      Text("Review", style: TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                      Text("Shortlist", style: TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                      Text("Callback", style: TextStyle(fontSize: 10, color: AppTheme.accentGoldLight)),
                    ],
                  ),
                  const SizedBox(height: 14),

                  // Next Step Box
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.bgSurface,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppTheme.borderGlow),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          "NEXT MILESTONE",
                          style: TextStyle(color: AppTheme.accentGold, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          item.nextStepNote,
                          style: const TextStyle(color: Colors.white, fontSize: 12),
                        ),
                        if (item.meetingLink != null) ...[
                          const SizedBox(height: 10),
                          SizedBox(
                            width: double.infinity,
                            height: 36,
                            child: ElevatedButton.icon(
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text("Launching Screen Test: ${item.meetingLink}"),
                                    backgroundColor: AppTheme.accentNeonCyan,
                                  ),
                                );
                              },
                              icon: const Icon(Icons.videocam, size: 16),
                              label: Text("Join Screen Test (${item.meetingTime?.split('•').first.trim() ?? 'Meeting'})", style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.accentGold,
                                foregroundColor: Colors.black,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
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
