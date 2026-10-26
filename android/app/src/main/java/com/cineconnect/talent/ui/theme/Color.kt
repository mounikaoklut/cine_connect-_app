package com.cineconnect.talent.ui.theme

import androidx.compose.ui.graphics.Color

/**
 * Direct port of the `:root` custom properties in
 * `frontend/src/app/globals.css` ("Cinematic Noir & Amber Gold").
 */
fun rgba(hex: Long, alpha: Float = 1f): Color = Color(
    red = ((hex shr 16) and 0xFF) / 255f,
    green = ((hex shr 8) and 0xFF) / 255f,
    blue = (hex and 0xFF) / 255f,
    alpha = alpha,
)

object Cine {

    // Surfaces
    val BgPrimary = Color(0xFF080A0F)
    val BgSecondary = Color(0xFF0F131C)
    val BgTertiary = Color(0xFF161C28)
    val BgGlass = rgba(0x10141EL, 0.75f)
    val BgGlassHover = rgba(0x181E2CL, 0.85f)
    val PreviewBg = Color(0xFF05070A)

    // Borders
    val BorderSubtle = rgba(0xFFFFFFL, 0.08f)
    val BorderGlow = rgba(0xF59E0BL, 0.3f)
    val BorderGoldStrong = rgba(0xF59E0BL, 0.4f)

    // Text
    val TextPrimary = Color(0xFFF8FAFC)
    val TextSecondary = Color(0xFF94A3B8)
    val TextMuted = Color(0xFF64748B)
    val TextFaint = Color(0xFF475569)
    val TextGhost = Color(0xFF334155)

    // Accents
    val AccentGold = Color(0xFFF59E0B)
    val AccentGoldHover = Color(0xFFD97706)
    val AccentGoldSoft = rgba(0xF59E0BL, 0.15f)
    val AccentCyan = Color(0xFF06B6D4)
    val AccentPurple = Color(0xFF8B5CF6)
    val AccentEmerald = Color(0xFF10B981)
    val AccentRose = Color(0xFFF43F5E)

    // Badge text tints
    val BadgeGoldText = Color(0xFFFBBF24)
    val BadgeCyanText = Color(0xFF38BDF8)
    val BadgeEmeraldText = Color(0xFF34D399)
    val BadgeIndigoSoft = rgba(0x6366F1L, 0.15f)
    val BadgeIndigoText = Color(0xFFA5B4FC)

    // Status
    val EmeraldSoft = rgba(0x10B981L, 0.12f)
    val EmeraldBorder = rgba(0x10B981L, 0.3f)
    val EmeraldFaint = rgba(0x10B981L, 0.08f)
    val ErrorSoft = rgba(0xEF4444L, 0.15f)
    val ErrorBorder = rgba(0xEF4444L, 0.3f)
    val ErrorText = Color(0xFFFCA5A5)
    val ErrorSolid = Color(0xFFEF4444)

    // Misc surfaces
    val SurfaceElevated = rgba(0x161C28L, 0.8f)
    val SurfaceMuted = rgba(0xFFFFFFL, 0.05f)
    val Track = rgba(0xFFFFFFL, 0.1f)
    val Backdrop = Color(0xFF0F172A).copy(alpha = 0.7f)
    val Overlay = Color(0xFF000000).copy(alpha = 0.75f)
}
