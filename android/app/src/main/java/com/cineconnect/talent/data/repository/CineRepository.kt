package com.cineconnect.talent.data.repository

import com.cineconnect.talent.data.api.CineApi
import com.cineconnect.talent.data.api.CineApiFactory
import com.cineconnect.talent.data.model.CompletenessResponse
import com.cineconnect.talent.data.model.ExperienceItem
import com.cineconnect.talent.data.model.ExperienceRequest
import com.cineconnect.talent.data.model.LoginRequest
import com.cineconnect.talent.data.model.OtpSendRequest
import com.cineconnect.talent.data.model.OtpVerifyRequest
import com.cineconnect.talent.data.model.PortfolioCreateRequest
import com.cineconnect.talent.data.model.PortfolioItem
import com.cineconnect.talent.data.model.ProfileUpdateRequest
import com.cineconnect.talent.data.model.PublicProfile
import com.cineconnect.talent.data.model.RegisterRequest
import com.cineconnect.talent.data.model.SkillCatalogItem
import com.cineconnect.talent.data.model.SkillsUpdateRequest
import com.cineconnect.talent.data.model.TokenResponse
import com.cineconnect.talent.data.model.UploadUrlRequest
import com.cineconnect.talent.data.model.UploadUrlResponse
import com.cineconnect.talent.data.model.UserProfile
import com.cineconnect.talent.data.model.UserSkill
import com.cineconnect.talent.data.session.SessionManager
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import retrofit2.HttpException
import java.io.IOException

sealed interface ApiResult<out T> {
    data class Success<T>(val data: T) : ApiResult<T>
    data class Failure(val message: String, val code: Int = 0) : ApiResult<Nothing>
}

class CineRepository(
    private val api: CineApi,
    private val session: SessionManager,
) {

    val isSignedIn: Boolean get() = session.isSignedIn

    // ───────────────────────────── Auth ─────────────────────────────

    suspend fun register(name: String, email: String, password: String): ApiResult<TokenResponse> =
        call {
            val response = api.register(RegisterRequest(email = email, password = password, name = name))
            persist(response)
            response
        }

    suspend fun login(email: String, password: String): ApiResult<TokenResponse> = call {
        val response = api.login(LoginRequest(email = email, password = password))
        persist(response)
        response
    }

    suspend fun sendOtp(phone: String): ApiResult<String> = call {
        api.sendOtp(OtpSendRequest(phone = phone)).message
    }

    suspend fun verifyOtp(phone: String, otp: String): ApiResult<TokenResponse> = call {
        val response = api.verifyOtp(OtpVerifyRequest(phone = phone, otp = otp))
        persist(response)
        response
    }

    fun signOut() = session.clear()

    private fun persist(response: TokenResponse) {
        session.save(
            access = response.access_token,
            refresh = response.refresh_token,
            name = response.user.name ?: response.user.email,
            id = response.user.id
        )
    }

    // ─────────────────────────── Profile ───────────────────────────

    suspend fun getMe(): ApiResult<UserProfile> = call { api.getMe() }

    suspend fun getCompleteness(): ApiResult<CompletenessResponse> = call { api.getCompleteness() }

    suspend fun getPublicProfile(userId: String): ApiResult<PublicProfile> =
        call { api.getPublicProfile(userId) }

    suspend fun updateProfile(body: ProfileUpdateRequest): ApiResult<com.cineconnect.talent.data.model.ProfileDetail> =
        call { api.updateProfile(body) }

    suspend fun addExperience(body: ExperienceRequest): ApiResult<ExperienceItem> =
        call { api.addExperience(body) }

    suspend fun deleteExperience(id: String): ApiResult<Unit> = call {
        val response = api.deleteExperience(id)
        if (!response.isSuccessful) throw HttpException(response)
    }

    // ─────────────────────────── Skills ───────────────────────────

    suspend fun getSkillsCatalog(): ApiResult<List<SkillCatalogItem>> =
        call { api.getSkillsCatalog() }

    suspend fun getMySkills(): ApiResult<List<UserSkill>> = call { api.getMySkills() }

    suspend fun updateSkills(body: SkillsUpdateRequest): ApiResult<List<UserSkill>> =
        call { api.updateSkills(body) }

    // ─────────────────────────── Portfolio ───────────────────────────

    suspend fun addPortfolioItem(body: PortfolioCreateRequest): ApiResult<PortfolioItem> =
        call { api.addPortfolioItem(body) }

    suspend fun deletePortfolioItem(id: String): ApiResult<Unit> = call {
        val response = api.deletePortfolioItem(id)
        if (!response.isSuccessful) throw HttpException(response)
    }

    suspend fun getUploadUrl(
        filename: String,
        contentType: String,
        purpose: String = "portfolio",
    ): ApiResult<UploadUrlResponse> =
        call { api.getUploadUrl(UploadUrlRequest(filename, contentType, purpose)) }

    /**
     * Requests a presigned URL, `PUT`s the bytes to it and returns the CDN URL
     * that should be stored on the portfolio item.
     */
    suspend fun uploadBytes(
        filename: String,
        contentType: String,
        bytes: ByteArray,
        purpose: String = "portfolio",
    ): ApiResult<UploadUrlResponse> {
        return try {
            when (val target = getUploadUrl(filename, contentType, purpose)) {
                is ApiResult.Failure -> target
                is ApiResult.Success -> {
                    val body = bytes.toRequestBody(contentType.toMediaType())
                    val request = Request.Builder()
                        .url(target.data.upload_url)
                        .put(body)
                        .build()
                    CineApiFactory.uploadClient.newCall(request).execute().use { response ->
                        if (response.isSuccessful) {
                            ApiResult.Success(target.data)
                        } else {
                            ApiResult.Failure("Upload failed (HTTP ${response.code})")
                        }
                    }
                }
            }
        } catch (e: IOException) {
            ApiResult.Failure("Upload failed — check your connection")
        } catch (e: Exception) {
            ApiResult.Failure(e.message ?: "Upload failed")
        }
    }

    // ─────────────────────────── Plumbing ───────────────────────────

    private suspend fun <T> call(block: suspend () -> T): ApiResult<T> = try {
        ApiResult.Success(block())
    } catch (e: HttpException) {
        ApiResult.Failure(parseHttpError(e), e.code())
    } catch (e: IOException) {
        ApiResult.Failure("Network error — is the backend reachable?")
    } catch (e: kotlinx.serialization.SerializationException) {
        ApiResult.Failure("Unexpected response from server: ${e.message}")
    } catch (e: Exception) {
        ApiResult.Failure(e.message ?: "Something went wrong")
    }

    /** FastAPI reports errors as `{"detail": "..."}` or `{"detail": [{msg: "..."}]}`. */
    private fun parseHttpError(e: HttpException): String {
        val raw = runCatching { e.response()?.errorBody()?.string() }.getOrNull()
        if (raw.isNullOrBlank()) return "HTTP ${e.code()}"
        return runCatching {
            val detail = (CineApiFactory.json.parseToJsonElement(raw) as? JsonObject)?.get("detail")
            when (detail) {
                is JsonPrimitive -> detail.content
                is JsonArray -> (detail.firstOrNull() as? JsonObject)
                    ?.get("msg")
                    ?.let { (it as? JsonPrimitive)?.content }
                    ?: "HTTP ${e.code()}"
                else -> "HTTP ${e.code()}"
            }
        }.getOrDefault("HTTP ${e.code()}")
    }

    @Suppress("unused")
    private fun JsonElement.asText(): String? = (this as? JsonPrimitive)?.content
}
