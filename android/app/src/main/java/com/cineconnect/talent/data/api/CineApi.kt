package com.cineconnect.talent.data.api

import com.cineconnect.talent.data.model.CompletenessResponse
import com.cineconnect.talent.data.model.ExperienceItem
import com.cineconnect.talent.data.model.ExperienceRequest
import com.cineconnect.talent.data.model.LoginRequest
import com.cineconnect.talent.data.model.MessageResponse
import com.cineconnect.talent.data.model.OtpSendRequest
import com.cineconnect.talent.data.model.OtpVerifyRequest
import com.cineconnect.talent.data.model.PortfolioCreateRequest
import com.cineconnect.talent.data.model.PortfolioItem
import com.cineconnect.talent.data.model.ProfileDetail
import com.cineconnect.talent.data.model.ProfileUpdateRequest
import com.cineconnect.talent.data.model.PublicProfile
import com.cineconnect.talent.data.model.RegisterRequest
import com.cineconnect.talent.data.model.SkillCatalogItem
import com.cineconnect.talent.data.model.SkillItemPayload
import com.cineconnect.talent.data.model.SkillsUpdateRequest
import com.cineconnect.talent.data.model.TokenResponse
import com.cineconnect.talent.data.model.UploadUrlRequest
import com.cineconnect.talent.data.model.UploadUrlResponse
import com.cineconnect.talent.data.model.UserProfile
import com.cineconnect.talent.data.model.UserSkill
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

/** Mirrors `backend/app/routers/*` — all paths are relative to `/api/v1`. */
interface CineApi {

    // Auth
    @POST("auth/register")
    suspend fun register(@Body body: RegisterRequest): TokenResponse

    @POST("auth/login")
    suspend fun login(@Body body: LoginRequest): TokenResponse

    @POST("auth/otp/send")
    suspend fun sendOtp(@Body body: OtpSendRequest): MessageResponse

    @POST("auth/otp/verify")
    suspend fun verifyOtp(@Body body: OtpVerifyRequest): TokenResponse

    // Profile
    @GET("users/me")
    suspend fun getMe(): UserProfile

    @PATCH("users/me")
    suspend fun updateProfile(@Body body: ProfileUpdateRequest): ProfileDetail

    @GET("users/me/completeness")
    suspend fun getCompleteness(): CompletenessResponse

    @GET("users/{user_id}/public")
    suspend fun getPublicProfile(@Path("user_id") userId: String): PublicProfile

    // Skills
    @GET("users/skills/catalog")
    suspend fun getSkillsCatalog(): List<SkillCatalogItem>

    @GET("users/me/skills")
    suspend fun getMySkills(): List<UserSkill>

    @PUT("users/me/skills")
    suspend fun updateSkills(@Body body: SkillsUpdateRequest): List<UserSkill>

    // Experience
    @GET("users/me/experience")
    suspend fun getExperience(): List<ExperienceItem>

    @POST("users/me/experience")
    suspend fun addExperience(@Body body: ExperienceRequest): ExperienceItem

    @DELETE("users/me/experience/{id}")
    suspend fun deleteExperience(@Path("id") id: String): Response<Unit>

    // Portfolio
    @GET("users/me/portfolio")
    suspend fun getPortfolio(): List<PortfolioItem>

    @POST("users/me/portfolio")
    suspend fun addPortfolioItem(@Body body: PortfolioCreateRequest): PortfolioItem

    @DELETE("users/me/portfolio/{id}")
    suspend fun deletePortfolioItem(@Path("id") id: String): Response<Unit>

    // Media
    @POST("media/upload-url")
    suspend fun getUploadUrl(@Body body: UploadUrlRequest): UploadUrlResponse
}
