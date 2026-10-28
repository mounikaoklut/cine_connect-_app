package com.cineconnect.talent.domain.profile.model

import kotlinx.serialization.Serializable

/**
 * Clean Architecture Domain Entities for the Cine Connect Profile Module.
 * Designed to map directly with PostgreSQL schemas:
 * `users`, `profiles`, `skills`, `portfolios`, `auditions`, `posts`
 */

@Serializable
data class UserProfileData(
    val id: String,
    val name: String,
    val headline: String,
    val department: String,
    val bio: String,
    val avatarUrl: String,
    val coverImageUrl: String,
    val location: String,
    val availabilityStatus: AvailabilityStatus,
    val isVerified: Boolean = true,
    val isFollowing: Boolean = false,
    val unionAffiliations: List<String> = emptyList(),
    val yearsOfExperience: Int = 8,
    val agencyRepresentation: String? = "Creative Artists Agency (CAA)",
    val educationTraining: String? = "National School of Drama (NSD), Method Studio NY"
)

enum class AvailabilityStatus(val label: String) {
    AVAILABLE("Available for Shoots"),
    ON_SET("Currently on Production"),
    BOOKED("Booked until Next Quarter"),
    SELECTIVE("Open for Select Pitches")
}

@Serializable
data class ProfileStats(
    val profileViews: String = "4.8K",
    val activeAuditions: Int = 14,
    val savedPitches: Int = 9,
    val connectionsCount: String = "2.3K"
)

enum class ProfileTabType(val title: String) {
    ABOUT("About / Bio"),
    SKILLS_EXPERIENCE("Skills & Exp"),
    REELS_SHOWCASE("Portfolio & Reels"),
    POSTS_ACTIVITY("Posts & Activity")
}

@Serializable
data class SkillTag(
    val id: Int,
    val name: String,
    val category: String, // e.g. "Acting", "Technical", "Direction", "Software"
    val proficiency: String = "Expert" // "Expert", "Advanced", "Proficient"
)

@Serializable
data class ProductionCredit(
    val id: String,
    val title: String,
    val role: String,
    val company: String,
    val year: String,
    val type: String, // "Feature Film", "OTT Web Series", "Theatrical Play", "Commercial"
    val description: String,
    val isVerified: Boolean = true
)

@Serializable
data class ReelItem(
    val id: String,
    val title: String,
    val reelType: String, // "Dramatic Showreel", "Self-Tape Audition", "Action Stunt Reel", "Voice Reel"
    val duration: String,
    val videoUrl: String,
    val thumbnailUrl: String,
    val views: String,
    val isFeatured: Boolean = false,
    val tags: List<String> = emptyList()
)

@Serializable
data class ActivityPost(
    val id: String,
    val authorName: String,
    val authorHeadline: String,
    val authorAvatarUrl: String,
    val timestamp: String,
    val content: String,
    val isPitch: Boolean = false,
    val pitchTag: String? = null,
    val mediaUrl: String? = null,
    val mediaType: ActivityMediaType? = null,
    val likesCount: Int = 42,
    val commentsCount: Int = 18,
    val sharesCount: Int = 7,
    val isLiked: Boolean = false
)

enum class ActivityMediaType {
    VIDEO,
    IMAGE,
    PITCH_DECK
}
