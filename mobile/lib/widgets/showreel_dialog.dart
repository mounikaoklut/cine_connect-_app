import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/models.dart';

class ShowreelDialog extends StatefulWidget {
  final Talent talent;

  const ShowreelDialog({super.key, required this.talent});

  @override
  State<ShowreelDialog> createState() => _ShowreelDialogState();
}

class _ShowreelDialogState extends State<ShowreelDialog> {
  bool _isPlaying = true;
  String _timecode = "01:24:18:04";
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(milliseconds: 400), (_) {
      if (_isPlaying && mounted) {
        final sec = Random().nextInt(60).toString().padLeft(2, '0');
        final fr = Random().nextInt(24).toString().padLeft(2, '0');
        setState(() => _timecode = "01:24:$sec:$fr");
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      child: Container(
        decoration: BoxDecoration(
          color: AppTheme.bgPrimary,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppTheme.accentGold.withOpacity(0.4)),
        ),
        clipBehavior: Clip.antiAlias,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Anamorphic 2.39:1 Video Frame
              AspectRatio(
                aspectRatio: 2.39 / 1,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.network(
                      widget.talent.featuredReelUrl,
                      fit: BoxFit.cover,
                      color: _isPlaying ? null : Colors.black54,
                      colorBlendMode: _isPlaying ? null : BlendMode.darken,
                    ),

                    // Top Indicators
                    Positioned(
                      top: 10,
                      left: 12,
                      right: 12,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppTheme.accentRose.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(4),
                                  border: Border.all(color: AppTheme.accentRose),
                                ),
                                child: const Row(
                                  children: [
                                    Icon(Icons.circle, color: AppTheme.accentRose, size: 8),
                                    SizedBox(width: 4),
                                    Text("REC", style: TextStyle(color: AppTheme.accentRose, fontSize: 10, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: Colors.black54,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  _timecode,
                                  style: const TextStyle(color: Colors.white, fontSize: 10, fontFamily: 'monospace'),
                                ),
                              ),
                            ],
                          ),
                          GestureDetector(
                            onTap: () => Navigator.pop(context),
                            child: const CircleAvatar(
                              radius: 14,
                              backgroundColor: Colors.black54,
                              child: Icon(Icons.close, color: Colors.white, size: 16),
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Center Play / Pause
                    Center(
                      child: GestureDetector(
                        onTap: () => setState(() => _isPlaying = !_isPlaying),
                        child: CircleAvatar(
                          radius: 28,
                          backgroundColor: AppTheme.accentGold.withOpacity(0.9),
                          child: Icon(
                            _isPlaying ? Icons.pause : Icons.play_arrow,
                            color: Colors.black,
                            size: 32,
                          ),
                        ),
                      ),
                    ),

                    // Bottom info bar
                    Positioned(
                      bottom: 8,
                      left: 12,
                      right: 12,
                      child: Text(
                        widget.talent.featuredReelTitle,
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),

              // Talent Profile Details
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 24,
                          backgroundImage: NetworkImage(widget.talent.avatar),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    widget.talent.name,
                                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                                  ),
                                  if (widget.talent.verified) ...[
                                    const SizedBox(width: 4),
                                    const Icon(Icons.check_circle, color: AppTheme.accentGold, size: 16),
                                  ],
                                ],
                              ),
                              Text(
                                "${widget.talent.craft} • ${widget.talent.city}",
                                style: const TextStyle(fontSize: 12, color: AppTheme.accentGold),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    Text(
                      widget.talent.bio,
                      style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary, height: 1.4),
                    ),
                    const SizedBox(height: 14),

                    // Accolade
                    if (widget.talent.accolades != null) ...[
                      Row(
                        children: [
                          const Icon(Icons.emoji_events, color: AppTheme.accentGoldLight, size: 16),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              widget.talent.accolades!,
                              style: const TextStyle(color: AppTheme.accentGoldLight, fontSize: 12, fontWeight: FontWeight.w600),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                    ],

                    // Gear / Skills Chips
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: [
                        ...?widget.talent.gear?.map((g) => Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppTheme.accentNeonCyan.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: AppTheme.accentNeonCyan.withOpacity(0.3)),
                          ),
                          child: Text(g, style: const TextStyle(color: AppTheme.accentNeonCyan, fontSize: 11)),
                        )),
                        ...widget.talent.skills.take(3).map((s) => Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: Colors.white10,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(s, style: const TextStyle(color: Colors.white70, fontSize: 11)),
                        )),
                      ],
                    ),
                    const SizedBox(height: 18),

                    // Inquiry Button
                    SizedBox(
                      width: double.infinity,
                      height: 44,
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text("Direct inquiry initiated with ${widget.talent.name}!"),
                              backgroundColor: AppTheme.accentGoldDark,
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.accentGold,
                          foregroundColor: Colors.black,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: const Text("Inquire Availability & Book 🎬", style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
