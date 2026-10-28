import 'dart:convert';

enum MessageType {
  text,
  voice,
  media,
  auditionCard,
  systemEvent,
}

enum MessageDeliveryStatus {
  sending,
  sent,
  delivered,
  read,
}

enum ConversationType {
  production,
  direct,
}

class ChatParticipant {
  final String id;
  final String name;
  final String avatarUrl;
  final bool isProductionHouse;
  final bool isVerified;
  final bool isOnline;
  final String lastSeenText;

  const ChatParticipant({
    required this.id,
    required this.name,
    required this.avatarUrl,
    required this.isProductionHouse,
    required this.isVerified,
    required this.isOnline,
    required this.lastSeenText,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'avatarUrl': avatarUrl,
      'isProductionHouse': isProductionHouse,
      'isVerified': isVerified,
      'isOnline': isOnline,
      'lastSeenText': lastSeenText,
    };
  }

  factory ChatParticipant.fromMap(Map<String, dynamic> map) {
    return ChatParticipant(
      id: map['id'] ?? '',
      name: map['name'] ?? '',
      avatarUrl: map['avatarUrl'] ?? '',
      isProductionHouse: map['isProductionHouse'] ?? false,
      isVerified: map['isVerified'] ?? false,
      isOnline: map['isOnline'] ?? false,
      lastSeenText: map['lastSeenText'] ?? 'offline',
    );
  }
}

class AuditionCallout {
  final String castingId;
  final String projectTitle;
  final String roleTitle;
  final String productionHouse;
  final String auditionDate;
  final String location;
  final String payRange;
  final String? bannerUrl;

  const AuditionCallout({
    required this.castingId,
    required this.projectTitle,
    required this.roleTitle,
    required this.productionHouse,
    required this.auditionDate,
    required this.location,
    required this.payRange,
    this.bannerUrl,
  });

  Map<String, dynamic> toMap() {
    return {
      'castingId': castingId,
      'projectTitle': projectTitle,
      'roleTitle': roleTitle,
      'productionHouse': productionHouse,
      'auditionDate': auditionDate,
      'location': location,
      'payRange': payRange,
      'bannerUrl': bannerUrl,
    };
  }

  factory AuditionCallout.fromMap(Map<String, dynamic> map) {
    return AuditionCallout(
      castingId: map['castingId'] ?? '',
      projectTitle: map['projectTitle'] ?? '',
      roleTitle: map['roleTitle'] ?? '',
      productionHouse: map['productionHouse'] ?? '',
      auditionDate: map['auditionDate'] ?? '',
      location: map['location'] ?? '',
      payRange: map['payRange'] ?? '',
      bannerUrl: map['bannerUrl'],
    );
  }
}

class ChatMessage {
  final String id;
  final String conversationId;
  final String senderId;
  final String senderName;
  final String? senderAvatar;
  final bool isFromTalent; // Right-aligned if true (talent / me), Left-aligned if false (production house / counter-party)
  final String content;
  final MessageType type;
  final String? mediaUrl;
  final String? mediaThumbnailUrl;
  final int? mediaDurationSeconds;
  final String? mediaFileName;
  final String? mediaFileSize;
  final MessageDeliveryStatus status;
  final DateTime timestamp;
  final AuditionCallout? auditionCallout;

  const ChatMessage({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.senderName,
    this.senderAvatar,
    required this.isFromTalent,
    required this.content,
    required this.type,
    this.mediaUrl,
    this.mediaThumbnailUrl,
    this.mediaDurationSeconds,
    this.mediaFileName,
    this.mediaFileSize,
    required this.status,
    required this.timestamp,
    this.auditionCallout,
  });

