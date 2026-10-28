package com.cineconnect.talent.ui.portal

import android.app.Application
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.cineconnect.talent.CineConnectApp
import com.cineconnect.talent.data.model.CompletenessResponse
import com.cineconnect.talent.data.model.DemoContent
import com.cineconnect.talent.data.model.PortfolioCreateRequest
import com.cineconnect.talent.data.model.ProfileUpdateRequest
import com.cineconnect.talent.data.model.PublicProfile
import com.cineconnect.talent.data.model.UserProfile
import com.cineconnect.talent.data.repository.ApiResult
import kotlinx.coroutines.launch
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

enum class PortalTab(val label: String) {
    PROFILE("My Profile"),
    PORTFOLIO("Portfolio"),
    EXPERIENCE("Credits"),
    VERIFICATION("Verification"),
}

/** What the upload sheet collects before handing it to the view model. */
data class MediaDraft(
    val type: String = "photo",
    val title: String = "",
    val description: String = "",
    val remoteUrl: String = "",
    val bytes: ByteArray? = null,
    val filename: String? = null,
    val contentType: String? = null,
)

data class PortalUiState(
    val loading: Boolean = true,
    val error: String? = null,
    val user: UserProfile = UserProfile(),
    val completeness: CompletenessResponse = CompletenessResponse(),
    val demoMode: Boolean = false,
    val tab: PortalTab = PortalTab.PROFILE,
    val savingProfile: Boolean = false,
    val savingMedia: Boolean = false,
    val uploadingPhoto: Boolean = false,
    val publicProfile: PublicProfile? = null,
    val loadingPublic: Boolean = false,
    val toast: String? = null,
)

class PortalViewModel(app: Application) : AndroidViewModel(app) {

    private val app = app as CineConnectApp
    private val repository = app.repository

    var state by mutableStateOf(PortalUiState())
        private set

    init {
        load()
    }

    fun load() {
        if (!repository.isSignedIn) {
            // Signed-out users get the same demo talent the web portal falls back to.
            state = state.copy(
                loading = false,
                demoMode = true,
                user = DemoContent.user,
                completeness = DemoContent.completeness,
                error = null
            )
            return
        }

        viewModelScope.launch {
            state = state.copy(loading = true, error = null)
            when (val me = repository.getMe()) {
                is ApiResult.Success -> {
                    state = state.copy(loading = false, user = me.data, error = null)
                    when (val completeness = repository.getCompleteness()) {
                        is ApiResult.Success -> state = state.copy(completeness = completeness.data)
                        is ApiResult.Failure -> Unit
                    }
                }

                is ApiResult.Failure -> state = state.copy(
                    loading = false,
                    error = me.message,
                    user = DemoContent.user,
                    completeness = DemoContent.completeness,
                    demoMode = true
                )
            }
        }
    }

    fun selectTab(tab: PortalTab) {
        state = state.copy(tab = tab)
    }

    fun saveProfile(draft: ProfileDraft) {
        if (state.demoMode) {
            state = state.copy(
                toast = "Sign in to save your profile",
                user = state.user.copy(
                    profile = state.user.profile?.copy(
                        name = draft.name,
                        bio = draft.bio,
                        primary_craft = draft.primaryCraft,
                        secondary_crafts = draft.secondaryCrafts,
                        city = draft.city,
                        state = draft.state,
                        travel_radius_km = draft.travelRadiusKm,
                        gender = draft.gender,
                        date_of_birth = draft.dateOfBirth,
                    )
                )
            )
            return
        }

        viewModelScope.launch {
            state = state.copy(savingProfile = true)
            val request = ProfileUpdateRequest(
                name = draft.name.ifBlank { null },
                bio = draft.bio.ifBlank { null },
                primary_craft = draft.primaryCraft.ifBlank { null },
                secondary_crafts = draft.secondaryCrafts.ifEmpty { null },
                city = draft.city.ifBlank { null },
                state = draft.state.ifBlank { null },
                travel_radius_km = draft.travelRadiusKm,
                gender = draft.gender.ifBlank { null },
                date_of_birth = draft.dateOfBirth.ifBlank { null },
                languages = draft.languages.ifEmpty { null },
                availability = availabilityJson(draft),
            )
            when (val result = repository.updateProfile(request)) {
                is ApiResult.Success -> {
                    state = state.copy(
                        savingProfile = false,
                        user = state.user.copy(profile = result.data),
                        toast = "Profile updated"
                    )
                    refreshCompleteness()
                }

                is ApiResult.Failure -> state = state.copy(
                    savingProfile = false,
                    toast = result.message
                )
            }
        }
    }

