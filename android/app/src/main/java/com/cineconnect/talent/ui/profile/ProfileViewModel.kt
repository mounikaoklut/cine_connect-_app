package com.cineconnect.talent.ui.profile

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.cineconnect.talent.CineConnectApp
import com.cineconnect.talent.data.profile.ProfileRepositoryImpl
import com.cineconnect.talent.domain.profile.model.ProfileTabType
import com.cineconnect.talent.domain.profile.model.ReelItem
import com.cineconnect.talent.domain.profile.repository.ProfileRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/**
 * Clean Architecture ViewModel for User Profile.
 * Exposes a single [StateFlow] of [ProfileUiState] for the Compose view.
 */
class ProfileViewModel(
    application: Application,
    private val repository: ProfileRepository = ProfileRepositoryImpl(
        (application as? CineConnectApp)?.repository
    )
) : AndroidViewModel(application) {

    private val _state = MutableStateFlow(ProfileUiState(isLoading = true))
    val state: StateFlow<ProfileUiState> = _state.asStateFlow()

    init {
        loadProfileData()
    }

    fun loadProfileData(userId: String? = null) {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true) }
            try {
                launch {
                    repository.getUserProfile(userId).collectLatest { profile ->
                        _state.update { it.copy(profile = profile, isFollowing = profile.isFollowing) }
                    }
                }
                launch {
                    repository.getProfileStats(userId).collectLatest { stats ->
                        _state.update { it.copy(stats = stats) }
                    }
                }
                launch {
                    repository.getSkills(userId).collectLatest { skills ->
                        _state.update { it.copy(skills = skills) }
                    }
                }
                launch {
                    repository.getProductionCredits(userId).collectLatest { credits ->
                        _state.update { it.copy(credits = credits) }
                    }
                }
                launch {
                    repository.getReels(userId).collectLatest { reels ->
                        _state.update { it.copy(reels = reels) }
                    }
                }
                launch {
                    repository.getActivityPosts(userId).collectLatest { posts ->
                        _state.update { it.copy(posts = posts) }
                    }
                }
            } catch (e: Exception) {
                _state.update { it.copy(errorMessage = e.localizedMessage) }
            } finally {
                _state.update { it.copy(isLoading = false) }
            }
        }
    }

    fun selectTab(tab: ProfileTabType) {
        _state.update { it.copy(selectedTab = tab) }
    }

    fun filterSkillCategory(category: String?) {
        _state.update {
            it.copy(selectedSkillCategory = if (it.selectedSkillCategory == category) null else category)
        }
    }

    fun toggleFollow() {
        val currentProfile = _state.value.profile ?: return
        viewModelScope.launch {
            val newFollowState = repository.toggleFollow(currentProfile.id)
            _state.update {
                it.copy(
                    isFollowing = newFollowState,
                    toastMessage = if (newFollowState) "Connected with ${currentProfile.name}!" else "Disconnected from ${currentProfile.name}"
                )
            }
            // re-fetch stats
            repository.getProfileStats(currentProfile.id).collectLatest { stats ->
                _state.update { it.copy(stats = stats) }
            }
        }
    }

    fun toggleLikePost(postId: String) {
        viewModelScope.launch {
            try {
                val updatedPost = repository.toggleLikePost(postId)
                _state.update { currentState ->
                    val updatedPosts = currentState.posts.map {
                        if (it.id == postId) updatedPost else it
                    }
                    currentState.copy(posts = updatedPosts)
                }
            } catch (e: Exception) {
                _state.update { it.copy(toastMessage = "Unable to like post") }
            }
        }
    }

    fun playReel(reel: ReelItem?) {
        _state.update { it.copy(playingReel = reel) }
    }

    fun sharePortfolio() {
        val profile = _state.value.profile
        val url = "https://cineconnect.com/p/${profile?.id ?: "talent"}"
        _state.update { it.copy(toastMessage = "Portfolio link copied: $url") }
    }

    fun updateCoverBanner(newUrl: String) {
        viewModelScope.launch {
            repository.updateCoverBanner(newUrl)
            _state.update {
                it.copy(
                    profile = it.profile?.copy(coverImageUrl = newUrl),
                    toastMessage = "Cover banner updated successfully"
                )
            }
        }
    }

    fun dismissToast() {
        _state.update { it.copy(toastMessage = null) }
    }
}
