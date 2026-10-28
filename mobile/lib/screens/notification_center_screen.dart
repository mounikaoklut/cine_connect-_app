import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/theme/app_theme.dart';
import '../models/notification_model.dart';
import '../services/notification_service.dart';

class NotificationCenterScreen extends StatefulWidget {
  final Function(String route)? onNavigateRoute;

  const NotificationCenterScreen({
    super.key,
    this.onNavigateRoute,
  });

  @override
  State<NotificationCenterScreen> createState() => _NotificationCenterScreenState();
}

class _NotificationCenterScreenState extends State<NotificationCenterScreen> {
  String _activeFilter = "all"; // 'all', 'unread', 'career', 'messages'

  @override
  void initState() {
    super.initState();
    NotificationService.instance.fetchNotifications();
  }

  Future<void> _onRefresh() async {
    await NotificationService.instance.fetchNotifications(filter: _activeFilter);
  }

  void _handleNotificationTap(AppNotification notif) {
    NotificationService.instance.markAsRead(notif.id);

    final route = notif.deepLinkRoute;
    if (route != null && route.isNotEmpty) {
      if (widget.onNavigateRoute != null) {
        widget.onNavigateRoute!(route);
        Navigator.pop(context);
        return;
      }

      // Default deep link routing feedback
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Routing to: $route"),
          backgroundColor: AppTheme.accentGoldDark,
          action: SnackBarAction(
            label: "DISMISS",
            textColor: Colors.black,
            onPressed: () {},
          ),
        ),
      );
    }
  }

  Map<String, List<AppNotification>> _groupNotificationsByDate(List<AppNotification> items) {
    final Map<String, List<AppNotification>> groups = {
      "Today": [],
      "Yesterday": [],
      "Earlier": [],
    };

    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));

    for (var item in items) {
      final itemDate = DateTime(item.createdAt.year, item.createdAt.month, item.createdAt.day);
      if (itemDate.isAtSameMomentAs(today)) {
        groups["Today"]!.add(item);
      } else if (itemDate.isAtSameMomentAs(yesterday)) {
        groups["Yesterday"]!.add(item);
      } else {
        groups["Earlier"]!.add(item);
      }
    }

    return groups;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Notification Center",
          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18),
        ),
        actions: [
          // WebSocket connection status indicator
          ValueListenableBuilder<bool>(
            valueListenable: NotificationService.instance.isConnectedNotifier,
            builder: (context, isConnected, _) {
              return Container(
                margin: const EdgeInsets.symmetric(vertical: 18),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: isConnected ? AppTheme.accentEmerald.withOpacity(0.15) : Colors.white10,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: isConnected ? AppTheme.accentEmerald : Colors.white24,
                    width: 0.8,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: isConnected ? AppTheme.accentEmerald : Colors.amber,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      isConnected ? "Live WS" : "Syncing",
                      style: TextStyle(
                        color: isConnected ? AppTheme.accentEmerald : Colors.white70,
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
          const SizedBox(width: 4),
          TextButton(
            onPressed: () {
              NotificationService.instance.markAllAsRead();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text("All notifications marked as read"),
                  backgroundColor: AppTheme.accentEmerald,
                  duration: Duration(seconds: 2),
                ),
              );
            },
            child: const Text(
              "Mark All Read",
              style: TextStyle(color: AppTheme.accentGold, fontSize: 12, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: Column(
        children: [
          // Filter Chips Row
          Container(
            height: 48,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _buildFilterChip("all", "All"),
                _buildFilterChip("unread", "Unread"),
                _buildFilterChip("career", "🎭 Auditions & Offers"),
                _buildFilterChip("messages", "💬 Messages"),
              ],
            ),
          ),
          const Divider(height: 1, color: AppTheme.borderSubtle),

          // Main Notifications Feed
          Expanded(
            child: ValueListenableBuilder<List<AppNotification>>(
              valueListenable: NotificationService.instance.notificationsNotifier,
              builder: (context, allNotifs, _) {
                // Apply active filter
                List<AppNotification> filtered = allNotifs;
                if (_activeFilter == "unread") {
                  filtered = allNotifs.where((n) => !n.isRead).toList();
                } else if (_activeFilter == "career") {
                  filtered = allNotifs.where((n) => n.isCareerUpdate).toList();
                } else if (_activeFilter == "messages") {
                  filtered = allNotifs.where((n) => n.notificationType == NotificationType.DIRECT_MESSAGE).toList();
                }

                if (filtered.isEmpty) {
                  return _buildEmptyState();
                }

                final grouped = _groupNotificationsByDate(filtered);

                return RefreshIndicator(
                  color: AppTheme.accentGold,
                  backgroundColor: AppTheme.bgSecondary,
                  onRefresh: _onRefresh,
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    children: [
                      if (grouped["Today"]!.isNotEmpty) ...[
                        _buildSectionHeader("TODAY", grouped["Today"]!.length),
                        ...grouped["Today"]!.map((n) => _buildNotificationCard(n)),
                        const SizedBox(height: 12),
                      ],
                      if (grouped["Yesterday"]!.isNotEmpty) ...[
                        _buildSectionHeader("YESTERDAY", grouped["Yesterday"]!.length),
                        ...grouped["Yesterday"]!.map((n) => _buildNotificationCard(n)),
                        const SizedBox(height: 12),
                      ],
                      if (grouped["Earlier"]!.isNotEmpty) ...[
                        _buildSectionHeader("EARLIER", grouped["Earlier"]!.length),
                        ...grouped["Earlier"]!.map((n) => _buildNotificationCard(n)),
                      ],
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String key, String label) {
    final isSelected = _activeFilter == key;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (val) {
          if (val) setState(() => _activeFilter = key);
        },
        selectedColor: AppTheme.accentGold,
        backgroundColor: AppTheme.bgSecondary,
        labelStyle: TextStyle(
          color: isSelected ? Colors.black : Colors.white70,
          fontWeight: isSelected ? FontWeight.w800 : FontWeight.normal,
          fontSize: 12,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: BorderSide(
            color: isSelected ? AppTheme.accentGold : AppTheme.borderSubtle,
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, int count) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
      child: Row(
        children: [
          Text(
            title,
            style: const TextStyle(
              color: AppTheme.textMuted,
              fontWeight: FontWeight.w800,
              fontSize: 11,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(width: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
            decoration: BoxDecoration(
              color: AppTheme.bgSurface,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              count.toString(),
              style: const TextStyle(color: AppTheme.textSecondary, fontSize: 10, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationCard(AppNotification notif) {
    final isSelectedOffer = notif.isCareerUpdate && notif.careerStatus == "SELECTED";

    return Dismissible(
      key: Key(notif.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        margin: const EdgeInsets.only(bottom: 10),
        decoration: BoxDecoration(
          color: AppTheme.accentEmerald.withOpacity(0.8),
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            Text("Mark Read", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 12)),
            SizedBox(width: 8),
            Icon(Icons.check, color: Colors.white, size: 20),
          ],
        ),
      ),
      onDismissed: (_) {
        NotificationService.instance.markAsRead(notif.id);
        HapticFeedback.lightImpact();
      },
      child: GestureDetector(
        onTap: () => _handleNotificationTap(notif),
        child: Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: notif.isRead
                ? AppTheme.bgSecondary
                : isSelectedOffer
                    ? const Color(0xFFF59E0B).withOpacity(0.08)
                    : AppTheme.bgSurface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isSelectedOffer
                  ? AppTheme.accentGold.withOpacity(0.5)
                  : notif.isRead
                      ? AppTheme.borderSubtle
                      : AppTheme.accentGold.withOpacity(0.3),
              width: notif.isRead ? 1 : 1.3,
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildTypeIcon(notif),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            notif.title,
                            style: TextStyle(
                              fontWeight: notif.isRead ? FontWeight.w600 : FontWeight.w800,
                              fontSize: 14,
                              color: isSelectedOffer ? AppTheme.accentGoldLight : Colors.white,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          notif.timeAgoFormatted,
                          style: const TextStyle(color: AppTheme.textMuted, fontSize: 10),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      notif.body,
                      style: TextStyle(
                        fontSize: 12,
                        color: notif.isRead ? AppTheme.textMuted : AppTheme.textSecondary,
                        height: 1.4,
                      ),
                    ),
                    if (notif.deepLinkRoute != null) ...[
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Text(
                            "View Details",
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: isSelectedOffer ? AppTheme.accentGold : AppTheme.accentNeonCyan,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Icon(
                            Icons.arrow_forward_rounded,
                            size: 12,
                            color: isSelectedOffer ? AppTheme.accentGold : AppTheme.accentNeonCyan,
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
              if (!notif.isRead)
                Container(
                  margin: const EdgeInsets.only(left: 8, top: 4),
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: isSelectedOffer ? AppTheme.accentGold : AppTheme.accentRose,
                    shape: BoxShape.circle,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTypeIcon(AppNotification notif) {
    IconData iconData = Icons.notifications_rounded;
    Color iconColor = AppTheme.accentGold;
    Color bgColor = AppTheme.accentGold.withOpacity(0.15);

    switch (notif.notificationType) {
      case NotificationType.APPLICATION_STATUS:
        if (notif.careerStatus == "SELECTED") {
          iconData = Icons.celebration_rounded;
          iconColor = AppTheme.accentGold;
          bgColor = AppTheme.accentGold.withOpacity(0.25);
        } else if (notif.careerStatus == "UNDER_REVIEW") {
          iconData = Icons.hourglass_top_rounded;
          iconColor = Colors.amber;
          bgColor = Colors.amber.withOpacity(0.18);
        } else {
          iconData = Icons.archive_outlined;
          iconColor = AppTheme.textMuted;
          bgColor = Colors.white10;
        }
        break;
      case NotificationType.INTERVIEW_SCHEDULE:
        iconData = Icons.event_available_rounded;
        iconColor = AppTheme.accentNeonCyan;
        bgColor = AppTheme.accentNeonCyan.withOpacity(0.15);
        break;
      case NotificationType.DIRECT_MESSAGE:
        iconData = Icons.chat_bubble_rounded;
        iconColor = AppTheme.accentEmerald;
        bgColor = AppTheme.accentEmerald.withOpacity(0.15);
        break;
      case NotificationType.CASTING_ALERT:
        iconData = Icons.bolt_rounded;
        iconColor = Colors.purpleAccent;
        bgColor = Colors.purpleAccent.withOpacity(0.15);
        break;
      case NotificationType.SYSTEM:
      default:
        iconData = Icons.info_outline_rounded;
        iconColor = AppTheme.textSecondary;
        bgColor = Colors.white10;
        break;
    }

    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: bgColor,
        shape: BoxShape.circle,
      ),
      child: Icon(iconData, color: iconColor, size: 18),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppTheme.bgSecondary,
                shape: BoxShape.circle,
                border: Border.all(color: AppTheme.borderSubtle),
              ),
              child: const Icon(
                Icons.mark_email_read_outlined,
                size: 48,
                color: AppTheme.accentGoldLight,
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              "All Caught Up!",
              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: Colors.white),
            ),
            const SizedBox(height: 8),
            const Text(
              "You have no pending notifications in this view.",
              style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
