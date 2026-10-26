package com.cineconnect.talent.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val CineDarkColors = darkColorScheme(
    primary = Cine.AccentGold,
    onPrimary = Color.Black,
    primaryContainer = Cine.AccentGoldSoft,
    onPrimaryContainer = Cine.BadgeGoldText,
    secondary = Cine.AccentCyan,
    onSecondary = Color.Black,
    secondaryContainer = rgba(0x06B6D4L, 0.15f),
    onSecondaryContainer = Cine.BadgeCyanText,
    tertiary = Cine.AccentPurple,
    onTertiary = Color.White,
    background = Cine.BgPrimary,
    onBackground = Cine.TextPrimary,
    surface = Cine.BgSecondary,
    onSurface = Cine.TextPrimary,
    surfaceVariant = Cine.BgTertiary,
    onSurfaceVariant = Cine.TextSecondary,
    surfaceContainer = Cine.BgSecondary,
    surfaceContainerHigh = Cine.BgTertiary,
    surfaceContainerHighest = Cine.BgTertiary,
    outline = Cine.BorderSubtle,
    outlineVariant = Cine.BorderSubtle,
    error = Cine.ErrorSolid,
    onError = Color.White,
    errorContainer = Cine.ErrorSoft,
    onErrorContainer = Cine.ErrorText,
    scrim = Cine.Overlay,
)

@Composable
fun CineConnectTheme(
    @Suppress("UNUSED_PARAMETER") darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            WindowCompat.getInsetsController(window, view).apply {
                isAppearanceLightStatusBars = false
                isAppearanceLightNavigationBars = false
            }
        }
    }

    MaterialTheme(
        colorScheme = CineDarkColors,
        typography = CineTypography,
        shapes = CineShapes,
        content = content,
    )
}