    /** Uploads a new headshot and points the profile at the CDN URL. */
    fun uploadPhoto(bytes: ByteArray, filename: String, contentType: String) {
        if (state.demoMode) {
            state = state.copy(toast = "Sign in to change your photo")
            return
        }

        viewModelScope.launch {
            state = state.copy(uploadingPhoto = true)
            when (val uploaded = repository.uploadBytes(filename, contentType, bytes, purpose = "profile")) {
                is ApiResult.Failure -> {
                    state = state.copy(uploadingPhoto = false, toast = uploaded.message)
                    return@launch
                }

                is ApiResult.Success -> {
                    val url = uploaded.data.cdn_url.ifBlank { uploaded.data.upload_url }
                    when (val result = repository.updateProfile(ProfileUpdateRequest(photo_url = url))) {
                        is ApiResult.Success -> state = state.copy(
                            uploadingPhoto = false,
                            user = state.user.copy(profile = result.data),
                            toast = "Photo updated"
                        )

                        is ApiResult.Failure -> state = state.copy(
                            uploadingPhoto = false,
                            toast = result.message
                        )
                    }
                }
            }
        }
    }

    private fun availabilityJson(draft: ProfileDraft): JsonObject = buildJsonObject {
        if (draft.availabilityStatus.isNotBlank()) put("status", draft.availabilityStatus)
        if (draft.availabilityNote.isNotBlank()) put("note", draft.availabilityNote)
    }

    /**
     * Publishes a media item. When [MediaDraft.bytes] is present the file is
     * uploaded through the backend's presigned-URL flow first.
     */
    fun uploadMedia(draft: MediaDraft) {
        if (state.demoMode) {
            state = state.copy(toast = "Sign in to publish your work")
            return
        }

        viewModelScope.launch {
            state = state.copy(savingMedia = true)

            var url = draft.remoteUrl.trim()
            if (url.isBlank() && draft.bytes != null && draft.filename != null && draft.contentType != null) {
                when (val uploaded = repository.uploadBytes(draft.filename, draft.contentType, draft.bytes)) {
                    is ApiResult.Failure -> {
                        state = state.copy(savingMedia = false, toast = uploaded.message)
                        return@launch
                    }

                    is ApiResult.Success -> {
                        url = uploaded.data.cdn_url.ifBlank { uploaded.data.upload_url }
                    }
                }
            }

            val request = PortfolioCreateRequest(
                type = draft.type,
                s3_url = url.ifBlank { DEFAULT_MEDIA_URL },
                title = draft.title.ifBlank { "Showcase Media" },
                description = draft.description.ifBlank { null },
                is_public = true
            )
            when (val result = repository.addPortfolioItem(request)) {
                is ApiResult.Success -> {
                    state = state.copy(
                        savingMedia = false,
                        user = state.user.copy(portfolio = listOf(result.data) + state.user.portfolio),
                        toast = "Media published"
                    )
                    refreshCompleteness()
                }

                is ApiResult.Failure -> state = state.copy(
                    savingMedia = false,
                    toast = result.message
                )
            }
        }
    }

    fun deletePortfolioItem(id: String) {
        if (state.demoMode) {
            state = state.copy(toast = "Sign in to manage your media")
            return
        }
        state = state.copy(user = state.user.copy(portfolio = state.user.portfolio.filterNot { it.id == id }))
        viewModelScope.launch {
            when (val result = repository.deletePortfolioItem(id)) {
                is ApiResult.Success -> refreshCompleteness()
                is ApiResult.Failure -> state = state.copy(toast = result.message)
            }
        }
    }

    fun signOut() {
        repository.signOut()
        state = PortalUiState(loading = false, demoMode = true, user = DemoContent.user)
    }

    fun consumeToast() {
        state = state.copy(toast = null)
    }

    /** Loads the producer-facing view of this talent's profile. */
    fun loadPublicProfile() {
        if (state.user.id.isBlank()) return
        viewModelScope.launch {
            state = state.copy(loadingPublic = true)
            when (val result = repository.getPublicProfile(state.user.id)) {
                is ApiResult.Success -> state = state.copy(
                    loadingPublic = false,
                    publicProfile = result.data
                )

                is ApiResult.Failure -> state = state.copy(
                    loadingPublic = false,
                    toast = result.message
                )
            }
        }
    }

    private fun refreshCompleteness() {
        viewModelScope.launch {
            when (val result = repository.getCompleteness()) {
                is ApiResult.Success -> state = state.copy(completeness = result.data)
                is ApiResult.Failure -> Unit
            }
        }
    }
    private companion object {
        const val DEFAULT_MEDIA_URL =
            "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80"
    }
}
