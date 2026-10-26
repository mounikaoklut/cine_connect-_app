package com.cineconnect.talent.ui.setup

import android.app.Application
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.cineconnect.talent.CineConnectApp
import com.cineconnect.talent.data.model.LanguagePayload
import com.cineconnect.talent.data.model.ProfileUpdateRequest
import com.cineconnect.talent.data.model.SkillItemPayload
import com.cineconnect.talent.data.model.SkillsUpdateRequest
import com.cineconnect.talent.data.model.languageEntries
import com.cineconnect.talent.data.repository.ApiResult
import kotlinx.coroutines.launch
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

/** Mirrors `ProfileData` in `frontend/src/app/profile-setup/page.tsx`. */
data class SetupUiState(
    val step: Int = 1,
    val fullName: String = "",
    val stageName: String = "",
    val email: String = "",
    val phone: String = "",
    val dateOfBirth: String = "",
    val city: String = "",
    val gender: String = "",
    val languages: String = "",
    val primaryRole: String = "",
    val experience: String = "",
    val selectedSkills: Set<String> = emptySet(),
    val bio: String = "",
    val showreelUrl: String = "",
    val portfolioLinks: String = "",
    val photoUploaded: Boolean = false,
    val saving: Boolean = false,
    val toast: String? = null,
    val catalog: List<String> = SetupContent.skills,
    val catalogIds: Map<String, Int> = emptyMap(),
) {
    /** `computeCompletion` from the web wizard. */
    val completion: Int
        get() {
            var score = 10
            if (photoUploaded) score += 5
            if (fullName.isNotBlank()) score += 10
            if (email.isNotBlank()) score += 5
            if (phone.isNotBlank()) score += 5
            if (dateOfBirth.isNotBlank()) score += 5
            if (city.isNotBlank()) score += 5
            if (gender.isNotBlank()) score += 5
            if (languages.isNotBlank()) score += 5
            if (primaryRole.isNotBlank()) score += 15
            if (experience.isNotBlank()) score += 10
            if (selectedSkills.isNotEmpty()) score += 10
            if (bio.isNotBlank()) score += 10
            return score.coerceAtMost(100)
        }

    fun stepStatus(key: String): StepStatus = when (key) {
        "account" -> StepStatus.DONE
        "basic" -> when {
            fullName.isNotBlank() && email.isNotBlank() && phone.isNotBlank() &&
                dateOfBirth.isNotBlank() && city.isNotBlank() && gender.isNotBlank() -> StepStatus.DONE

            fullName.isNotBlank() || email.isNotBlank() -> StepStatus.ACTIVE
            else -> StepStatus.PENDING
        }

        "professional" -> when {
            primaryRole.isNotBlank() && experience.isNotBlank() -> StepStatus.DONE
            primaryRole.isNotBlank() -> StepStatus.ACTIVE
            else -> StepStatus.PENDING
        }

        "skills" -> when {
            selectedSkills.isNotEmpty() && bio.isNotBlank() -> StepStatus.DONE
            selectedSkills.isNotEmpty() -> StepStatus.ACTIVE
            else -> StepStatus.PENDING
        }

        else -> StepStatus.PENDING
    }
}

enum class StepStatus { DONE, ACTIVE, PENDING }

class ProfileSetupViewModel(app: Application) : AndroidViewModel(app) {

    private val app = app as CineConnectApp
    private val repository = app.repository

    var state by mutableStateOf(SetupUiState())
        private set

    init {
        prefill()
        loadCatalog()
    }

    private fun prefill() {
        viewModelScope.launch {
            when (val me = repository.getMe()) {
                is ApiResult.Success -> {
                    val profile = me.data.profile
                    state = state.copy(
                        fullName = profile?.name.orEmpty(),
                        email = me.data.email.orEmpty(),
                        phone = me.data.phone.orEmpty(),
                        dateOfBirth = profile?.date_of_birth.orEmpty(),
                        city = profile?.city.orEmpty(),
                        gender = profile?.gender.orEmpty(),
                        languages = profile?.languageEntries?.mapNotNull { it.lang }.orEmpty().joinToString(", "),
                        primaryRole = profile?.primary_craft.orEmpty(),
                        bio = profile?.bio.orEmpty(),
                        photoUploaded = !profile?.photo_url.isNullOrBlank(),
                        selectedSkills = me.data.skills.map { it.skill_name }.toSet(),
                    )
                }

                is ApiResult.Failure -> Unit
            }
        }
    }

    private fun loadCatalog() {
        viewModelScope.launch {
            when (val catalog = repository.getSkillsCatalog()) {
                is ApiResult.Success -> {
                    val names = catalog.data.map { it.name }
                    if (names.isNotEmpty()) {
                        state = state.copy(
                            catalog = names,
                            catalogIds = catalog.data.associate { it.name to it.id },
                        )
                    }
                }

                is ApiResult.Failure -> Unit
            }
        }
    }

    fun update(transform: (SetupUiState) -> SetupUiState) {
        state = transform(state)
    }

    fun toggleSkill(skill: String) {
        val current = state.selectedSkills
        state = state.copy(
            selectedSkills = if (skill in current) current - skill else current + skill
        )
    }

    fun next() {
        if (state.step < 4) state = state.copy(step = state.step + 1)
    }

    fun back() {
        if (state.step > 1) state = state.copy(step = state.step - 1)
    }

    fun goToStep(step: Int) {
        if (step in 1..4) state = state.copy(step = step)
    }

    fun save(onDone: () -> Unit, exitOnFailure: Boolean = false) {
        if (!repository.isSignedIn) {
            state = state.copy(toast = "Sign in before saving your profile")
            if (exitOnFailure) onDone()
            return
        }

        viewModelScope.launch {
            state = state.copy(saving = true)

            val languages = state.languages
                .split(",")
                .map { it.trim() }
                .filter { it.isNotEmpty() }
                .map { LanguagePayload(lang = it, fluency = "Fluent") }
                .takeIf { it.isNotEmpty() }

            val availability = buildJsonObject {
                put("status", if (state.experience.isNotBlank()) "available" else "not_available")
                put("note", state.experience)
            }

            val request = ProfileUpdateRequest(
                name = state.fullName.ifBlank { null },
                bio = state.bio.ifBlank { null },
                photo_url = null,
                date_of_birth = state.dateOfBirth.ifBlank { null },
                gender = state.gender.ifBlank { null },
                primary_craft = state.primaryRole.ifBlank { null },
                secondary_crafts = null,
                city = state.city.ifBlank { null },
                state = null,
                travel_radius_km = null,
                languages = languages,
                availability = availability,
            )

            when (val result = repository.updateProfile(request)) {
                is ApiResult.Failure -> {
                    state = state.copy(saving = false, toast = result.message)
                    if (exitOnFailure) onDone()
                    return@launch
                }

                is ApiResult.Success -> Unit
            }

            val skills = state.selectedSkills.mapNotNull { name ->
                state.catalogIds[name]?.let { SkillItemPayload(skill_id = it) }
            }
            if (skills.isNotEmpty()) {
                repository.updateSkills(SkillsUpdateRequest(skills))
            }

            if (state.showreelUrl.isNotBlank()) {
                repository.addPortfolioItem(
                    com.cineconnect.talent.data.model.PortfolioCreateRequest(
                        type = "video",
                        s3_url = state.showreelUrl.trim(),
                        title = "Showreel",
                        description = "Showreel added from profile setup",
                        is_public = true,
                    )
                )
            }

            state = state.copy(saving = false, toast = "Profile saved")
            onDone()
        }
    }

    fun consumeToast() {
        state = state.copy(toast = null)
    }
}
