package com.cineconnect.talent.ui.profile

import com.cineconnect.talent.domain.profile.model.ActivityPost
import com.cineconnect.talent.domain.profile.model.ProductionCredit
import com.cineconnect.talent.domain.profile.model.ProfileStats
import com.cineconnect.talent.domain.profile.model.ProfileTabType
import com.cineconnect.talent.domain.profile.model.ReelItem
import com.cineconnect.talent.domain.profile.model.SkillTag
import com.cineconnect.talent.domain.profile.model.UserProfileData

/**
 * Reactive UI state representation for the Cine Connect Profile Screen.
 * Adheres to MVI/MVVM unidirectional data flow.
 */
data class ProfileUiState(
    val isLoading: Boolean = false,
    val profile: UserProfileData? = null,
    val stats: ProfileStats = ProfileStats(),
    val selectedTab: ProfileTabType = ProfileTabType.ABOUT,
    val skills: List<SkillTag> = emptyList(),
    val credits: List<ProductionCredit> = emptyList(),
    val reels: List<ReelItem> = emptyList(),
    val posts: List<ActivityPost> = emptyList(),
    val selectedSkillCategory: String? = null,
    val playingReel: ReelItem? = null,
    val toastMessage: String? = null,
    val isFollowing: Boolean = false,
    val errorMessage: String? = null
)
