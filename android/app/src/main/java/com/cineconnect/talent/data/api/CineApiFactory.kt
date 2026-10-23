package com.cineconnect.talent.data.api

import com.cineconnect.talent.BuildConfig
import com.cineconnect.talent.data.session.SessionManager
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import java.util.concurrent.TimeUnit

object CineApiFactory {

    val json: Json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        coerceInputValues = true
        explicitNulls = false
        encodeDefaults = false
    }

    /**
     * A plain client used for the presigned S3 `PUT` — it must not carry the
     * `Authorization` header, the signature is already part of the URL.
     */
    val uploadClient: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(120, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .build()
    }

    fun create(session: SessionManager): CineApi {
        val client = OkHttpClient.Builder()
            .connectTimeout(20, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .addInterceptor { chain ->
                val builder = chain.request().newBuilder()
                    .header("Accept", "application/json")
                session.accessToken
                    ?.takeIf { it.isNotBlank() }
                    ?.let { builder.header("Authorization", "Bearer $it") }
                chain.proceed(builder.build())
            }
            .apply {
                if (BuildConfig.DEBUG) {
                    addInterceptor(
                        HttpLoggingInterceptor().apply {
                            level = HttpLoggingInterceptor.Level.BASIC
                        }
                    )
                }
            }
            .build()

        return Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(client)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .build()
            .create(CineApi::class.java)
    }
}
