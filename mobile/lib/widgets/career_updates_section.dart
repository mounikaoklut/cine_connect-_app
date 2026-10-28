import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/notification_model.dart';
import '../services/notification_service.dart';

class CareerUpdatesSection extends StatefulWidget {
  final VoidCallback? onBrowseCastings;
  final Function(String applicationId)? onOpenApplication;

  const CareerUpdatesSection({
    super.key,
    this.onBrowseCastings,
    this.onOpenApplication,
  });

  @override
  State<CareerUpdatesSection> createState() => _CareerUpdatesSectionState();
}

class _CareerUpdatesSectionState extends State<CareerUpdatesSection>
    with SingleTickerProviderStateMixin {
  late AnimationController _reelAnimController;

  @override
  void initState() {
    super.initState();
    _reelAnimController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();
  }

  @override
  void dispose() {
    _reelAnimController.dispose();
    super.dispose();
  }

  void _showOnboardingInstructions(BuildContext context, AppNotification notif) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0F131C),
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppTheme.accentGold.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.celebration_rounded, color: AppTheme.accentGold, size: 24),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Onboarding & Production Instructions",
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                      ),
                      Text(
                        "${notif.productionHouse ?? 'Production Studio'} • ${notif.projectTitle ?? 'Project'}",
                        style: const TextStyle(color: AppTheme.accentGold, fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.bgSurface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppTheme.accentGold.withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "DIRECTOR & CASTING NOTE",
                    style: TextStyle(color: AppTheme.accentGold, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    notif.directorNote ??
                        "Congratulations on securing the role! The director appreciated your subtlety and character immersion during tests.",
                    style: const TextStyle(color: Colors.white, fontSize: 13, height: 1.4),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            const Text("Next Mandatory Milestones:", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white70)),
            const SizedBox(height: 10),
            _buildMilestoneRow("1", "Sign Standard SAG/Cine Artists Agreement", "Draft dispatched to registered email"),
            _buildMilestoneRow("2", "Costume & Wardrobe Measurements", "Scheduled for Friday, Studio B"),
            _buildMilestoneRow("3", "Read-through with Lead Cast & Director", "Video link will be posted 24h prior"),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.accentGold,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.check_circle_outline, size: 20),
                label: const Text("Acknowledge & Confirm Availability", style: TextStyle(fontWeight: FontWeight.bold)),
                onPressed: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text("Confirmed! Production coordinator will reach out shortly."),
                      backgroundColor: AppTheme.accentEmerald,
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMilestoneRow(String num, String title, String sub) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 22,
            height: 22,
            alignment: Alignment.center,
            decoration: const BoxDecoration(
              color: AppTheme.bgSurface,
              shape: BoxShape.circle,
            ),
            child: Text(num, style: const TextStyle(color: AppTheme.accentGold, fontSize: 11, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                Text(sub, style: const TextStyle(color: AppTheme.textMuted, fontSize: 11)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<List<AppNotification>>(
      valueListenable: NotificationService.instance.notificationsNotifier,
      builder: (context, notifs, _) {
        final careerNotifs = notifs.where((n) => n.isCareerUpdate).take(3).toList();

        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
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
                        const Text(
                          "CAREER UPDATES & STATUS",
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.8,
                            color: AppTheme.accentGoldLight,
                          ),
                        ),
                      ],
                    ),
                    // Quick simulation trigger button for testing live updates
                    PopupMenuButton<String>(
                      tooltip: "Simulate Status Change",
                      color: AppTheme.bgSecondary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      icon: const Icon(Icons.flash_on_rounded, color: AppTheme.accentGold, size: 18),
                      onSelected: (val) {
                        if (val == "SELECTED") {
                          NotificationService.instance.triggerTestStatusUpdate(
                            status: "SELECTED",
                            projectTitle: "Brahmastra Part Two",
                            roleName: "VFX Supervisor / Cameo Actor",
                            productionHouse: "Dharma Productions",
                          );
                        } else if (val == "UNDER_REVIEW") {
                          NotificationService.instance.triggerTestStatusUpdate(
                            status: "UNDER_REVIEW",
                            projectTitle: "Farzi Season 2",
                            roleName: "Counterfeit Analyst Lead",
                            productionHouse: "Raj & DK Films",
                          );
                        } else if (val == "NOT_SELECTED") {
                          NotificationService.instance.triggerTestStatusUpdate(
                            status: "NOT_SELECTED",
                            projectTitle: "Don 3",
                            roleName: "Undercover Liaison",
                            productionHouse: "Excel Entertainment",
                          );
                        }
                      },
                      itemBuilder: (ctx) => [
                        const PopupMenuItem(
                          value: "SELECTED",
                          child: Text("⚡ Trigger 'Selected' Status", style: TextStyle(color: AppTheme.accentGold, fontSize: 12)),
                        ),
                        const PopupMenuItem(
                          value: "UNDER_REVIEW",
                          child: Text("⚡ Trigger 'Under Review' Status", style: TextStyle(color: Colors.amber, fontSize: 12)),
                        ),
                        const PopupMenuItem(
                          value: "NOT_SELECTED",
                          child: Text("⚡ Trigger 'Not Selected' Status", style: TextStyle(color: Colors.white70, fontSize: 12)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              if (careerNotifs.isEmpty)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.bgSecondary,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.borderSubtle),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.movie_creation_outlined, color: AppTheme.textMuted, size: 24),
                      SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          "No active application status notifications yet. Submit an audition tape to track your pipeline in real time.",
                          style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                )
              else
                Column(
                  children: careerNotifs.map((notif) {
                    final status = notif.careerStatus ?? 'UNDER_REVIEW';

                    if (status == 'SELECTED') {
                      return _buildSelectedCard(context, notif);
                    } else if (status == 'UNDER_REVIEW') {
                      return _buildUnderReviewCard(context, notif);
                    } else {
                      return _buildNotSelectedCard(context, notif);
                    }
                  }).toList(),
                ),
            ],
          ),
        );
      },
    );
  }

  /// 1. SELECTED: Gold accent, clapper icon, celebratory headline, instructions button
  Widget _buildSelectedCard(BuildContext context, AppNotification notif) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: LinearGradient(
          colors: [
            const Color(0xFFF59E0B).withOpacity(0.18),
            const Color(0xFF0F131C),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: const Color(0xFFF59E0B), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFF59E0B).withOpacity(0.15),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
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
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: AppTheme.accentGold,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.movie_filter_rounded, color: Colors.black, size: 16),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      "SELECTED & OFFERED",
                      style: TextStyle(
                        color: AppTheme.accentGold,
                        fontWeight: FontWeight.w900,
                        fontSize: 11,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
                Text(
                  notif.timeAgoFormatted,
                  style: const TextStyle(color: AppTheme.textMuted, fontSize: 10),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              "🎉 Role Offered: ${notif.roleName ?? 'Lead Actor'}!",
              style: const TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: 16,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              "${notif.productionHouse ?? 'Production Studio'} has officially confirmed your casting for '${notif.projectTitle ?? 'Upcoming Feature'}'.",
              style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12, height: 1.4),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.accentGold,
                      foregroundColor: Colors.black,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                    icon: const Icon(Icons.assignment_turned_in, size: 16),
                    label: const Text(
                      "View Onboarding Details",
                      style: TextStyle(fontWeight: FontWeight.w800, fontSize: 12),
                    ),
                    onPressed: () => _showOnboardingInstructions(context, notif),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  /// 2. UNDER REVIEW: Calm amber tone, film reel progress animation, status tracking indicator
  Widget _buildUnderReviewCard(BuildContext context, AppNotification notif) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppTheme.bgSecondary,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFBBF24).withOpacity(0.5), width: 1.2),
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
                    RotationTransition(
                      turns: _reelAnimController,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFBBF24).withOpacity(0.15),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.motion_photos_on_rounded, color: Color(0xFFFBBF24), size: 16),
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      "IN DIRECTOR REVIEW",
                      style: TextStyle(
                        color: Color(0xFFFBBF24),
                        fontWeight: FontWeight.w800,
                        fontSize: 11,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
                Text(
                  notif.timeAgoFormatted,
                  style: const TextStyle(color: AppTheme.textMuted, fontSize: 10),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              "${notif.roleName ?? 'Audition Role'} • ${notif.projectTitle ?? 'Project'}",
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white),
            ),
            const SizedBox(height: 4),
            Text(
              notif.body,
              style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12, height: 1.3),
            ),
            const SizedBox(height: 12),

            // Progress tracking indicator
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: AppTheme.bgSurface,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, color: AppTheme.accentEmerald, size: 14),
                  const SizedBox(width: 4),
                  const Text("Submitted", style: TextStyle(color: Colors.white70, fontSize: 10)),
                  const Expanded(child: Divider(color: AppTheme.accentEmerald, thickness: 1.5, indent: 6, endIndent: 6)),
                  const Icon(Icons.check_circle, color: AppTheme.accentEmerald, size: 14),
                  const SizedBox(width: 4),
                  const Text("Shortlisted", style: TextStyle(color: Colors.white70, fontSize: 10)),
                  const Expanded(child: Divider(color: Color(0xFFFBBF24), thickness: 1.5, indent: 6, endIndent: 6)),
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(color: Color(0xFFFBBF24), shape: BoxShape.circle),
                  ),
                  const SizedBox(width: 4),
                  const Text("Screen Test", style: TextStyle(color: Color(0xFFFBBF24), fontWeight: FontWeight.bold, fontSize: 10)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// 3. NOT SELECTED: Neutral slate tone, respectful encouragement text, link to view open casting calls
  Widget _buildNotSelectedCard(BuildContext context, AppNotification notif) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppTheme.bgSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.borderSubtle),
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
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: Colors.white10,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Icon(Icons.archive_outlined, color: AppTheme.textMuted, size: 14),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      "APPLICATION ARCHIVED",
                      style: TextStyle(
                        color: AppTheme.textMuted,
                        fontWeight: FontWeight.w700,
                        fontSize: 10,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
                Text(
                  notif.timeAgoFormatted,
                  style: const TextStyle(color: AppTheme.textMuted, fontSize: 10),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              "${notif.roleName ?? 'Role'} • ${notif.productionHouse ?? 'Studio'}",
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white70),
            ),
            const SizedBox(height: 4),
            Text(
              "Thank you for auditioning with ${notif.productionHouse ?? 'the production team'}. While this role was awarded to another candidate, your audition tape has been permanently cataloged in casting archives for future matching calls.",
              style: const TextStyle(color: AppTheme.textMuted, fontSize: 11, height: 1.4),
            ),
            const SizedBox(height: 10),
            InkWell(
              onTap: widget.onBrowseCastings,
              borderRadius: BorderRadius.circular(8),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    Text(
                      "Browse Open Casting Calls",
                      style: TextStyle(
                        color: AppTheme.accentNeonCyan,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(width: 4),
                    Icon(Icons.arrow_forward_rounded, color: AppTheme.accentNeonCyan, size: 13),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
