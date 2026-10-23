package com.cineconnect.talent.data.session

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * Token storage. The web app keeps `cineconnect_access_token` in `localStorage`;
 * on Android we use `EncryptedSharedPreferences` so the JWT is encrypted at rest.
 */
class SessionManager(context: Context) {

    private val prefs: SharedPreferences = runCatching {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
        EncryptedSharedPreferences.create(
            context,
            FILE_NAME,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }.getOrElse {
        // Keystore hiccups shouldn't crash the app — fall back to plain prefs.
        context.getSharedPreferences("$FILE_NAME.fallback", Context.MODE_PRIVATE)
    }

    var accessToken: String?
        get() = prefs.getString(KEY_ACCESS, null)
        set(value) = prefs.edit().putString(KEY_ACCESS, value).apply()

    var refreshToken: String?
        get() = prefs.getString(KEY_REFRESH, null)
        set(value) = prefs.edit().putString(KEY_REFRESH, value).apply()

    var displayName: String?
        get() = prefs.getString(KEY_NAME, null)
        set(value) = prefs.edit().putString(KEY_NAME, value).apply()

    var userId: String?
        get() = prefs.getString(KEY_USER_ID, null)
        set(value) = prefs.edit().putString(KEY_USER_ID, value).apply()

    val isSignedIn: Boolean
        get() = !accessToken.isNullOrBlank()

    fun save(access: String, refresh: String?, name: String?, id: String?) {
        accessToken = access
        refreshToken = refresh
        displayName = name
        userId = id
    }

    fun clear() {
        prefs.edit().clear().apply()
    }

    private companion object {
        const val FILE_NAME = "cineconnect_secure"
        const val KEY_ACCESS = "access_token"
        const val KEY_REFRESH = "refresh_token"
        const val KEY_NAME = "display_name"
        const val KEY_USER_ID = "user_id"
    }
}