  ChatMessage copyWith({
    String? id,
    String? conversationId,
    String? senderId,
    String? senderName,
    String? senderAvatar,
    bool? isFromTalent,
    String? content,
    MessageType? type,
    String? mediaUrl,
    String? mediaThumbnailUrl,
    int? mediaDurationSeconds,
    String? mediaFileName,
    String? mediaFileSize,
    MessageDeliveryStatus? status,
    DateTime? timestamp,
    AuditionCallout? auditionCallout,
  }) {
    return ChatMessage(
      id: id ?? this.id,
      conversationId: conversationId ?? this.conversationId,
      senderId: senderId ?? this.senderId,
      senderName: senderName ?? this.senderName,
      senderAvatar: senderAvatar ?? this.senderAvatar,
      isFromTalent: isFromTalent ?? this.isFromTalent,
      content: content ?? this.content,
      type: type ?? this.type,
      mediaUrl: mediaUrl ?? this.mediaUrl,
      mediaThumbnailUrl: mediaThumbnailUrl ?? this.mediaThumbnailUrl,
      mediaDurationSeconds: mediaDurationSeconds ?? this.mediaDurationSeconds,
      mediaFileName: mediaFileName ?? this.mediaFileName,
      mediaFileSize: mediaFileSize ?? this.mediaFileSize,
      status: status ?? this.status,
      timestamp: timestamp ?? this.timestamp,
      auditionCallout: auditionCallout ?? this.auditionCallout,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'conversation_id': conversationId,
      'sender_id': senderId,
      'sender_name': senderName,
      'sender_avatar': senderAvatar,
      'is_from_talent': isFromTalent,
      'content': content,
      'type': type.name,
      'media_url': mediaUrl,
      'media_thumbnail_url': mediaThumbnailUrl,
      'media_duration_seconds': mediaDurationSeconds,
      'media_file_name': mediaFileName,
      'media_file_size': mediaFileSize,
      'status': status.name,
      'timestamp': timestamp.toIso8601String(),
      'audition_callout': auditionCallout?.toMap(),
    };
  }

  factory ChatMessage.fromMap(Map<String, dynamic> map) {
    MessageType parseType(String? t) {
      switch (t) {
        case 'voice':
          return MessageType.voice;
        case 'media':
          return MessageType.media;
        case 'audition_card':
        case 'auditionCard':
          return MessageType.auditionCard;
        case 'system_event':
        case 'systemEvent':
          return MessageType.systemEvent;
        default:
          return MessageType.text;
      }
    }

    MessageDeliveryStatus parseStatus(String? s) {
      switch (s) {
        case 'sending':
          return MessageDeliveryStatus.sending;
        case 'delivered':
          return MessageDeliveryStatus.delivered;
        case 'read':
          return MessageDeliveryStatus.read;
        case 'sent':
        default:
          return MessageDeliveryStatus.sent;
      }
    }

    return ChatMessage(
      id: map['id'] ?? 'msg-${DateTime.now().millisecondsSinceEpoch}',
      conversationId: map['conversation_id'] ?? '',
      senderId: map['sender_id'] ?? '',
      senderName: map['sender_name'] ?? 'User',
      senderAvatar: map['sender_avatar'],
      isFromTalent: map['is_from_talent'] ?? false,
      content: map['content'] ?? '',
      type: parseType(map['type']),
      mediaUrl: map['media_url'],
      mediaThumbnailUrl: map['media_thumbnail_url'],
      mediaDurationSeconds: map['media_duration_seconds'],
      mediaFileName: map['media_file_name'],
      mediaFileSize: map['media_file_size'],
      status: parseStatus(map['status']),
      timestamp: map['timestamp'] != null
          ? DateTime.tryParse(map['timestamp']) ?? DateTime.now()
          : DateTime.now(),
      auditionCallout: map['audition_callout'] != null
          ? AuditionCallout.fromMap(map['audition_callout'])
          : null,
    );
  }
}

class ChatConversation {
  final String id;
  final ConversationType type;
  final ChatParticipant participant;
  final String? projectTag; // e.g. "Project: 'The Last Reel' | Role: 'Assistant Camera'"
  final String? roleTag;
  final String? associatedCastingId;
  ChatMessage lastMessage;
  int unreadCount;
  DateTime updatedAt;
  bool isTyping;
  List<ChatMessage> messages;

