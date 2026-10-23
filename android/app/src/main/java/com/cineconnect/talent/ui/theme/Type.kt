package com.cineconnect.talent.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.cineconnect.talent.R

/** 'Plus Jakarta Sans' — matches `--font-sans`. */
val JakartaSans = FontFamily(
    Font(R.font.plus_jakarta_sans_light, FontWeight.Light),
    Font(R.font.plus_jakarta_sans_regular, FontWeight.Normal),
    Font(R.font.plus_jakarta_sans_medium, FontWeight.Medium),
    Font(R.font.plus_jakarta_sans_semibold, FontWeight.SemiBold),
    Font(R.font.plus_jakarta_sans_bold, FontWeight.Bold),
    Font(R.font.plus_jakarta_sans_extrabold, FontWeight.ExtraBold),
)

/** 'Space Grotesk' — matches `--font-display`. */
val SpaceGrotesk = FontFamily(
    Font(R.font.space_grotesk_medium, FontWeight.Medium),
    Font(R.font.space_grotesk_semibold, FontWeight.SemiBold),
    Font(R.font.space_grotesk_bold, FontWeight.Bold),
)

/**
 * Scale derived from the web `rem` values (16px base) with the global
 * `line-height: 1.6` from `globals.css`.
 */
val CineTypography = Typography(
    displayLarge = TextStyle(
        fontFamily = SpaceGrotesk,
        fontWeight = FontWeight.Bold,
        fontSize = 32.sp,
        lineHeight = 41.sp,
        letterSpacing = (-0.5).sp
    ),
    headlineLarge = TextStyle(
        fontFamily = SpaceGrotesk,
        fontWeight = FontWeight.ExtraBold,
        fontSize = 32.sp,
        lineHeight = 41.sp,
        letterSpacing = (-0.6).sp
    ),
    headlineMedium = TextStyle(
        fontFamily = SpaceGrotesk,
        fontWeight = FontWeight.Bold,
        fontSize = 25.6.sp,
        lineHeight = 33.sp,
        letterSpacing = (-0.4).sp
    ),
    headlineSmall = TextStyle(
        fontFamily = SpaceGrotesk,
        fontWeight = FontWeight.Bold,
        fontSize = 20.sp,
        lineHeight = 27.sp,
        letterSpacing = (-0.3).sp
    ),
    titleLarge = TextStyle(
        fontFamily = SpaceGrotesk,
        fontWeight = FontWeight.Bold,
        fontSize = 20.sp,
        lineHeight = 27.sp,
        letterSpacing = (-0.2).sp
    ),
    titleMedium = TextStyle(
        fontFamily = JakartaSans,
        fontWeight = FontWeight.Bold,
        fontSize = 16.8.sp,
        lineHeight = 24.sp,
        letterSpacing = (-0.1).sp
    ),
    titleSmall = TextStyle(
        fontFamily = JakartaSans,
        fontWeight = FontWeight.SemiBold,
        fontSize = 14.4.sp,
        lineHeight = 21.sp
    ),
    bodyLarge = TextStyle(
        fontFamily = JakartaSans,
        fontWeight = FontWeight.Normal,
        fontSize = 15.2.sp,
        lineHeight = 24.sp
    ),
    bodyMedium = TextStyle(
        fontFamily = JakartaSans,
        fontWeight = FontWeight.Normal,
        fontSize = 13.6.sp,
        lineHeight = 22.sp
    ),
    bodySmall = TextStyle(
        fontFamily = JakartaSans,
        fontWeight = FontWeight.Normal,
        fontSize = 12.8.sp,
        lineHeight = 20.sp
    ),
    labelLarge = TextStyle(
        fontFamily = JakartaSans,
        fontWeight = FontWeight.Bold,
        fontSize = 15.2.sp,
        lineHeight = 20.sp
    ),
    labelMedium = TextStyle(
        fontFamily = JakartaSans,
        fontWeight = FontWeight.SemiBold,
        fontSize = 12.8.sp,
        lineHeight = 17.sp,
        letterSpacing = 0.3.sp
    ),
    labelSmall = TextStyle(
        fontFamily = JakartaSans,
        fontWeight = FontWeight.SemiBold,
        fontSize = 12.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.3.sp
    ),
)
