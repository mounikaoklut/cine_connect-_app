import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("My Profile & Media", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        actions: [
          IconButton(
            icon: const Icon(Icons.share, color: Colors.white70),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Public Portfolio link copied to clipboard!"), backgroundColor: AppTheme.accentGoldDark),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // User Header Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.bgSecondary,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.borderGlow),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Stack(
                        children: [
                          const CircleAvatar(
                            radius: 36,
                            backgroundImage: NetworkImage(
                              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
                            ),
                          ),
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: Container(
                              padding: const EdgeInsets.all(2),
                              decoration: const BoxDecoration(
                                color: Colors.black,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.verified, color: AppTheme.accentGold, size: 20),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(width: 14),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "Kabir Mehra",
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                            Text(
                              "Lead Actor & Voice Artist",
                              style: TextStyle(color: AppTheme.accentGold, fontSize: 13, fontWeight: FontWeight.w600),
                            ),
                            Text(
                              "Mumbai, Maharashtra (500km travel)",
                              style: TextStyle(color: AppTheme.textMuted, fontSize: 11),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  const Text(
                    "Method actor with 8+ years across independent cinema, OTT thrillers, and commercial campaigns. Trained at the National School of Drama.",
                    style: TextStyle(fontSize: 12, color: AppTheme.textSecondary, height: 1.4),
                  ),
                  const SizedBox(height: 14),

                  // Completeness Meter
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.bgSurface,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text("Profile Completeness", style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                            Text("85%", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.accentEmerald)),
                          ],
                        ),
                        const SizedBox(height: 6),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: const LinearProgressIndicator(
                            value: 0.85,
                            backgroundColor: Colors.white10,
                            valueColor: AlwaysStoppedAnimation<Color>(AppTheme.accentEmerald),
                            minHeight: 6,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Skills & Craft
            const Text("Skills & Craft", style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _buildSkillChip("Method Acting", "Expert"),
                _buildSkillChip("Dialogue Modulation", "Expert"),
                _buildSkillChip("Stage Stunts", "Intermediate"),
                _buildSkillChip("Improvisation", "Advanced"),
              ],
            ),
            const SizedBox(height: 24),

            // Experience Timeline
            const Text("Credits & Timeline", style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 10),
            _buildCreditCard("Lead Antagonist (Vikram)", "Dharma Productions / Netflix", "2024", "Feature Film"),
            _buildCreditCard("Inspector Samar", "Excel Entertainment / Prime Video", "2023", "Web Series"),
            _buildCreditCard("Lead Protagonist", "Prithvi Theatre Mumbai", "2021-2022", "Theatre Play"),
            const SizedBox(height: 24),

            // ID Verification
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.accentEmerald.withOpacity(0.12),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.accentEmerald.withOpacity(0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.shield, color: AppTheme.accentEmerald, size: 28),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("Government ID Verified", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                        Text("Aadhaar & Passport verified under India DPDP Act.", style: TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
                      ],
                    ),
                  ),
                  Icon(Icons.check_circle, color: AppTheme.accentEmerald, size: 18),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSkillChip(String name, String level) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppTheme.bgSecondary,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppTheme.borderSubtle),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(name, style: const TextStyle(fontSize: 12, color: Colors.white)),
          const SizedBox(width: 6),
          Text(
            level,
            style: const TextStyle(fontSize: 10, color: AppTheme.accentGold, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildCreditCard(String title, String company, String year, String roleType) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.bgSecondary,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.borderSubtle),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white)),
              Text(company, style: const TextStyle(color: AppTheme.accentGold, fontSize: 11)),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(color: Colors.white10, borderRadius: BorderRadius.circular(4)),
                child: Text(roleType, style: const TextStyle(fontSize: 9, color: Colors.white70)),
              ),
              const SizedBox(height: 2),
              Text(year, style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
            ],
          ),
        ],
      ),
    );
  }
}
