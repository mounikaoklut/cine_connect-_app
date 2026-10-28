package com.cineconnect.talent.domain.profile.repository

import com.cineconnect.talent.domain.profile.model.ActivityPost
import com.cineconnect.talent.domain.profile.model.ProfileStats
import com.cineconnect.talent.domain.profile.model.ProductionCredit
import com.cineconnect.talent.domain.profile.model.ReelItem
import com.cineconnect.talent.domain.profile.model.SkillTag
import com.cineconnect.talent.domain.profile.model.UserProfileData
import kotlinx.coroutines.flow.Flow

/**
 * Domain-level contract for the Profile Module.
 * Follows Clean Architecture principles to isolate business logic from data sources.
 */
interface ProfileRepository {
    fun getUserProfile(userId: String? = null): Flow<UserProfileData>
    fun getProfileStats(userId: String? = null): Flow<ProfileStats>
    fun getSkills(userId: String? = null): Flow<List<SkillTag>>
    fun getProductionCredits(userId: String? = null): Flow<List<ProductionCredit>>
    fun getReels(userId: String? = null): Flow<List<ReelItem>>
    fun getActivityPosts(userId: String? = null): Flow<List<ActivityPost>>
    suspend fun toggleFollow(userId: String): Boolean
    suspend fun toggleLikePost(postId: String): ActivityPost
    suspend fun updateCoverBanner(newUrl: String): Boolean
}
