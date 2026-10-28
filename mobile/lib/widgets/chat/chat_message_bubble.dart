import 'dart:math';
import 'dart:ui';
import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../models/chat_models.dart';
import 'media_preview_modal.dart';

class ChatMessageBubble extends StatefulWidget {
  final ChatMessage message;
  final VoidCallback? onAuditionTap;

  const ChatMessageBubble({
    super.key,
    required this.message,
    this.onAuditionTap,
  });

  @override
  State<ChatMessageBubble> createState() => _ChatMessageBubbleState();
}

class _ChatMessageBubbleState extends State<ChatMessageBubble> {
  // Voice note playback simulation state
  bool _isPlayingVoice = false;
  double _voiceProgress = 0.0;
  List<double>? _cachedWaveformHeights;

  @override
  void initState() {
    super.initState();
    if (widget.message.type == MessageType.voice) {
      // Generate deterministic pseudo-random waveform bars based on message id
      final rnd = Random(widget.message.id.hashCode);
      _cachedWaveformHeights = List.generate(24, (index) => 6.0 + rnd.nextDouble() * 22.0);
    }
  }

  void _toggleVoicePlayback() {
    setState(() {
      _isPlayingVoice = !_isPlayingVoice;
    });

    if (_isPlayingVoice) {
      _simulateVoiceProgress();
    }
  }

