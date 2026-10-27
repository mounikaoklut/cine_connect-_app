import 'package:flutter/material.dart';

enum NotificationType {
  APPLICATION_STATUS,
  INTERVIEW_SCHEDULE,
  DIRECT_MESSAGE,
  CASTING_ALERT,
  SYSTEM,
}

NotificationType notificationTypeFromString(String typeStr) {
  switch (typeStr.toUpperCase()) {
    case 'APPLICATION_STATUS':
      return NotificationType.APPLICATION_STATUS;
    case 'INTERVIEW_SCHEDULE':
      return NotificationType.INTERVIEW_SCHEDULE;
    case 'DIRECT_MESSAGE':
      return NotificationType.DIRECT_MESSAGE;
    case 'CASTING_ALERT':
      return NotificationType.CASTING_ALERT;
    case 'SYSTEM':
    default:
      return NotificationType.SYSTEM;
  }
}

String notificationTypeToString(NotificationType type) {
  switch (type) {
    case NotificationType.APPLICATION_STATUS:
      return 'APPLICATION_STATUS';
    case NotificationType.INTERVIEW_SCHEDULE:
      return 'INTERVIEW_SCHEDULE';
    case NotificationType.DIRECT_MESSAGE:
      return 'DIRECT_MESSAGE';
    case NotificationType.CASTING_ALERT:
      return 'CASTING_ALERT';
    case NotificationType.SYSTEM:
      return 'SYSTEM';
  }
}

class AppNotification {
  final String id;
  final String userId;
  final String? senderId;
  final String title;
  final String body;
  final NotificationType notificationType;
  final String? deepLinkRoute;
  final Map<String, dynamic> metadataJson;
  bool isRead;
  final DateTime createdAt;

  AppNotification({
    required this.id,
    required this.userId,
    this.senderId,
    required this.title,
    required this.body,
    required this.notificationType,
    this.deepLinkRoute,
    required this.metadataJson,
    this.isRead = false,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id']?.toString() ?? '',
      userId: json['user_id']?.toString() ?? '',
      senderId: json['sender_id']?.toString(),
      title: json['title']?.toString() ?? '',
      body: json['body']?.toString() ?? '',
      notificationType: notificationTypeFromString(json['notification_type']?.toString() ?? 'SYSTEM'),
      deepLinkRoute: json['deep_link_route']?.toString(),
      metadataJson: json['metadata_json'] is Map<String, dynamic>
          ? Map<String, dynamic>.from(json['metadata_json'])
          : {},
      isRead: json['is_read'] == true,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'sender_id': senderId,
      'title': title,
      'body': body,
      'notification_type': notificationTypeToString(notificationType),
      'deep_link_route': deepLinkRoute,
      'metadata_json': metadataJson,
      'is_read': isRead,
      'created_at': createdAt.toIso8601String(),
    };
  }

  bool get isCareerUpdate => notificationType == NotificationType.APPLICATION_STATUS;

  String? get careerStatus => metadataJson['status']?.toString();

  String? get projectTitle => metadataJson['project_title']?.toString() ?? metadataJson['projectTitle']?.toString();

  String? get roleName => metadataJson['role_name']?.toString() ?? metadataJson['roleName']?.toString();

  String? get productionHouse => metadataJson['production_house']?.toString() ?? metadataJson['productionHouse']?.toString();

  String? get directorNote => metadataJson['director_note']?.toString() ?? metadataJson['instructions']?.toString();

  String get timeAgoFormatted {
    final now = DateTime.now();
    final diff = now.difference(createdAt);
    if (diff.inSeconds < 60) return "Just now";
    if (diff.inMinutes < 60) return "${diff.inMinutes}m ago";
    if (diff.inHours < 24) return "${diff.inHours}h ago";
    if (diff.inDays == 1) return "Yesterday";
    if (diff.inDays < 7) return "${diff.inDays}d ago";
    return "${createdAt.day}/${createdAt.month}/${createdAt.year}";
  }
}