  ChatConversation({
    required this.id,
    required this.type,
    required this.participant,
    this.projectTag,
    this.roleTag,
    this.associatedCastingId,
    required this.lastMessage,
    required this.unreadCount,
    required this.updatedAt,
    this.isTyping = false,
    required this.messages,
  });

  ChatConversation copyWith({
    String? id,
    ConversationType? type,
    ChatParticipant? participant,
    String? projectTag,
    String? roleTag,
    String? associatedCastingId,
    ChatMessage? lastMessage,
    int? unreadCount,
    DateTime? updatedAt,
    bool? isTyping,
    List<ChatMessage>? messages,
  }) {
    return ChatConversation(
      id: id ?? this.id,
      type: type ?? this.type,
      participant: participant ?? this.participant,
      projectTag: projectTag ?? this.projectTag,
      roleTag: roleTag ?? this.roleTag,
      associatedCastingId: associatedCastingId ?? this.associatedCastingId,
      lastMessage: lastMessage ?? this.lastMessage,
      unreadCount: unreadCount ?? this.unreadCount,
      updatedAt: updatedAt ?? this.updatedAt,
      isTyping: isTyping ?? this.isTyping,
      messages: messages ?? this.messages,
    );
  }
}

class MockChatData {
  static List<ChatConversation> get initialConversations {
    final now = DateTime.now();

    // 1. Dharma Productions (Production Chat)
    final msgDharma1 = ChatMessage(
      id: "msg-dh-1",
      conversationId: "conv-prod-1",
      senderId: "prod-dharma",
      senderName: "Dharma Productions",
      senderAvatar: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=80",
      isFromTalent: false,
      content: "Production House moved your status to Interview Shortlist",
      type: MessageType.systemEvent,
      status: MessageDeliveryStatus.read,
      timestamp: now.subtract(const Duration(days: 1, hours: 4)),
    );

    final msgDharma2 = ChatMessage(
      id: "msg-dh-2",
      conversationId: "conv-prod-1",
      senderId: "prod-dharma",
      senderName: "Dharma Casting Associate",
      senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      isFromTalent: false,
      content: "Official Audition Call: Lead Antagonist (Vikram)",
      type: MessageType.auditionCard,
      status: MessageDeliveryStatus.read,
      timestamp: now.subtract(const Duration(days: 1, hours: 3)),
      auditionCallout: const AuditionCallout(
        castingId: "cast-101",
        projectTitle: "Sacred Vows — OTT Thriller",
        roleTitle: "Lead Antagonist (Vikram)",
        productionHouse: "Dharma Productions / Netflix",
        auditionDate: "Friday, Nov 14 • 11:30 AM IST",
        location: "Dharma Studios, Andheri West, Mumbai",
        payRange: "₹14,00,000 – ₹20,00,000",
        bannerUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1000&auto=format&fit=crop&q=80",
      ),
    );

    final msgDharma3 = ChatMessage(
      id: "msg-dh-3",
      conversationId: "conv-prod-1",
      senderId: "talent-me",
      senderName: "Me",
      isFromTalent: true,
      content: "Thank you so much! I have submitted my monologue self-tape via CineConnect vault. Looking forward to the in-person callback.",
      type: MessageType.text,
      status: MessageDeliveryStatus.read,
      timestamp: now.subtract(const Duration(hours: 5)),
    );

    final msgDharma4 = ChatMessage(
      id: "msg-dh-4",
      conversationId: "conv-prod-1",
      senderId: "prod-dharma",
      senderName: "Priya Sharma (Casting Director)",
      senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      isFromTalent: false,
      content: "Director Vikramaditya listened to your audition dialogue modulation. Here are specific director notes on Scene 4:",
      type: MessageType.voice,
      mediaUrl: "https://cloudfront.cineconnect.studio/audio/dharma_scene4_notes.mp3",
      mediaDurationSeconds: 46,
      status: MessageDeliveryStatus.read,
      timestamp: now.subtract(const Duration(minutes: 42)),
    );

    final msgDharma5 = ChatMessage(
      id: "msg-dh-5",
      conversationId: "conv-prod-1",
      senderId: "prod-dharma",
      senderName: "Dharma Productions",
      senderAvatar: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=80",
      isFromTalent: false,
      content: "Please confirm your availability for studio wardrobe fittings on Wednesday.",
      type: MessageType.text,
      status: MessageDeliveryStatus.delivered,
      timestamp: now.subtract(const Duration(minutes: 8)),
    );

    // 2. Excel Entertainment (Production Chat)
    final msgExcel1 = ChatMessage(
      id: "msg-ex-1",
      conversationId: "conv-prod-2",
      senderId: "prod-excel",
      senderName: "Excel Entertainment",
      senderAvatar: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&auto=format&fit=crop&q=80",
      isFromTalent: false,
      content: "Reema loved your lighting showreel for low-key candlelight setups. Attaching the sequence storyboard lookbook.",
      type: MessageType.media,
      mediaUrl: "https://cloudfront.cineconnect.studio/scripts/Dastaan_Sequence12_Lookbook.pdf",
      mediaThumbnailUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80",
      mediaFileName: "Dastaan_Scene12_Storyboard_Lookbook.pdf",
      mediaFileSize: "14.2 MB",
      status: MessageDeliveryStatus.read,
      timestamp: now.subtract(const Duration(hours: 3)),
    );

    final msgExcel2 = ChatMessage(
      id: "msg-ex-2",
      conversationId: "conv-prod-2",
      senderId: "talent-me",
      senderName: "Me",
      isFromTalent: true,
      content: "The anamorphic lens palette matches the period texture perfectly. I can do a technical test at the studio on the 18th.",
      type: MessageType.text,
      status: MessageDeliveryStatus.read,
      timestamp: now.subtract(const Duration(hours: 1, minutes: 20)),
    );

    // 3. Roy Kapur Films (Production Chat)
    final msgRoy1 = ChatMessage(
      id: "msg-rk-1",
      conversationId: "conv-prod-3",
      senderId: "prod-roy",
      senderName: "Roy Kapur Films",
      senderAvatar: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=400&auto=format&fit=crop&q=80",
      isFromTalent: false,
      content: "Roy Kapur Films moved your status to Screen Test Call",
      type: MessageType.systemEvent,
      status: MessageDeliveryStatus.read,
      timestamp: now.subtract(const Duration(days: 2)),
    );

    final msgRoy2 = ChatMessage(
      id: "msg-rk-2",
      conversationId: "conv-prod-3",
      senderId: "prod-roy",
      senderName: "Roy Kapur Films",
      senderAvatar: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=400&auto=format&fit=crop&q=80",
      isFromTalent: false,
      content: "Screen test scheduled with director Abhishek Chaubey for Inspector Rhea role.",
      type: MessageType.text,
      status: MessageDeliveryStatus.read,
      timestamp: now.subtract(const Duration(days: 1)),
    );

    // 4. Maddock Films (Production Chat)
    final msgMaddock1 = ChatMessage(
      id: "msg-md-1",
      conversationId: "conv-prod-4",
      senderId: "prod-maddock",
      senderName: "Maddock Films",
      senderAvatar: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&auto=format&fit=crop&q=80",
      isFromTalent: false,
      content: "We reviewed your Dolby Atmos spatial audio stems. Really impressive acoustic depth.",
      type: MessageType.text,
      status: MessageDeliveryStatus.read,
      timestamp: now.subtract(const Duration(days: 3)),
    );

    // DIRECT MESSAGES (Tab 2)
    final msgDM1_1 = ChatMessage(
      id: "msg-dm1-1",
      conversationId: "conv-dm-1",
      senderId: "tal-1",
      senderName: "Kabir Mehra",
      senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
      isFromTalent: false,
      content: "Hey! Saw your monologue in the talent showcase. We are producing an indie short next month, would love to collaborate on a read-through.",
      type: MessageType.text,
      status: MessageDeliveryStatus.read,
      timestamp: now.subtract(const Duration(hours: 2, minutes: 15)),
    );

    final msgDM1_2 = ChatMessage(
      id: "msg-dm1-2",
      conversationId: "conv-dm-1",
      senderId: "talent-me",
      senderName: "Me",
      isFromTalent: true,
      content: "Hi Kabir! Thanks for reaching out. What is the logline and shoot window?",
      type: MessageType.text,
      status: MessageDeliveryStatus.read,
      timestamp: now.subtract(const Duration(minutes: 45)),
    );

    final msgDM1_3 = ChatMessage(
      id: "msg-dm1-3",
      conversationId: "conv-dm-1",
      senderId: "tal-1",
      senderName: "Kabir Mehra",
      senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
      isFromTalent: false,
      content: "It is a noir mystery set in Old Delhi. Let me send you the voice note summarizing the character arc.",
      type: MessageType.voice,
      mediaUrl: "https://cloudfront.cineconnect.studio/audio/kabir_logline_pitch.mp3",
      mediaDurationSeconds: 32,
      status: MessageDeliveryStatus.delivered,
      timestamp: now.subtract(const Duration(minutes: 12)),
    );

    final msgDM2_1 = ChatMessage(
      id: "msg-dm2-1",
      conversationId: "conv-dm-2",
      senderId: "tal-2",
      senderName: "Aanya Sen",
      senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
      isFromTalent: false,
      content: "Are you free this weekend to test the Cooke Anamorphic /i set at the equipment rental house?",
      type: MessageType.text,
      status: MessageDeliveryStatus.delivered,
      timestamp: now.subtract(const Duration(hours: 4)),
    );

    final msgDM3_1 = ChatMessage(
      id: "msg-dm3-1",
      conversationId: "conv-dm-3",
      senderId: "tal-4",
      senderName: "Zoya Siddiqui",
      senderAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80",
      isFromTalent: false,
      content: "Sent over the revised pilot script for 'Midnight Boulevard'. Let me know your thoughts on Act 2.",
      type: MessageType.media,
      mediaUrl: "https://cloudfront.cineconnect.studio/scripts/Midnight_Boulevard_Pilot_Rev.pdf",
      mediaThumbnailUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80",
      mediaFileName: "Midnight_Boulevard_Pilot_Rev2.pdf",
      mediaFileSize: "4.8 MB",
      status: MessageDeliveryStatus.read,
      timestamp: now.subtract(const Duration(days: 1, hours: 2)),
    );

    return [
      // 1. Dharma Productions
      ChatConversation(
        id: "conv-prod-1",
        type: ConversationType.production,
        participant: const ChatParticipant(
          id: "prod-dharma",
          name: "Dharma Productions / Netflix",
          avatarUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&auto=format&fit=crop&q=80",
          isProductionHouse: true,
          isVerified: true,
          isOnline: true,
          lastSeenText: "Online",
        ),
        projectTag: "Project: 'Sacred Vows' | Role: 'Lead Antagonist - Vikram'",
        roleTag: "Lead Antagonist (Vikram)",
        associatedCastingId: "cast-101",
        lastMessage: msgDharma5,
        unreadCount: 2,
        updatedAt: now.subtract(const Duration(minutes: 8)),
        messages: [msgDharma1, msgDharma2, msgDharma3, msgDharma4, msgDharma5],
      ),

      // 2. Excel Entertainment
      ChatConversation(
        id: "conv-prod-2",
        type: ConversationType.production,
        participant: const ChatParticipant(
          id: "prod-excel",
          name: "Excel Entertainment",
          avatarUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&auto=format&fit=crop&q=80",
          isProductionHouse: true,
          isVerified: true,
          isOnline: true,
          lastSeenText: "Online",
        ),
        projectTag: "Project: 'Dastaan-e-Hind' | Role: 'Director of Photography'",
        roleTag: "Chief Cinematographer",
        associatedCastingId: "cast-102",
        lastMessage: msgExcel2,
        unreadCount: 0,
        updatedAt: now.subtract(const Duration(hours: 1, minutes: 20)),
        messages: [msgExcel1, msgExcel2],
      ),

      // 3. Roy Kapur Films
      ChatConversation(
        id: "conv-prod-3",
        type: ConversationType.production,
        participant: const ChatParticipant(
          id: "prod-roy",
          name: "Roy Kapur Films / Prime Video",
          avatarUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=400&auto=format&fit=crop&q=80",
          isProductionHouse: true,
          isVerified: true,
          isOnline: false,
          lastSeenText: "Last seen yesterday at 6:40 PM",
        ),
        projectTag: "Project: 'Kolkata Files' | Role: 'Female Detective - Rhea'",
        roleTag: "Inspector Rhea",
        associatedCastingId: "cast-103",
        lastMessage: msgRoy2,
        unreadCount: 1,
        updatedAt: now.subtract(const Duration(days: 1)),
        messages: [msgRoy1, msgRoy2],
      ),

      // 4. Maddock Films
      ChatConversation(
        id: "conv-prod-4",
        type: ConversationType.production,
        participant: const ChatParticipant(
          id: "prod-maddock",
          name: "Maddock Films",
          avatarUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&auto=format&fit=crop&q=80",
          isProductionHouse: true,
          isVerified: true,
          isOnline: false,
          lastSeenText: "Last seen 2 days ago",
        ),
        projectTag: "Project: 'Stree Universe' | Role: 'Sound Designer'",
        roleTag: "Sound Designer & Mixer",
        associatedCastingId: "cast-104",
        lastMessage: msgMaddock1,
        unreadCount: 0,
        updatedAt: now.subtract(const Duration(days: 3)),
        messages: [msgMaddock1],
      ),

      // DIRECT 1: Kabir Mehra
      ChatConversation(
        id: "conv-dm-1",
        type: ConversationType.direct,
        participant: const ChatParticipant(
          id: "tal-1",
          name: "Kabir Mehra",
          avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
          isProductionHouse: false,
          isVerified: true,
          isOnline: true,
          lastSeenText: "Typing...",
        ),
        projectTag: "Actor & Voice Artist • Mumbai",
        lastMessage: msgDM1_3,
        unreadCount: 1,
        updatedAt: now.subtract(const Duration(minutes: 12)),
        isTyping: false,
        messages: [msgDM1_1, msgDM1_2, msgDM1_3],
      ),

      // DIRECT 2: Aanya Sen
      ChatConversation(
        id: "conv-dm-2",
        type: ConversationType.direct,
        participant: const ChatParticipant(
          id: "tal-2",
          name: "Aanya Sen",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
          isProductionHouse: false,
          isVerified: true,
          isOnline: true,
          lastSeenText: "Online",
        ),
        projectTag: "Cinematographer (ISC) • Bengaluru",
        lastMessage: msgDM2_1,
        unreadCount: 1,
        updatedAt: now.subtract(const Duration(hours: 4)),
        messages: [msgDM2_1],
      ),

      // DIRECT 3: Zoya Siddiqui
      ChatConversation(
        id: "conv-dm-3",
        type: ConversationType.direct,
        participant: const ChatParticipant(
          id: "tal-4",
          name: "Zoya Siddiqui",
          avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80",
          isProductionHouse: false,
          isVerified: true,
          isOnline: false,
          lastSeenText: "Last seen yesterday",
        ),
        projectTag: "Screenwriter & Script Doctor • Delhi",
        lastMessage: msgDM3_1,
        unreadCount: 0,
        updatedAt: now.subtract(const Duration(days: 1, hours: 2)),
        messages: [msgDM3_1],
      ),
    ];
  }
}
