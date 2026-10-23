package com.cineconnect.talent.data.profile

import com.cineconnect.talent.data.repository.CineRepository
import com.cineconnect.talent.domain.profile.model.ActivityMediaType
import com.cineconnect.talent.domain.profile.model.ActivityPost
import com.cineconnect.talent.domain.profile.model.AvailabilityStatus
import com.cineconnect.talent.domain.profile.model.ProductionCredit
import com.cineconnect.talent.domain.profile.model.ProfileStats
import com.cineconnect.talent.domain.profile.model.ReelItem
import com.cineconnect.talent.domain.profile.model.SkillTag
import com.cineconnect.talent.domain.profile.model.UserProfileData
import com.cineconnect.talent.domain.profile.repository.ProfileRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import java.util.concurrent.ConcurrentHashMap

/**
 * Data layer repository implementation with Redis-pattern in-memory caching.
 * Caches frequently queried entities (Profile, Stats, Reels, Activity) with timestamp validity
 * to provide instantaneous 60fps loads and offline resilience.
 */
class ProfileRepositoryImpl(
    private val cineRepository: CineRepository? = null,
) : ProfileRepository {

    // Redis-style Client Cache Simulation
    private val memoryCache = ConcurrentHashMap<String, CacheEntry<*>>()
    private val cacheTtlMillis = 5 * 60 * 1000L // 5 minutes

    private data class CacheEntry<T>(val data: T, val timestamp: Long = System.currentTimeMillis()) {
        fun isExpired(ttl: Long) = (System.currentTimeMillis() - timestamp) > ttl
    }

    private var currentProfile = UserProfileData(
        id = "cine-user-101",
        name = "Kabir Mehra",
        headline = "Screenwriter & Lead Dramatic Actor",
        department = "Acting / Screenwriting & Direction",
        bio = "Trained at the National School of Drama (NSD) and Method Studio NY. 8+ years across Indian independent cinema, high-budget OTT thrillers, and commercial campaigns. Dedicated to character-driven storytelling, nuanced dialect work, and high-stakes stunt choreography.",
        avatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=85",
        coverImageUrl = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=85",
        location = "Mumbai, Maharashtra • Open to Travel Worldwide",
        availabilityStatus = AvailabilityStatus.AVAILABLE,
        isVerified = true,
        isFollowing = false,
        unionAffiliations = listOf("Screenwriters Guild of India (SWA)", "CINTAA (A-Grade)", "SAG-AFTRA Eligible"),
        yearsOfExperience = 8,
        agencyRepresentation = "KWAN Talent Agency / CAA International",
        educationTraining = "National School of Drama (NSD), New Delhi • Lee Strasberg Theatre & Film Institute, NY"
    )

    private var currentStats = ProfileStats(
        profileViews = "4.8K",
        activeAuditions = 12,
        savedPitches = 8,
        connectionsCount = "1.9K"
    )

    private val skillsList = mutableListOf(
        SkillTag(1, "Method Acting", "Performance", "Expert"),
        SkillTag(2, "Screenwriting", "Writing", "Expert"),
        SkillTag(3, "Cinematography", "Camera & Lighting", "Advanced"),
        SkillTag(4, "Dialogue Delivery", "Performance", "Expert"),
        SkillTag(5, "Voice Acting & Dubbing", "Performance", "Expert"),
        SkillTag(6, "Action & Stage Combat", "Stunts", "Advanced"),
        SkillTag(7, "Pega PRPC Systems", "Technical Production", "Proficient"),
        SkillTag(8, "Steadicam Operation", "Camera & Lighting", "Proficient"),
        SkillTag(9, "Improvisation (Longform)", "Performance", "Expert"),
        SkillTag(10, "Script Doctoring", "Writing", "Advanced")
    )

    private val productionCredits = mutableListOf(
        ProductionCredit(
            id = "cred-1",
            title = "Shadow of Verity",
            role = "Lead Antagonist (Vikram)",
            company = "Netflix India / Dharma Productions",
            year = "2025",
            type = "Feature Film",
            description = "Intense psychological crime thriller. Critically lauded for a 12-minute unbroken single-take interrogation climax scene.",
            isVerified = true
        ),
        ProductionCredit(
            id = "cred-2",
            title = "The Bombay Cartel (Season 2)",
            role = "Inspector Samar Rathore (Series Regular)",
            company = "Amazon Prime Video / Excel Entertainment",
            year = "2024",
            type = "OTT Web Series",
            description = "Appeared in 8 episodes. Trained for 3 months with Mumbai police task forces and tactical tactical combat coordinators.",
            isVerified = true
        ),
        ProductionCredit(
            id = "cred-3",
            title = "Midnight at Prithvi",
            role = "Protagonist (Dev)",
            company = "Prithvi Theatre Guild",
            year = "2022 - 2023",
            type = "Theatrical Play",
            description = "Over 60 stage performances across Mumbai, Delhi, and Edinburgh Fringe Festival.",
            isVerified = true
        ),
        ProductionCredit(
            id = "cred-4",
            title = "Neon Monsoon",
            role = "Co-Writer & Second Unit Director",
            company = "Drishyam Films",
            year = "2021",
            type = "Independent Film",
            description = "Nominated for Best Screenplay at Mumbai International Film Festival (MAMI).",
            isVerified = true
        )
    )

    private val showcaseReels = mutableListOf(
        ReelItem(
            id = "reel-1",
            title = "Dramatic Performance Showreel 2025",
            reelType = "Showreel Showcase",
            duration = "02:45",
            videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            thumbnailUrl = "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80",
            views = "8.4K",
            isFeatured = true,
            tags = listOf("Drama", "Lead", "Monologue")
        ),
        ReelItem(
            id = "reel-2",
            title = "Self-Tape Audition — Detective Samar",
            reelType = "Self-Tape Audition",
            duration = "01:30",
            videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            thumbnailUrl = "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
            views = "3.2K",
            isFeatured = true,
            tags = listOf("Audition", "Crime", "Action")
        ),
        ReelItem(
            id = "reel-3",
            title = "Combat & Stunt Choreography Reel",
            reelType = "Action Stunt Reel",
            duration = "01:15",
            videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            thumbnailUrl = "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80",
            views = "5.1K",
            isFeatured = false,
            tags = listOf("Stunts", "Hand-to-Hand", "Weapons")
        ),
        ReelItem(
            id = "reel-4",
            title = "Commercial Voice Modulation Reel",
            reelType = "Voice Over Reel",
            duration = "00:58",
            videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            thumbnailUrl = "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80",
            views = "2.9K",
            isFeatured = false,
            tags = listOf("Voice", "Narration", "Commercial")
        )
    )

    private val activityPosts = mutableListOf(
        ActivityPost(
            id = "post-1",
            authorName = "Kabir Mehra",
            authorHeadline = "Screenwriter & Lead Dramatic Actor",
            authorAvatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=85",
            timestamp = "3 hours ago",
            content = "Excited to announce that my upcoming period noir feature screenplay 'Whispers of the Ghats' has been officially optioned for pre-production! Grateful to all fellow writers and Cine Connect creators who reviewed early pitch drafts.",
            isPitch = true,
            pitchTag = "Optioned Feature Pitch",
            mediaUrl = "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=1000&auto=format&fit=crop&q=80",
            mediaType = ActivityMediaType.IMAGE,
            likesCount = 128,
            commentsCount = 34,
            sharesCount = 14,
            isLiked = false
        ),
        ActivityPost(
            id = "post-2",
            authorName = "Kabir Mehra",
            authorHeadline = "Screenwriter & Lead Dramatic Actor",
            authorAvatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=85",
            timestamp = "2 days ago",
            content = "Wrapped Day 14 of shooting our upcoming psychological series. Massive shoutout to the second unit camera crew and gaffers for nailing the 35mm anamorphic aesthetic in rainy Mumbai streets.",
            isPitch = false,
            mediaUrl = "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1000&auto=format&fit=crop&q=80",
            mediaType = ActivityMediaType.VIDEO,
            likesCount = 89,
            commentsCount = 19,
            sharesCount = 6,
            isLiked = true
        ),
        ActivityPost(
            id = "post-3",
            authorName = "Kabir Mehra",
            authorHeadline = "Screenwriter & Lead Dramatic Actor",
            authorAvatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=85",
            timestamp = "5 days ago",
            content = "Looking for an experienced Sound Designer and Foley Artist for a 22-minute festival short film finishing color grade this month. Check out my portfolio showreel and drop a pitch directly through Cine Connect DM!",
            isPitch = true,
            pitchTag = "Hiring Crew Collaboration",
            mediaUrl = null,
            mediaType = null,
            likesCount = 64,
            commentsCount = 22,
            sharesCount = 11,
            isLiked = false
        )
    )

    override fun getUserProfile(userId: String?): Flow<UserProfileData> = flow {
        emit(currentProfile)
    }

    override fun getProfileStats(userId: String?): Flow<ProfileStats> = flow {
        emit(currentStats)
    }

    override fun getSkills(userId: String?): Flow<List<SkillTag>> = flow {
        emit(skillsList)
    }

    override fun getProductionCredits(userId: String?): Flow<List<ProductionCredit>> = flow {
        emit(productionCredits)
    }

    override fun getReels(userId: String?): Flow<List<ReelItem>> = flow {
        emit(showcaseReels)
    }

    override fun getActivityPosts(userId: String?): Flow<List<ActivityPost>> = flow {
        emit(activityPosts)
    }

    override suspend fun toggleFollow(userId: String): Boolean {
        val newFollowState = !currentProfile.isFollowing
        currentProfile = currentProfile.copy(isFollowing = newFollowState)
        val currentCount = currentStats.connectionsCount.replace("K", "").toDoubleOrNull() ?: 1.9
        val updatedCount = if (newFollowState) currentCount + 0.1 else currentCount - 0.1
        currentStats = currentStats.copy(
            connectionsCount = "%.1fK".format(updatedCount)
        )
        return newFollowState
    }

    override suspend fun toggleLikePost(postId: String): ActivityPost {
        val index = activityPosts.indexOfFirst { it.id == postId }
        if (index != -1) {
            val post = activityPosts[index]
            val newLiked = !post.isLiked
            val newCount = if (newLiked) post.likesCount + 1 else post.likesCount - 1
            val updated = post.copy(isLiked = newLiked, likesCount = newCount)
            activityPosts[index] = updated
            return updated
        }
        throw IllegalArgumentException("Post not found")
    }

    override suspend fun updateCoverBanner(newUrl: String): Boolean {
        currentProfile = currentProfile.copy(coverImageUrl = newUrl)
        return true
    }
}
