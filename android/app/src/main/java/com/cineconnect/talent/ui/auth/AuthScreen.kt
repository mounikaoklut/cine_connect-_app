package com.cineconnect.talent.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.cineconnect.talent.ui.components.BrandMark
import com.cineconnect.talent.ui.components.CineBackground
import com.cineconnect.talent.ui.components.CineChip
import com.cineconnect.talent.ui.components.CineTextField
import com.cineconnect.talent.ui.components.GhostButton
import com.cineconnect.talent.ui.components.GoldButton
import com.cineconnect.talent.ui.theme.Cine
import com.cineconnect.talent.ui.theme.Radii

@Composable
fun AuthScreen(
    onAuthenticated: () -> Unit,
    onOpenSetup: () -> Unit,
    viewModel: AuthViewModel = viewModel(),
) {
    val state = viewModel.state

    LaunchedEffect(state.signedIn) {
        if (state.signedIn) onAuthenticated()
    }

    CineBackground {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .imePadding()
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Spacer(Modifier.height(56.dp))

            BrandMark(size = 56.dp)

            Spacer(Modifier.height(14.dp))

            Text(
                text = if (state.mode == AuthMode.REGISTER) "Create Talent Account" else "Welcome Back",
                style = MaterialTheme.typography.headlineMedium,
                color = Cine.TextPrimary,
                textAlign = TextAlign.Center,
            )
            Text(
                text = "Connect directly with casting directors and studios",
                style = MaterialTheme.typography.bodyMedium,
                color = Cine.TextSecondary,
                textAlign = TextAlign.Center,
            )

            Spacer(Modifier.height(20.dp))

            // Method switcher: email / phone
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                CineChip(
                    text = "Email",
                    selected = state.method == AuthMethod.EMAIL,
                    onClick = { viewModel.setMethod(AuthMethod.EMAIL) },
                )
                CineChip(
                    text = "Phone + OTP",
                    selected = state.method == AuthMethod.PHONE,
                    onClick = { viewModel.setMethod(AuthMethod.PHONE) },
                )
            }

            Spacer(Modifier.height(18.dp))

            if (state.error != null) {
                ErrorBanner(state.error!!)
                Spacer(Modifier.height(16.dp))
            }

            if (state.method == AuthMethod.EMAIL) {
                if (state.mode == AuthMode.REGISTER) {
                    CineTextField(
                        value = state.name,
                        onValueChange = viewModel::onName,
                        label = "Full Name",
                        placeholder = "e.g. Aryan Sharma",
                    )
                    Spacer(Modifier.height(14.dp))
                }

                CineTextField(
                    value = state.email,
                    onValueChange = viewModel::onEmail,
                    label = "Email Address",
                    placeholder = "name@cineconnect.com",
                    keyboardType = KeyboardType.Email,
                )
                Spacer(Modifier.height(14.dp))

                CineTextField(
                    value = state.password,
                    onValueChange = viewModel::onPassword,
                    label = "Password",
                    placeholder = "••••••••",
                    keyboardType = KeyboardType.Password,
                    visualTransformation = PasswordVisualTransformation(),
                )
            } else {
                CineTextField(
                    value = state.phone,
                    onValueChange = viewModel::onPhone,
                    label = "Phone number",
                    placeholder = "+91 00000-00000",
                    keyboardType = KeyboardType.Phone,
                )
                Spacer(Modifier.height(14.dp))

                if (state.otpSent) {
                    CineTextField(
                        value = state.otp,
                        onValueChange = viewModel::onOtp,
                        label = "6-digit OTP",
                        placeholder = "000000",
                        keyboardType = KeyboardType.NumberPassword,
                    )
                }
            }

            Spacer(Modifier.height(22.dp))

            GoldButton(
                text = when {
                    state.loading -> "Authenticating..."
                    state.method == AuthMethod.PHONE && !state.otpSent -> "Send OTP"
                    state.mode == AuthMode.REGISTER -> "Sign Up & Build Profile"
                    else -> "Sign In"
                },
                onClick = viewModel::submit,
                enabled = !state.loading,
                modifier = Modifier.fillMaxWidth(),
            )

            Spacer(Modifier.height(16.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = if (state.mode == AuthMode.REGISTER) "Already have an account? " else "New to CineConnect? ",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Cine.TextMuted,
                )
                GhostButton(
                    text = if (state.mode == AuthMode.REGISTER) "Sign In" else "Create Account",
                    onClick = {
                        viewModel.setMode(
                            if (state.mode == AuthMode.REGISTER) AuthMode.LOGIN else AuthMode.REGISTER
                        )
                    },
                    color = Cine.AccentGold,
                )
            }

            Spacer(Modifier.height(10.dp))

            GhostButton(
                text = "Preview the demo talent profile",
                onClick = onAuthenticated,
                color = Cine.TextMuted,
            )

            Spacer(Modifier.height(12.dp))

            GhostButton(
                text = "Set up your talent profile",
                onClick = onOpenSetup,
                color = Cine.TextMuted,
            )

            Spacer(Modifier.height(40.dp))
        }
    }
}

@Composable
private fun ErrorBanner(message: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Cine.ErrorSoft, RoundedCornerShape(Radii.md))
            .padding(horizontal = 14.dp, vertical = 10.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = Icons.Filled.Warning,
                contentDescription = null,
                tint = Cine.ErrorText,
                modifier = Modifier.size(16.dp),
            )
            Spacer(Modifier.width(8.dp))
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
                color = Cine.ErrorText,
            )
        }
    }
}
