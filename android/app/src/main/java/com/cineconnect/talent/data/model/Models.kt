package com.cineconnect.talent.data.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull

// ───────────────────────────── Auth ─────────────────────────────

@Serializable
data class UserBrief(
    val id: String,
    val email: String? = null,
    val phone: String? = null,
    val name: String? = null,
    val email_verified: Boolean = false,
    val phone_verified: Boolean = false,
    val identity_verified: Boolean = false,
)

@Serializable
data class TokenResponse(
    val access_token: String,
    val refresh_token: String? = null,
    val token_type: String = "bearer",
    val user: UserBrief,
)

@Serializable
data class MessageResponse(
    val message: String = "",
)

@Serializable
data class RegisterRequest(
    val email: String,
    val password: String,
    val name: String,
)

@Serializable
data class LoginRequest(
    val email: String,
    val password: String,
)

@Serializable
data class OtpSendRequest(
    val phone: String,
)

@Serializable
data class OtpVerifyRequest(
    val phone: String,
    val otp: String,
)

// ───────────────────────────── Profile ─────────────────────────────

@Serializable
data class UserProfile(
    val id: String = "",
    val email: String? = null,
    val phone: String? = null,
    val auth_provider: String? = null,
    val email_verified: Boolean = false,
    val phone_verified: Boolean = false,
    val identity_verified: Boolean = false,
    val profile: ProfileDetail? = null,
    val skills: List<UserSkill> = emptyList(),
    val experiences: List<ExperienceItem> = emptyList(),
    val portfolio: List<PortfolioItem> = emptyList(),
)

@Serializable
data class ProfileDetail(
    val user_id: String? = null,
    val name: String? = null,
    val bio: String? = null,
    val photo_url: String? = null,
    val date_of_birth: String? = null,
    val gender: String? = null,
    val primary_craft: String? = null,
    val secondary_crafts: List<String> = emptyList(),
    val city: String? = null,
    val state: String? = null,
    val travel_radius_km: Int = 0,
    val languages: List<JsonElement> = emptyList(),
    val availability: JsonObject? = null,
    val completeness_score: Int = 0,
    val updated_at: String? = null,
)

/** `languages` is JSONB on the backend — it can be `[{lang, fluency}]` or `["Hindi"]`. */
val ProfileDetail.languageEntries: List<LanguageEntry>
    get() = languages.mapNotNull { element ->
        when (element) {
            is JsonPrimitive -> element.contentOrNull?.let { LanguageEntry(lang = it) }
            is JsonObject -> LanguageEntry(
                lang = (element["lang"] as? JsonPrimitive)?.contentOrNull,
                fluency = (element["fluency"] as? JsonPrimitive)?.contentOrNull,
            )
            else -> null
        }
    }

val ProfileDetail.availabilityStatus: String?
    get() = (availability?.get("status") as? JsonPrimitive)?.contentOrNull

val ProfileDetail.availabilityNote: String?
    get() = (availability?.get("note") as? JsonPrimitive)?.contentOrNull

data class LanguageEntry(
    val lang: String? = null,
    val fluency: String? = null,
)

@Serializable
data class LanguagePayload(
    val lang: String,
    val fluency: String,
)

@Serializable
data class ProfileUpdateRequest(
    val name: String? = null,
    val bio: String? = null,
    val photo_url: String? = null,
    val date_of_birth: String? = null,
    val gender: String? = null,
    val primary_craft: String? = null,
    val secondary_crafts: List<String>? = null,
    val city: String? = null,
    val state: String? = null,
    val travel_radius_km: Int? = null,
    val languages: List<LanguagePayload>? = null,
    val availability: JsonObject? = null,
)

@Serializable
data class CompletenessResponse(
    val score: Int = 0,
    val max_score: Int = 100,
    val suggestions: List<String> = emptyList(),
)

/** `GET /users/{user_id}/public` — the limited, producer-facing view. */
@Serializable
data class PublicProfile(
    val user_id: String = "",
    val name: String? = null,
    val bio: String? = null,
    val photo_url: String? = null,
    val primary_craft: String? = null,
    val secondary_crafts: List<String>? = null,
    val city: String? = null,
    val state: String? = null,
    val identity_verified: Boolean = false,
    val completeness_score: Int = 0,
)

// ───────────────────────────── Skills ─────────────────────────────

@Serializable
data class UserSkill(
    val skill_id: Int = 0,
    val skill_name: String = "",
    val category: String? = null,
    val proficiency: String = "intermediate",
)

@Serializable
data class SkillCatalogItem(
    val id: Int,
    val name: String,
    val category: String? = null,
)

@Serializable
data class SkillItemPayload(
    val skill_id: Int,
    val proficiency: String = "intermediate",
)

@Serializable
data class SkillsUpdateRequest(
    val skills: List<SkillItemPayload>,
)

// ─────────────────────────── Experience ───────────────────────────

@Serializable
data class ExperienceItem(
    val id: String = "",
    val user_id: String? = null,
    val title: String = "",
    val company: String? = null,
    val role_type: String? = null,
    val start_date: String? = null,
    val end_date: String? = null,
    val description: String? = null,
    val created_at: String? = null,
)

@Serializable
data class ExperienceRequest(
    val title: String,
    val company: String? = null,
    val role_type: String? = null,
    val start_date: String? = null,
    val end_date: String? = null,
    val description: String? = null,
)

// ─────────────────────────── Portfolio ───────────────────────────

@Serializable
data class PortfolioItem(
    val id: String = "",
    val user_id: String? = null,
    val type: String = "photo",
    val s3_url: String = "",
    val title: String? = null,
    val description: String? = null,
    val is_public: Boolean = true,
    val sort_order: Int = 0,
    val created_at: String? = null,
)

@Serializable
data class PortfolioCreateRequest(
    val type: String,
    val s3_url: String,
    val title: String? = null,
    val description: String? = null,
    val is_public: Boolean = true,
)

// ───────────────────────────── Media ─────────────────────────────

@Serializable
data class UploadUrlRequest(
    val filename: String,
    val content_type: String,
    val purpose: String = "portfolio",
)

@Serializable
data class UploadUrlResponse(
    val upload_url: String = "",
    val file_key: String = "",
    val cdn_url: String = "",
)

/** Fallback for `JsonArray` decoding where the API returns an array of objects. */
fun JsonArray.toObjects(): List<JsonObject> = mapNotNull { it as? JsonObject }
