package com.cineconnect.talent.ui.auth

import android.app.Application
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.cineconnect.talent.CineConnectApp
import com.cineconnect.talent.data.repository.ApiResult
import kotlinx.coroutines.launch

enum class AuthMode { REGISTER, LOGIN }

enum class AuthMethod { EMAIL, PHONE }

data class AuthUiState(
    val mode: AuthMode = AuthMode.REGISTER,
    val method: AuthMethod = AuthMethod.EMAIL,
    val name: String = "",
    val email: String = "",
    val password: String = "",
    val phone: String = "+91 ",
    val otp: String = "",
    val otpSent: Boolean = false,
    val loading: Boolean = false,
    val error: String? = null,
    val signedIn: Boolean = false,
)

class AuthViewModel(app: Application) : AndroidViewModel(app) {

    private val repository = (app as CineConnectApp).repository

    var state by mutableStateOf(AuthUiState())
        private set

    fun setMode(mode: AuthMode) {
        state = state.copy(mode = mode, error = null)
    }

    fun setMethod(method: AuthMethod) {
        state = state.copy(method = method, error = null, otpSent = false, otp = "")
    }

    fun onName(value: String) { state = state.copy(name = value) }
    fun onEmail(value: String) { state = state.copy(email = value) }
    fun onPassword(value: String) { state = state.copy(password = value) }
    fun onPhone(value: String) { state = state.copy(phone = value) }
    fun onOtp(value: String) { state = state.copy(otp = value.filter { it.isDigit() }.take(6)) }

    fun submit() {
        val current = state
        if (current.method == AuthMethod.EMAIL) submitEmail(current) else submitPhone(current)
    }

    private fun submitEmail(current: AuthUiState) {
        if (current.mode == AuthMode.REGISTER && current.name.isBlank()) {
            state = current.copy(error = "Please enter your full name")
            return
        }
        if (!current.email.contains("@")) {
            state = current.copy(error = "Enter a valid email address")
            return
        }
        if (current.password.length < 8) {
            state = current.copy(error = "Password must be at least 8 characters")
            return
        }

        viewModelScope.launch {
            state = state.copy(loading = true, error = null)
            val result = if (current.mode == AuthMode.REGISTER) {
                repository.register(
                    name = current.name.trim(),
                    email = current.email.trim(),
                    password = current.password
                )
            } else {
                repository.login(email = current.email.trim(), password = current.password)
            }
            state = when (result) {
                is ApiResult.Success -> state.copy(loading = false, signedIn = true)
                is ApiResult.Failure -> state.copy(loading = false, error = result.message)
            }
        }
    }

    private fun submitPhone(current: AuthUiState) {
        if (current.phone.trim().length < 8) {
            state = current.copy(error = "Enter a valid phone number")
            return
        }
        if (!current.otpSent) {
            viewModelScope.launch {
                state = state.copy(loading = true, error = null)
                when (val result = repository.sendOtp(current.phone.trim())) {
                    is ApiResult.Success -> state = state.copy(loading = false, otpSent = true)
                    is ApiResult.Failure -> state = state.copy(loading = false, error = result.message)
                }
            }
            return
        }
        if (current.otp.length != 6) {
            state = current.copy(error = "Enter the 6-digit OTP")
            return
        }

        viewModelScope.launch {
            state = state.copy(loading = true, error = null)
            when (val result = repository.verifyOtp(current.phone.trim(), current.otp)) {
                is ApiResult.Success -> state = state.copy(loading = false, signedIn = true)
                is ApiResult.Failure -> state = state.copy(loading = false, error = result.message)
            }
        }
    }
}