  void _simulateVoiceProgress() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (!mounted || !_isPlayingVoice) return;
      setState(() {
        _voiceProgress += 0.03;
        if (_voiceProgress >= 1.0) {
          _voiceProgress = 0.0;
          _isPlayingVoice = false;
        } else {
          _simulateVoiceProgress();
        }
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    // 1. System Event Card (Centered chip)
    if (widget.message.type == MessageType.systemEvent) {
      return _buildSystemEventChip();
    }

    final isMe = widget.message.isFromTalent;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
      child: Row(
        mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // If counter-party, show small avatar
          if (!isMe) ...[
            CircleAvatar(
              radius: 14,
              backgroundColor: AppTheme.bgSurface,
              backgroundImage: widget.message.senderAvatar != null
                  ? NetworkImage(widget.message.senderAvatar!)
                  : null,
              child: widget.message.senderAvatar == null
                  ? const Icon(Icons.movie_creation_outlined, size: 14, color: AppTheme.accentGold)
                  : null,
            ),
            const SizedBox(width: 8),
          ],

          // Bubble Container
          Flexible(
            child: Container(
              constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width * 0.78,
              ),
              decoration: BoxDecoration(
                color: isMe ? const Color(0xFF161C28) : const Color(0xFF0F131C),
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(18),
                  topRight: const Radius.circular(18),
                  bottomLeft: Radius.circular(isMe ? 18 : 4),
                  bottomRight: Radius.circular(isMe ? 4 : 18),
                ),
                border: Border.all(
                  color: isMe
                      ? AppTheme.accentGold.withOpacity(0.24)
                      : const Color(0xFF334155),
                  width: 1.2,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(isMe ? 0.45 : 0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(18),
                  topRight: const Radius.circular(18),
                  bottomLeft: Radius.circular(isMe ? 18 : 4),
                  bottomRight: Radius.circular(isMe ? 4 : 18),
                ),
                child: Padding(
                  padding: _getBubblePadding(),
                  child: Column(
                    crossAxisAlignment:
                        isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Sender Name header for group/production left bubbles
                      if (!isMe && widget.message.senderName.isNotEmpty) ...[
                        Text(
                          widget.message.senderName,
                          style: const TextStyle(
                            color: AppTheme.accentGold,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.2,
                          ),
                        ),
                        const SizedBox(height: 4),
                      ],

                      // Message Body based on type
                      _buildMessageContent(context),

                      const SizedBox(height: 4),

                      // Timestamp and Status Indicators (Receipt)
                      _buildTimestampAndReceipt(isMe),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  EdgeInsets _getBubblePadding() {
    if (widget.message.type == MessageType.auditionCard) {
      return const EdgeInsets.all(10);
    }
    if (widget.message.type == MessageType.media) {
      return const EdgeInsets.all(8);
    }
    return const EdgeInsets.fromLTRB(14, 10, 14, 8);
  }

  Widget _buildSystemEventChip() {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 14, horizontal: 24),
      alignment: Alignment.center,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: AppTheme.bgSecondary.withOpacity(0.9),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppTheme.accentGold.withOpacity(0.35), width: 1),
          boxShadow: [
            BoxShadow(
              color: AppTheme.accentGold.withOpacity(0.08),
              blurRadius: 10,
              spreadRadius: 1,
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.stars_rounded, color: AppTheme.accentGold, size: 16),
            const SizedBox(width: 8),
            Flexible(
              child: Text(
                widget.message.content,
                style: const TextStyle(
                  color: AppTheme.accentGoldLight,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.2,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageContent(BuildContext context) {
    switch (widget.message.type) {
      case MessageType.voice:
        return _buildVoiceNoteContent();

      case MessageType.media:
        return _buildMediaContent(context);

      case MessageType.auditionCard:
        return _buildAuditionCalloutContent(context);

      case MessageType.text:
      default:
        return _buildTextContent();
    }
  }

  Widget _buildTextContent() {
    final text = widget.message.content;
    // Highlight URLs or standard text
    final isUrl = text.contains("http://") || text.contains("https://") || text.contains("www.");

    return Text(
      text,
      style: TextStyle(
        color: isUrl ? AppTheme.accentNeonCyan : Colors.white,
        fontSize: 14.5,
        height: 1.4,
        fontWeight: FontWeight.w400,
        decoration: isUrl ? TextDecoration.underline : TextDecoration.none,
      ),
    );
  }

  // Voice Note player bubble with waveform scrubbing & timer
  Widget _buildVoiceNoteContent() {
    final totalDuration = widget.message.mediaDurationSeconds ?? 35;
    final currentSec = (_voiceProgress * totalDuration).floor();
    final totalMinStr = (totalDuration ~/ 60).toString().padLeft(1, '0');
    final totalSecStr = (totalDuration % 60).toString().padLeft(2, '0');
    final curMinStr = (currentSec ~/ 60).toString().padLeft(1, '0');
    final curSecStr = (currentSec % 60).toString().padLeft(2, '0');

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.message.content.isNotEmpty) ...[
          Text(
            widget.message.content,
            style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
          ),
          const SizedBox(height: 8),
        ],
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.35),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppTheme.borderSubtle),
          ),
          child: Row(
            children: [
              // Play/Pause circular icon
              GestureDetector(
                onTap: _toggleVoicePlayback,
                child: Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: AppTheme.accentGold,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.accentGold.withOpacity(0.3),
                        blurRadius: 8,
                      ),
                    ],
                  ),
                  child: Icon(
                    _isPlayingVoice ? Icons.pause_rounded : Icons.play_arrow_rounded,
                    color: Colors.black,
                    size: 24,
                  ),
                ),
              ),
              const SizedBox(width: 10),

              // Waveform Bars & scrubber
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(
                      height: 28,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: List.generate(_cachedWaveformHeights?.length ?? 20, (index) {
                          final barHeight = _cachedWaveformHeights?[index] ?? 12.0;
                          final fraction = index / (_cachedWaveformHeights?.length ?? 20);
                          final isPlayed = fraction <= _voiceProgress;

                          return Container(
                            width: 3,
                            height: barHeight,
                            decoration: BoxDecoration(
                              color: isPlayed ? AppTheme.accentGold : const Color(0xFF475569),
                              borderRadius: BorderRadius.circular(2),
                            ),
                          );
                        }),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          _isPlayingVoice ? "$curMinStr:$curSecStr" : "$totalMinStr:$totalSecStr",
                          style: const TextStyle(
                            color: AppTheme.accentGoldLight,
                            fontSize: 10.5,
                            fontFeatures: [FontFeature.tabularFigures()],
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        Row(
                          children: [
                            const Icon(Icons.mic, size: 10, color: AppTheme.textMuted),
                            const SizedBox(width: 3),
                            Text(
                              "Voice Note",
                              style: TextStyle(
                                color: AppTheme.textMuted.withOpacity(0.9),
                                fontSize: 10,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // Media Attachment Card (Thumbnails, PDF Screenplays, Showreels)
  Widget _buildMediaContent(BuildContext context) {
    final fileName = widget.message.mediaFileName ?? "Production_Asset";
    final isPdf = fileName.endsWith('.pdf') || (widget.message.mediaUrl?.contains('.pdf') ?? false);
    final isVideo = fileName.endsWith('.mp4') || fileName.endsWith('.mov') || (widget.message.mediaUrl?.contains('.mp4') ?? false);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.message.content.isNotEmpty) ...[
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
            child: Text(
              widget.message.content,
              style: const TextStyle(color: Colors.white, fontSize: 14, height: 1.4),
            ),
          ),
          const SizedBox(height: 6),
        ],

        // Media Clickable Card
        GestureDetector(
          onTap: () {
            MediaPreviewModal.show(
              context,
              title: fileName,
              subtitle: "Shared by ${widget.message.senderName}",
              mediaUrl: widget.message.mediaUrl ?? widget.message.mediaThumbnailUrl,
              mediaType: isPdf ? 'pdf' : (isVideo ? 'video' : 'image'),
              fileName: fileName,
              fileSize: widget.message.mediaFileSize,
            );
          },
          child: Container(
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.4),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppTheme.borderSubtle),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: isPdf
                  ? _buildPdfPreviewTile(fileName)
                  : _buildImageOrVideoPreview(isVideo),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPdfPreviewTile(String fileName) {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppTheme.accentRose.withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppTheme.accentRose.withOpacity(0.35)),
            ),
            child: const Icon(Icons.picture_as_pdf_rounded, color: AppTheme.accentRose, size: 24),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  fileName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 3),
                Row(
                  children: [
                    Text(
                      widget.message.mediaFileSize ?? "PDF Script",
                      style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                    ),
                    const SizedBox(width: 6),
                    const Text("•", style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                    const SizedBox(width: 6),
                    const Text(
                      "Tap to preview",
                      style: TextStyle(color: AppTheme.accentGold, fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Icon(Icons.arrow_forward_ios_rounded, color: AppTheme.textMuted, size: 14),
        ],
      ),
    );
  }

  Widget _buildImageOrVideoPreview(bool isVideo) {
    final imgUrl = widget.message.mediaThumbnailUrl ??
        widget.message.mediaUrl ??
        "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80";

    return Stack(
      children: [
        Image.network(
          imgUrl,
          height: 170,
          width: double.infinity,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => Container(
            height: 170,
            color: AppTheme.bgSurface,
            child: const Center(
              child: Icon(Icons.movie_creation_outlined, color: AppTheme.accentGold, size: 36),
            ),
          ),
        ),
        Container(
          height: 170,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Colors.transparent, Colors.black.withOpacity(0.65)],
            ),
          ),
        ),
        if (isVideo)
          Positioned.fill(
            child: Center(
              child: Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.accentGold.withOpacity(0.9),
                  boxShadow: const [BoxShadow(color: Colors.black54, blurRadius: 10)],
                ),
                child: const Icon(Icons.play_arrow_rounded, color: Colors.black, size: 28),
              ),
            ),
          ),
        Positioned(
          bottom: 8,
          left: 10,
          right: 10,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                widget.message.mediaFileName ?? (isVideo ? "Showreel Reel" : "Photo Attachment"),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  shadows: [Shadow(color: Colors.black, blurRadius: 4)],
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              if (widget.message.mediaFileSize != null)
                Text(
                  widget.message.mediaFileSize!,
                  style: const TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 10,
                    fontWeight: FontWeight.w500,
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  // Audition / Job Callout Card
  Widget _buildAuditionCalloutContent(BuildContext context) {
    final callout = widget.message.auditionCallout;
    if (callout == null) {
      return Text(widget.message.content, style: const TextStyle(color: Colors.white));
    }

    return Container(
      decoration: BoxDecoration(
        color: AppTheme.bgSecondary,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.accentGold.withOpacity(0.4), width: 1.2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner & Role Header
          if (callout.bannerUrl != null)
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
              child: Stack(
                children: [
                  Image.network(
                    callout.bannerUrl!,
                    height: 100,
                    width: double.infinity,
                    fit: BoxFit.cover,
                  ),
                  Container(
                    height: 100,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [Colors.transparent, Colors.black.withOpacity(0.8)],
                      ),
                    ),
                  ),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppTheme.accentGold,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        "OFFICIAL CALL",
                        style: TextStyle(color: Colors.black, fontSize: 9.5, fontWeight: FontWeight.w900),
                      ),
                    ),
                  ),
                ],
              ),
            ),

          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  callout.roleTitle,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  callout.projectTitle,
                  style: const TextStyle(
                    color: AppTheme.accentGoldLight,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),

                // Details List
                _buildCalloutDetailRow(Icons.calendar_today_rounded, callout.auditionDate),
                const SizedBox(height: 4),
                _buildCalloutDetailRow(Icons.place_rounded, callout.location),
                const SizedBox(height: 4),
                _buildCalloutDetailRow(Icons.payments_rounded, callout.payRange),

                const SizedBox(height: 10),

                // Action Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: widget.onAuditionTap,
                    icon: const Icon(Icons.assignment_turned_in_rounded, size: 16),
                    label: const Text("View Audition Details"),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.accentGold,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCalloutDetailRow(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 13, color: AppTheme.textMuted),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              color: AppTheme.textSecondary,
              fontSize: 11.5,
              fontWeight: FontWeight.w500,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  // Delivery status receipts (single check, double check, double gold check)
  Widget _buildTimestampAndReceipt(bool isMe) {
    final timeStr = _formatTimestamp(widget.message.timestamp);

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          timeStr,
          style: const TextStyle(
            color: AppTheme.textMuted,
            fontSize: 10,
            fontFeatures: [FontFeature.tabularFigures()],
          ),
        ),
        if (isMe) ...[
          const SizedBox(width: 4),
          _buildReceiptIcon(widget.message.status),
        ],
      ],
    );
  }

  Widget _buildReceiptIcon(MessageDeliveryStatus status) {
    switch (status) {
      case MessageDeliveryStatus.sending:
        return const SizedBox(
          width: 10,
          height: 10,
          child: CircularProgressIndicator(
            strokeWidth: 1.5,
            valueColor: AlwaysStoppedAnimation<Color>(AppTheme.textMuted),
          ),
        );

      case MessageDeliveryStatus.sent:
        // Single check
        return const Icon(
          Icons.check,
          size: 13,
          color: AppTheme.textMuted,
        );

      case MessageDeliveryStatus.delivered:
        // Double check (slate)
        return const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.done_all, size: 13, color: AppTheme.textSecondary),
          ],
        );

      case MessageDeliveryStatus.read:
        // Double gold check
        return const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.done_all, size: 13, color: AppTheme.accentGold),
          ],
        );
    }
  }

  String _formatTimestamp(DateTime dt) {
    final hour = dt.hour > 12 ? dt.hour - 12 : (dt.hour == 0 ? 12 : dt.hour);
    final period = dt.hour >= 12 ? 'PM' : 'AM';
    final minute = dt.minute.toString().padLeft(2, '0');
    return "$hour:$minute $period";
  }
}
