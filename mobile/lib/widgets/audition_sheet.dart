import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/models.dart';

class AuditionSheet extends StatefulWidget {
  final CastingCall casting;
  final Function(String roleName, String productionHouse) onSubmitSuccess;

  const AuditionSheet({
    super.key,
    required this.casting,
    required this.onSubmitSuccess,
  });

  @override
  State<AuditionSheet> createState() => _AuditionSheetState();
}

class _AuditionSheetState extends State<AuditionSheet> {
  int _selectedHeadshotIndex = 0;
  final TextEditingController _selfTapeCtrl = TextEditingController(
    text: "https://cineconnect.media/tapes/kabir_dramatic_monologue_2026.mp4",
  );
  final TextEditingController _coverNoteCtrl = TextEditingController(
    text: "I deeply connect with the psychological tension of the character. Attached is my monologue tape in Hindustani dialect.",
  );
  bool _agreedToDates = true;
  bool _isSubmitting = false;
  bool _submitted = false;

  final List<String> _headshots = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  ];

  void _handleSubmit() {
    setState(() => _isSubmitting = true);
    Future.delayed(const Duration(milliseconds: 1200), () {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
          _submitted = true;
        });
        Future.delayed(const Duration(milliseconds: 1000), () {
          widget.onSubmitSuccess(
            widget.casting.characterName ?? widget.casting.title,
            widget.casting.productionHouse,
          );
          if (mounted) Navigator.pop(context);
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

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
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.88,
      ),
      child: _submitted
          ? Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(height: 30),
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: AppTheme.accentEmerald.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.check_circle, color: AppTheme.accentEmerald, size: 40),
                ),
                const SizedBox(height: 16),
                Text(
                  "Audition Submitted!",
                  style: theme.textTheme.titleLarge?.copyWith(color: Colors.white),
                ),
                const SizedBox(height: 8),
                Text(
                  "Delivered to casting desk at ${widget.casting.productionHouse}.",
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyMedium,
                ),
                const SizedBox(height: 30),
              ],
            )
          : SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.white24,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Header Badges
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.accentGoldSoft,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.accentGold.withOpacity(0.3)),
                        ),
                        child: Text(
                          widget.casting.projectType,
                          style: const TextStyle(color: AppTheme.accentGoldLight, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(width: 8),
                      if (widget.casting.matchScore != null)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppTheme.accentEmerald.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            "⚡ ${widget.casting.matchScore}% Match",
                            style: const TextStyle(color: AppTheme.accentEmerald, fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  Text(
                    widget.casting.title,
                    style: theme.textTheme.titleLarge?.copyWith(fontSize: 18),
                  ),
                  Text(
                    widget.casting.productionHouse,
                    style: const TextStyle(color: AppTheme.accentGold, fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 16),

                  // Character synopsis
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.bgSurface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.borderSubtle),
                    ),
                    child: Text(
                      widget.casting.characterDescription,
                      style: theme.textTheme.bodyMedium?.copyWith(color: AppTheme.textPrimary),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Headshot selection
                  const Text("Attach Verified Headshot", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 8),
                  Row(
                    children: List.generate(_headshots.length, (index) {
                      final isSelected = _selectedHeadshotIndex == index;
                      return GestureDetector(
                        onTap: () => setState(() => _selectedHeadshotIndex = index),
                        child: Container(
                          margin: const EdgeInsets.only(right: 12),
                          width: 72,
                          height: 72,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isSelected ? AppTheme.accentGold : AppTheme.borderSubtle,
                              width: isSelected ? 2.5 : 1,
                            ),
                            image: DecorationImage(
                              image: NetworkImage(_headshots[index]),
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 20),

                  // Self-Tape input
                  const Text("Self-Tape Video (CloudFront S3 or Vimeo)", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _selfTapeCtrl,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: AppTheme.bgSurface,
                      hintText: "https://cineconnect.media/tapes/monologue.mp4",
                      hintStyle: const TextStyle(color: AppTheme.textMuted),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: AppTheme.borderSubtle),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Cover Note
                  const Text("Note to Casting Director", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _coverNoteCtrl,
                    maxLines: 2,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      filled: true,
                      fillColor: AppTheme.bgSurface,
                      contentPadding: const EdgeInsets.all(12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: AppTheme.borderSubtle),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Availability Checkbox
                  Row(
                    children: [
                      Checkbox(
                        value: _agreedToDates,
                        activeColor: AppTheme.accentGold,
                        onChanged: (val) => setState(() => _agreedToDates = val ?? false),
                      ),
                      Expanded(
                        child: Text(
                          "I confirm availability for ${widget.casting.shootDates} in ${widget.casting.location}.",
                          style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Submit button
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: _isSubmitting || !_agreedToDates ? null : _handleSubmit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.accentGold,
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 4,
                      ),
                      child: _isSubmitting
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                            )
                          : const Text("Submit 1-Click Audition 🎬", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
