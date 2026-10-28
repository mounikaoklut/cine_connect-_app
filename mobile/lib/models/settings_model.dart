class UserSettings {
  final String accountType; // 'CREATIVE_TALENT' or 'PRODUCTION_HOUSE'
  String availabilityStatus; // 'AVAILABLE', 'BUSY', 'UNAVAILABLE'
  String rateCurrency;
  double dayRate;
  String primaryRole;
  List<String> secondaryCrafts;
  String unionAffiliations;
  bool willingToTravel;
  String? portfolioUrl;
  String? resumeUrl;

  // Production House
  String? companyName;
  String? taxId;
  String? registeredAddress;
  bool verifiedBanner;
  String? defaultNdaTemplate;

  // Security
  bool isTwoFactorEnabled;
  bool identityVerified;

  // Notifications
  bool notifyChat;
  bool notifyApplicationStatus;
  bool notifyCastingMatches;
  bool notifyEmailDigest;
  bool notifySmsUrgent;
  bool dndEnabled;
  String? dndStartTime;
  String? dndEndTime;

  // Media
  String streamQuality; // 'AUTO', 'LOW', 'MEDIUM', 'HIGH'
  int cachedMediaBytes;

  String themeMode;
  String accountStatus;

  UserSettings({
    required this.accountType,
    required this.availabilityStatus,
    required this.rateCurrency,
    required this.dayRate,
    required this.primaryRole,
    required this.secondaryCrafts,
    required this.unionAffiliations,
    required this.willingToTravel,
    this.portfolioUrl,
    this.resumeUrl,
    this.companyName,
    this.taxId,
    this.registeredAddress,
    this.verifiedBanner = false,
    this.defaultNdaTemplate,
    this.isTwoFactorEnabled = false,
    this.identityVerified = true,
    this.notifyChat = true,
    this.notifyApplicationStatus = true,
    this.notifyCastingMatches = true,
    this.notifyEmailDigest = true,
    this.notifySmsUrgent = true,
    this.dndEnabled = false,
    this.dndStartTime,
    this.dndEndTime,
    this.streamQuality = 'AUTO',
    this.cachedMediaBytes = 124000000,
    this.themeMode = 'DARK',
    this.accountStatus = 'ACTIVE',
  });

  factory UserSettings.fromJson(Map<String, dynamic> json) {
    return UserSettings(
      accountType: json['account_type']?.toString() ?? 'CREATIVE_TALENT',
      availabilityStatus: json['availability_status']?.toString() ?? 'AVAILABLE',
      rateCurrency: json['rate_currency']?.toString() ?? 'USD',
      dayRate: (json['day_rate'] as num?)?.toDouble() ?? 450.0,
      primaryRole: json['primary_role']?.toString() ?? 'Director of Photography',
      secondaryCrafts: (json['secondary_crafts'] as List<dynamic>?)?.map((e) => e.toString()).toList() ??
          ['Gaffer', 'Colorist'],
      unionAffiliations: json['union_affiliations']?.toString() ?? 'CINTAA / IATSE Local 600',
      willingToTravel: json['willing_to_travel'] != false,
      portfolioUrl: json['portfolio_url']?.toString(),
      resumeUrl: json['resume_url']?.toString(),
      companyName: json['company_name']?.toString(),
      taxId: json['tax_id']?.toString(),
      registeredAddress: json['registered_address']?.toString(),
      verifiedBanner: json['verified_banner'] == true,
      defaultNdaTemplate: json['default_nda_template']?.toString(),
      isTwoFactorEnabled: json['is_two_factor_enabled'] == true,
      identityVerified: json['identity_verified'] != false,
      notifyChat: json['notify_chat'] != false,
      notifyApplicationStatus: json['notify_application_status'] != false,
      notifyCastingMatches: json['notify_casting_matches'] != false,
      notifyEmailDigest: json['notify_email_digest'] != false,
      notifySmsUrgent: json['notify_sms_urgent'] != false,
      dndEnabled: json['dnd_enabled'] == true,
      dndStartTime: json['dnd_start_time']?.toString(),
      dndEndTime: json['dnd_end_time']?.toString(),
      streamQuality: json['stream_quality']?.toString() ?? 'AUTO',
      cachedMediaBytes: (json['cached_media_bytes'] as num?)?.toInt() ?? 124000000,
      themeMode: json['theme_mode']?.toString() ?? 'DARK',
      accountStatus: json['account_status']?.toString() ?? 'ACTIVE',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'account_type': accountType,
      'availability_status': availabilityStatus,
      'rate_currency': rateCurrency,
      'day_rate': dayRate,
      'primary_role': primaryRole,
      'secondary_crafts': secondaryCrafts,
      'union_affiliations': unionAffiliations,
      'willing_to_travel': willingToTravel,
      'portfolio_url': portfolioUrl,
      'resume_url': resumeUrl,
      'company_name': companyName,
      'tax_id': taxId,
      'registered_address': registeredAddress,
      'verified_banner': verifiedBanner,
      'default_nda_template': defaultNdaTemplate,
      'is_two_factor_enabled': isTwoFactorEnabled,
      'identity_verified': identityVerified,
      'notify_chat': notifyChat,
      'notify_application_status': notifyApplicationStatus,
      'notify_casting_matches': notifyCastingMatches,
      'notify_email_digest': notifyEmailDigest,
      'notify_sms_urgent': notifySmsUrgent,
      'dnd_enabled': dndEnabled,
      'dnd_start_time': dndStartTime,
      'dnd_end_time': dndEndTime,
      'stream_quality': streamQuality,
      'cached_media_bytes': cachedMediaBytes,
      'theme_mode': themeMode,
      'account_status': accountStatus,
    };
  }
}

class ActiveDeviceSession {
  final String sessionId;
  final String deviceName;
  final String deviceType;
  final String location;
  final String ipAddress;
  final String lastActive;
  final bool isCurrent;

  ActiveDeviceSession({
    required this.sessionId,
    required this.deviceName,
    required this.deviceType,
    required this.location,
    required this.ipAddress,
    required this.lastActive,
    this.isCurrent = false,
  });

  factory ActiveDeviceSession.fromJson(Map<String, dynamic> json) {
    return ActiveDeviceSession(
      sessionId: json['session_id']?.toString() ?? '',
      deviceName: json['device_name']?.toString() ?? 'Device',
      deviceType: json['device_type']?.toString() ?? 'Mobile',
      location: json['location']?.toString() ?? 'Mumbai, IN',
      ipAddress: json['ip_address']?.toString() ?? '127.0.0.1',
      lastActive: json['last_active']?.toString() ?? 'Active Now',
      isCurrent: json['is_current'] == true,
    );
  }
}
