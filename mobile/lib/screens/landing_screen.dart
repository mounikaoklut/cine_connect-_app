import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../data/mock_data.dart';
import '../models/models.dart';

class LandingScreen extends StatelessWidget {
  final VoidCallback onEnterStudioHub;
  final Function(CastingCall call) onSelectCasting;
  final Function(Talent talent) onSelectTalent;
  final Function(PitchDeck pitch) onSelectPitch;

  const LandingScreen({
    super.key,
    required this.onEnterStudioHub,
    required this.onSelectCasting,
    required this.onSelectTalent,
    required this.onSelectPitch,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final talents = MockData.talentList;
    final castings = MockData.castingList;
    final pitches = MockData.pitchList;

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
            RichText(
              text: TextSpan(
                style: theme.textTheme.titleLarge?.copyWith(fontSize: 18),
                children: const [
                  TextSpan(text: "Cine"),
                  TextSpan(text: "Connect", style: TextStyle(color: AppTheme.accentGold)),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: onEnterStudioHub,
            child: const Text("Enter Studio →", style: TextStyle(color: AppTheme.accentGold, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Section
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.accentGoldSoft,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.accentGold.withOpacity(0.3)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.circle, color: AppTheme.accentRose, size: 8),
                        SizedBox(width: 6),
                        Text(
                          "AUDITION SEASON 2026-2027",
                          style: TextStyle(color: AppTheme.accentGoldLight, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    "Where Cinematic Vision Meets Global Talent.",
                    style: theme.textTheme.displayMedium?.copyWith(
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "Connecting actors, cinematographers, sound designers, and writers directly with top production houses and OTT networks.",
                    style: theme.textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 18),

                  // Enter Studio Button
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: onEnterStudioHub,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.accentGold,
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 6,
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.bolt, color: Colors.black),
                          SizedBox(width: 8),
                          Text("Enter Live Studio Hub & Feed", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Metrics Bar
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.bgSecondary,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.borderSubtle),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildMetric("15.4k+", "Verified Artists", AppTheme.accentGold),
                  _buildMetric("480+", "OTT & Features", Colors.white),
                  _buildMetric("₹45Cr+", "Cast Budgets", AppTheme.accentNeonCyan),
                  _buildMetric("98.4%", "Response", AppTheme.accentEmerald),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Featured Showreel Frame
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: GestureDetector(
                onTap: () => onSelectTalent(talents[0]),
                child: Container(
                  height: 180,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.borderGlow),
                    image: DecorationImage(
                      image: NetworkImage(talents[0].coverImage),
                      fit: BoxFit.cover,
                      colorFilter: const ColorFilter.mode(Colors.black45, BlendMode.darken),
                    ),
                  ),
                  child: Stack(
                    children: [
                      Center(
                        child: CircleAvatar(
                          radius: 28,
                          backgroundColor: AppTheme.accentGold.withOpacity(0.9),
                          child: const Icon(Icons.play_arrow, color: Colors.black, size: 32),
                        ),
                      ),
                      Positioned(
                        bottom: 12,
                        left: 14,
                        right: 14,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              talents[0].featuredReelTitle,
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                            const Text("2.39:1 Anamorphic", style: TextStyle(color: AppTheme.accentGold, fontSize: 11)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 32),

            // Open Auditions Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text("Live Audition Notices", style: theme.textTheme.titleLarge?.copyWith(fontSize: 17)),
                  GestureDetector(
                    onTap: onEnterStudioHub,
                    child: const Text("View All →", style: TextStyle(color: AppTheme.accentGold, fontSize: 13, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Horizontal Audition Cards
            SizedBox(
              height: 210,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.only(left: 16, right: 8),
                itemCount: castings.length,
                itemBuilder: (context, index) {
                  final casting = castings[index];
                  return Container(
                    width: 270,
                    margin: const EdgeInsets.only(right: 12),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppTheme.bgSecondary,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: casting.isUrgent ? AppTheme.accentRose.withOpacity(0.4) : AppTheme.borderSubtle),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppTheme.accentGoldSoft,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(casting.projectType, style: const TextStyle(color: AppTheme.accentGoldLight, fontSize: 10, fontWeight: FontWeight.bold)),
                            ),
                            if (casting.isUrgent)
                              const Text("● Urgent", style: TextStyle(color: AppTheme.accentRose, fontSize: 11, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        Text(
                          casting.title,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          casting.productionHouse,
                          style: const TextStyle(color: AppTheme.accentGold, fontSize: 11, fontWeight: FontWeight.w600),
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(casting.payRange, style: const TextStyle(color: AppTheme.accentEmerald, fontSize: 11, fontWeight: FontWeight.bold)),
                            ElevatedButton(
                              onPressed: () => onSelectCasting(casting),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.accentGold,
                                foregroundColor: Colors.black,
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                minimumSize: const Size(0, 30),
                              ),
                              child: const Text("Apply", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 32),

            // Curated Talent Vault Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text("Featured Artists & Crew", style: theme.textTheme.titleLarge?.copyWith(fontSize: 17)),
                  GestureDetector(
                    onTap: onEnterStudioHub,
                    child: const Text("Directory →", style: TextStyle(color: AppTheme.accentGold, fontSize: 13, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Horizontal Talent Cards
            SizedBox(
              height: 160,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.only(left: 16, right: 8),
                itemCount: talents.length,
                itemBuilder: (context, index) {
                  final talent = talents[index];
                  return GestureDetector(
                    onTap: () => onSelectTalent(talent),
                    child: Container(
                      width: 200,
                      margin: const EdgeInsets.only(right: 12),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTheme.bgSecondary,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppTheme.borderSubtle),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          CircleAvatar(
                            radius: 28,
                            backgroundImage: NetworkImage(talent.avatar),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            talent.name,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            talent.craft,
                            style: const TextStyle(color: AppTheme.accentGold, fontSize: 11),
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            "${talent.creditsCount} Credits • ${talent.city}",
                            style: const TextStyle(color: AppTheme.textMuted, fontSize: 10),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildMetric(String value, String label, Color color) {
    return Column(
      children: [
        Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: color)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(fontSize: 9, color: AppTheme.textMuted)),
      ],
    );
  }
}
