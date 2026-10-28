class Talent {
  final String id;
  final String name;
  final String craft;
  final String category;
  final String city;
  final String country;
  final String avatar;
  final String coverImage;
  final int experienceYears;
  final int creditsCount;
  final String bio;
  final List<String> skills;
  final List<String>? gear;
  final List<String> languages;
  final bool verified;
  final String featuredReelUrl;
  final String featuredReelTitle;
  final String? accolades;
  final String availability;

  Talent({
    required this.id,
    required this.name,
    required this.craft,
    required this.category,
    required this.city,
    required this.country,
    required this.avatar,
    required this.coverImage,
    required this.experienceYears,
    required this.creditsCount,
    required this.bio,
    required this.skills,
    this.gear,
    required this.languages,
    required this.verified,
    required this.featuredReelUrl,
    required this.featuredReelTitle,
    this.accolades,
    required this.availability,
  });
}

class CastingCall {
  final String id;
  final String title;
  final String projectType;
  final String productionHouse;
  final String? director;
  final String craft;
  final String? characterName;
  final String characterDescription;
  final String location;
  final String shootDates;
  final String payRange;
  final String deadline;
  final bool isUrgent;
  final int? matchScore;
  final int applicantsCount;
  final List<String> requirements;
  final String bannerUrl;

  CastingCall({
    required this.id,
    required this.title,
    required this.projectType,
    required this.productionHouse,
    this.director,
    required this.craft,
    this.characterName,
    required this.characterDescription,
    required this.location,
    required this.shootDates,
    required this.payRange,
    required this.deadline,
    required this.isUrgent,
    this.matchScore,
    required this.applicantsCount,
    required this.requirements,
    required this.bannerUrl,
  });
}

class PitchDeck {
  final String id;
  final String title;
  final String writer;
  final List<String> genre;
  final String format;
  final String logline;
  final String synopsis;
  final String estimatedBudget;
  final String status;
  final String? attachedTalent;
  final bool ndaRequired;
  final String coverImage;
  final int viewsCount;
  final int inquiriesCount;

  PitchDeck({
    required this.id,
    required this.title,
    required this.writer,
    required this.genre,
    required this.format,
    required this.logline,
    required this.synopsis,
    required this.estimatedBudget,
    required this.status,
    this.attachedTalent,
    required this.ndaRequired,
    required this.coverImage,
    required this.viewsCount,
    required this.inquiriesCount,
  });
}

class FeedPost {
  final String id;
  final String authorName;
  final String authorCraft;
  final String authorAvatar;
  final String? authorCompany;
  final bool authorVerified;
  final String timestamp;
  final String type; // 'casting', 'showreel', 'pitch', 'bts', 'announcement'
  final String content;
  final String? mediaUrl;
  final List<String> tags;
  int likes;
  int commentsCount;
  int shares;
  bool isLiked;
  final String? actionLabel;
  final String? actionType;
  final String? actionTargetId;

  FeedPost({
    required this.id,
    required this.authorName,
    required this.authorCraft,
    required this.authorAvatar,
    this.authorCompany,
    required this.authorVerified,
    required this.timestamp,
    required this.type,
    required this.content,
    this.mediaUrl,
    required this.tags,
    required this.likes,
    required this.commentsCount,
    required this.shares,
    this.isLiked = false,
    this.actionLabel,
    this.actionType,
    this.actionTargetId,
  });
}

class PipelineItem {
  final String id;
  final String projectTitle;
  final String roleTitle;
  final String productionHouse;
  final String appliedDate;
  final String stage;
  final double progressPercent;
  final String nextStepNote;
  final String? meetingLink;
  final String? meetingTime;

  PipelineItem({
    required this.id,
    required this.projectTitle,
    required this.roleTitle,
    required this.productionHouse,
    required this.appliedDate,
    required this.stage,
    required this.progressPercent,
    required this.nextStepNote,
    this.meetingLink,
    this.meetingTime,
  });
}
