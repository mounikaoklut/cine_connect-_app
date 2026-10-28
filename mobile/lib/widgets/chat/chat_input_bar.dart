import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/app_theme.dart';
import '../../models/chat_models.dart';

class ChatInputBar extends StatefulWidget {
  final Function(String text) onSendText;
  final Function(int durationSeconds) onSendVoice;
  final Function(String fileName, String type, String url, String size) onSendAttachment;
  final Function(bool isTyping) onTypingChanged;

  const ChatInputBar({
    super.key,
    required this.onSendText,
    required this.onSendVoice,
    required this.onSendAttachment,
    required this.onTypingChanged,
  });

  @override
  State<ChatInputBar> createState() => _ChatInputBarState();
}

class _ChatInputBarState extends State<ChatInputBar> with SingleTickerProviderStateMixin {
  final TextEditingController _textController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  bool _isComposing = false;
  Timer? _typingDebounce;

  // Voice recording state
  bool _isRecordingVoice = false;
  bool _isLockedVoice = false;
  int _recordingSeconds = 0;
  Timer? _recordingTimer;
  double _dragOffset = 0.0;

  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _textController.dispose();
    _focusNode.dispose();
    _typingDebounce?.cancel();
    _recordingTimer?.cancel();
    super.dispose();
  }

  void _handleTextChange(String text) {
    final composing = text.trim().isNotEmpty;
    if (composing != _isComposing) {
      setState(() {
        _isComposing = composing;
      });
    }

    // Debounce typing indicator
    _typingDebounce?.cancel();
    widget.onTypingChanged(true);
    _typingDebounce = Timer(const Duration(milliseconds: 1500), () {
      widget.onTypingChanged(false);
    });
  }

  void _handleSend() {
    final text = _textController.text.trim();
    if (text.isEmpty) return;

    HapticFeedback.lightImpact();
    widget.onSendText(text);
    _textController.clear();
    setState(() {
      _isComposing = false;
    });
    widget.onTypingChanged(false);
  }

  void _startVoiceRecording() {
    HapticFeedback.mediumImpact();
    setState(() {
      _isRecordingVoice = true;
      _isLockedVoice = false;
      _recordingSeconds = 0;
      _dragOffset = 0.0;
    });

    _recordingTimer?.cancel();
    _recordingTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      setState(() {
        _recordingSeconds++;
      });
    });
  }

  void _stopAndSendVoice() {
    if (!_isRecordingVoice) return;
    HapticFeedback.lightImpact();
    final duration = _recordingSeconds;
    _cancelVoiceRecording();
    if (duration >= 1) {
      widget.onSendVoice(duration);
    }
  }

  void _cancelVoiceRecording() {
    _recordingTimer?.cancel();
    setState(() {
      _isRecordingVoice = false;
      _isLockedVoice = false;
      _recordingSeconds = 0;
      _dragOffset = 0.0;
    });
  }

  void _lockVoiceRecording() {
    HapticFeedback.heavyImpact();
    setState(() {
      _isLockedVoice = true;
    });
  }

  void _openAttachmentPicker() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _buildAttachmentPickerSheet(ctx),
    );
  }

  Widget _buildAttachmentPickerSheet(BuildContext ctx) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      decoration: const BoxDecoration(
        color: AppTheme.bgSecondary,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(28),
          topRight: Radius.circular(28),
        ),
        border: Border(
          top: BorderSide(color: AppTheme.borderGlow, width: 1.5),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: AppTheme.textMuted.withOpacity(0.4),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 18),

          Row(
            children: [
              const Icon(Icons.attachment_rounded, color: AppTheme.accentGold, size: 20),
              const SizedBox(width: 8),
              const Text(
                "Share Production Asset",
                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppTheme.accentNeonCyan.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  "AWS S3 + CloudFront",
                  style: TextStyle(color: AppTheme.accentNeonCyan, fontSize: 10, fontWeight: FontWeight.w700),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Options Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildPickerOption(
                icon: Icons.movie_creation_rounded,
                label: "Showreel / Reel",
                color: AppTheme.accentGold,
                onTap: () {
                  Navigator.pop(ctx);
                  widget.onSendAttachment(
                    "Actor_Dramatic_Showreel_2026.mp4",
                    "video",
                    "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80",
                    "18.4 MB",
                  );
                },
              ),
              _buildPickerOption(
                icon: Icons.picture_as_pdf_rounded,
                label: "Screenplay / PDF",
                color: AppTheme.accentRose,
                onTap: () {
                  Navigator.pop(ctx);
                  widget.onSendAttachment(
                    "Sacred_Vows_Scene4_AuditionSides.pdf",
                    "pdf",
                    "https://cloudfront.cineconnect.studio/scripts/Sacred_Vows_Scene4_Sides.pdf",
                    "4.2 MB",
                  );
                },
              ),
              _buildPickerOption(
                icon: Icons.add_photo_alternate_rounded,
                label: "Headshot / Stills",
                color: AppTheme.accentNeonCyan,
                onTap: () {
                  Navigator.pop(ctx);
                  widget.onSendAttachment(
                    "Studio_Headshot_Neutral_Look.jpg",
                    "image",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
                    "3.1 MB",
                  );
                },
              ),
              _buildPickerOption(
                icon: Icons.badge_rounded,
                label: "Actor Resume",
                color: AppTheme.accentEmerald,
                onTap: () {
                  Navigator.pop(ctx);
                  widget.onSendAttachment(
                    "CineConnect_Verified_Credits_Dossier.pdf",
                    "pdf",
                    "https://cloudfront.cineconnect.studio/resumes/credits_dossier.pdf",
                    "1.8 MB",
                  );
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPickerOption({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 58,
            height: 58,
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              shape: BoxShape.circle,
              border: Border.all(color: color.withOpacity(0.4), width: 1.5),
            ),
            child: Icon(icon, color: color, size: 26),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: const TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    return Container(
      padding: EdgeInsets.fromLTRB(10, 8, 10, 8 + (bottomPadding > 0 ? bottomPadding : 6)),
      decoration: BoxDecoration(
        color: AppTheme.bgSecondary,
        border: const Border(
          top: BorderSide(color: AppTheme.borderSubtle, width: 1.2),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.4),
            blurRadius: 12,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: _isRecordingVoice ? _buildVoiceRecordingBar() : _buildStandardInputRow(),
    );
  }

  Widget _buildVoiceRecordingBar() {
    final minutes = (_recordingSeconds ~/ 60).toString().padLeft(1, '0');
    final seconds = (_recordingSeconds % 60).toString().padLeft(2, '0');

    return Row(
      children: [
        // Pulsing Red Mic indicator
        AnimatedBuilder(
          animation: _pulseController,
          builder: (context, child) {
            return Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppTheme.accentRose.withOpacity(0.2 + 0.2 * _pulseController.value),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.mic, color: AppTheme.accentRose, size: 20),
            );
          },
        ),
        const SizedBox(width: 10),

        // Live Timer
        Text(
          "$minutes:$seconds",
          style: const TextStyle(
            color: Colors.white,
            fontSize: 15,
            fontWeight: FontWeight.w700,
            fontFeatures: [FontFeature.tabularFigures()],
          ),
        ),
        const SizedBox(width: 16),

        // Slide to cancel / Lock hint
        Expanded(
          child: _isLockedVoice
              ? const Text(
                  "Recording locked",
                  style: TextStyle(color: AppTheme.accentGold, fontSize: 12, fontWeight: FontWeight.w600),
                )
              : Row(
                  children: [
                    const Icon(Icons.chevron_left_rounded, color: AppTheme.textMuted, size: 18),
                    Text(
                      "Slide left to cancel",
                      style: TextStyle(color: AppTheme.textMuted.withOpacity(0.9), fontSize: 12),
                    ),
                  ],
                ),
        ),

        // Cancel button
        IconButton(
          onPressed: _cancelVoiceRecording,
          icon: const Icon(Icons.delete_outline_rounded, color: AppTheme.accentRose),
          splashRadius: 20,
        ),

        // Send Voice Button
        GestureDetector(
          onTap: _stopAndSendVoice,
          child: Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppTheme.accentGold,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AppTheme.accentGold.withOpacity(0.4),
                  blurRadius: 10,
                ),
              ],
            ),
            child: const Icon(Icons.arrow_upward_rounded, color: Colors.black, size: 24),
          ),
        ),
      ],
    );
  }

  Widget _buildStandardInputRow() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        // Attachment Button
        IconButton(
          onPressed: _openAttachmentPicker,
          icon: const Icon(Icons.add_circle_outline_rounded, color: AppTheme.accentGold),
          splashRadius: 22,
          tooltip: "Attach Showreel or Script",
        ),

        // Text Field Container
        Expanded(
          child: Container(
            constraints: const BoxConstraints(maxHeight: 110),
            decoration: BoxDecoration(
              color: AppTheme.bgSurface,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: AppTheme.borderSubtle),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 14),
            child: TextField(
              controller: _textController,
              focusNode: _focusNode,
              maxLines: null,
              keyboardType: TextInputType.multiline,
              textCapitalization: TextCapitalization.sentences,
              style: const TextStyle(color: Colors.white, fontSize: 14.5),
              cursorColor: AppTheme.accentGold,
              onChanged: _handleTextChange,
              decoration: const InputDecoration(
                hintText: "Write a message...",
                hintStyle: TextStyle(color: AppTheme.textMuted, fontSize: 14),
                border: InputBorder.none,
                isDense: true,
                contentPadding: EdgeInsets.symmetric(vertical: 10),
              ),
            ),
          ),
        ),
        const SizedBox(width: 6),

        // Dynamic Send or Voice Record Button
        if (_isComposing)
          GestureDetector(
            onTap: _handleSend,
            child: Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: AppTheme.accentGold,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.accentGold.withOpacity(0.4),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: const Icon(Icons.send_rounded, color: Colors.black, size: 20),
            ),
          )
        else
          GestureDetector(
            onLongPressStart: (_) => _startVoiceRecording(),
            onLongPressEnd: (_) => _stopAndSendVoice(),
            onLongPressMoveUpdate: (details) {
              // Swipe up to lock or swipe left to cancel
              if (details.offsetFromOrigin.dy < -50 && !_isLockedVoice) {
                _lockVoiceRecording();
              } else if (details.offsetFromOrigin.dx < -80) {
                _cancelVoiceRecording();
              }
            },
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text("Hold the mic to record audio message, or swipe up to lock."),
                  duration: Duration(seconds: 2),
                  backgroundColor: AppTheme.bgSurface,
                ),
              );
            },
            child: Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: const Color(0xFF1E2638),
                shape: BoxShape.circle,
                border: Border.all(color: AppTheme.borderSubtle),
              ),
              child: const Icon(Icons.mic_none_rounded, color: AppTheme.accentGold, size: 22),
            ),
          ),
      ],
    );
  }
}
