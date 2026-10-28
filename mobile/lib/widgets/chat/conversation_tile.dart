import 'dart:ui';
import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../models/chat_models.dart';

class ConversationTile extends StatelessWidget {
  final ChatConversation conversation;
  final VoidCallback onTap;

  const ConversationTile({
    super.key,
    required this.conversation,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final p = conversation.participant;
    final lastMsg = conversation.lastMessage;
    final hasUnread = conversation.unreadCount > 0;

    return InkWell(
      onTap: onTap,
      splashColor: AppTheme.accentGold.withOpacity(0.08),
      highlightColor: AppTheme.bgSurface.withOpacity(0.5),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: AppTheme.borderSubtle.withOpacity(0.5),
              width: 0.8,
            ),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Avatar with Presence indicator
            _buildAvatarWithPresence(p),

            const SizedBox(width: 14),

            // Content details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Top line: Name + Verified + Time
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          p.name,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 15,
                            fontWeight: hasUnread ? FontWeight.w800 : FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (p.isVerified) ...[
                        const SizedBox(width: 4),
                        const Icon(
                          Icons.verified_rounded,
                          color: AppTheme.accentGold,
                          size: 15,
                        ),
                      ],
                      const SizedBox(width: 8),
                      Text(
                        _formatRelativeTime(conversation.updatedAt),
                        style: TextStyle(
                          color: hasUnread ? AppTheme.accentGold : AppTheme.textMuted,
                          fontSize: 11,
                          fontWeight: hasUnread ? FontWeight.w700 : FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),

                  // Project Tag Pill (if linked to audition/project)
                  if (conversation.projectTag != null) ...[
                    Container(
                      margin: const EdgeInsets.only(bottom: 4),
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppTheme.accentGold.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(
                          color: AppTheme.accentGold.withOpacity(0.2),
                          width: 0.8,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.movie_filter_outlined, size: 10, color: AppTheme.accentGold),
                          const SizedBox(width: 4),
                          Flexible(
                            child: Text(
                              conversation.projectTag!,
                              style: const TextStyle(
                                color: AppTheme.accentGoldLight,
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  // Last message snippet & Unread count badge
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          _buildPreviewSnippet(lastMsg),
                          style: TextStyle(
                            color: hasUnread ? Colors.white : AppTheme.textSecondary,
                            fontSize: 13,
                            fontWeight: hasUnread ? FontWeight.w600 : FontWeight.w400,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (hasUnread) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppTheme.accentGold,
                            borderRadius: BorderRadius.circular(10),
                            boxShadow: [
                              BoxShadow(
                                color: AppTheme.accentGold.withOpacity(0.4),
                                blurRadius: 6,
                              ),
                            ],
                          ),
                          child: Text(
                            "${conversation.unreadCount}",
                            style: const TextStyle(
                              color: Colors.black,
                              fontSize: 11,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAvatarWithPresence(ChatParticipant p) {
    return Stack(
      children: [
        Container(
          width: 52,
          height: 52,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: p.isProductionHouse ? AppTheme.accentGold.withOpacity(0.5) : AppTheme.borderSubtle,
              width: 1.5,
            ),
          ),
          child: ClipOval(
            child: Image.network(
              p.avatarUrl,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                color: AppTheme.bgSurface,
                child: Center(
                  child: Icon(
                    p.isProductionHouse ? Icons.business_rounded : Icons.person_rounded,
                    color: AppTheme.accentGold,
                    size: 26,
                  ),
                ),
              ),
            ),
          ),
        ),
        Positioned(
          bottom: 1,
          right: 1,
          child: Container(
            width: 13,
            height: 13,
            decoration: BoxDecoration(
              color: p.isOnline ? AppTheme.accentEmerald : const Color(0xFF64748B),
              shape: BoxShape.circle,
              border: Border.all(color: AppTheme.bgPrimary, width: 2.2),
            ),
          ),
        ),
      ],
    );
  }

  String _buildPreviewSnippet(ChatMessage msg) {
    final prefix = msg.isFromTalent ? "You: " : "";
    switch (msg.type) {
      case MessageType.voice:
        return "${prefix}🎤 Voice Note (${msg.mediaDurationSeconds ?? 30}s)";
      case MessageType.media:
        return "${prefix}📎 Attachment: ${msg.mediaFileName ?? "Media file"}";
      case MessageType.auditionCard:
        return "${prefix}🎬 Audition Callout: ${msg.auditionCallout?.roleTitle ?? "Details"}";
      case MessageType.systemEvent:
        return "✨ ${msg.content}";
      case MessageType.text:
      default:
        return "$prefix${msg.content}";
    }
  }

  String _formatRelativeTime(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1) {
      return "Just now";
    }
    if (diff.inMinutes < 60) {
      return "${diff.inMinutes}m";
    }
    if (diff.inHours < 24) {
      return "${diff.inHours}h";
    }
    if (diff.inDays == 1) {
      return "Yesterday";
    }
    if (diff.inDays < 7) {
      return "${diff.inDays}d";
    }
    return "${dt.day}/${dt.month}";
  }
}
