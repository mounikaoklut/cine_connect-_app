package com.cineconnect.talent.ui.portal

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Upload
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.cineconnect.talent.data.model.availabilityNote
import com.cineconnect.talent.data.model.availabilityStatus
import com.cineconnect.talent.ui.components.CineBadge
import com.cineconnect.talent.ui.components.GlassPanel
import com.cineconnect.talent.ui.components.GhostButton
import com.cineconnect.talent.ui.components.GoldButton
import com.cineconnect.talent.ui.components.SecondaryButton
import com.cineconnect.talent.ui.theme.Cine
import com.cineconnect.talent.ui.theme.Radii

@Composable
fun HeroBanner(
    state: PortalUiState,
    onEdit: () -> Unit,
    onShare: () -> Unit,
    onPreview: () -> Unit,
    onSignIn: () -> Unit,
    onOpenSetup: () -> Unit,
) {
    val profile = state.user.profile

    GlassPanel(contentPadding = androidx.compose.foundation.layout.PaddingValues(20.dp)) {
        Row(verticalAlignment = Alignment.Top) {
            ProfileAvatar(url = profile?.photo_url, size = 96.dp)

            Spacer(Modifier.width(16.dp))

            Column(Modifier.weight(1f)) {
                Text(
                    text = profile?.name ?: "Your Name",
                    style = MaterialTheme.typography.headlineSmall,
                    color = Cine.TextPrimary,
                )
                Spacer(Modifier.height(8.dp))

                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    profile?.primary_craft?.let {
                        CineBadge(text = it, icon = Icons.Filled.AutoAwesome)
                    }
                    if (state.user.identity_verified) {
                        CineBadge(
                            text = "Verified Artist",
                            icon = Icons.Filled.CheckCircle,
                            tint = Cine.BadgeEmeraldText,
                            background = rgbaEmeraldSoft(),
                            border = Cine.EmeraldBorder,
                        )
                    }
                }

                Spacer(Modifier.height(10.dp))

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    Icon(
                        imageVector = Icons.Filled.LocationOn,
                        contentDescription = null,
                        tint = Cine.AccentGold,
                        modifier = Modifier.size(15.dp),
                    )
                    Text(
                        text = buildString {
                            append(profile?.city ?: "—")
                            profile?.state?.let { append(", $it") }
                            append(" (${profile?.travel_radius_km ?: 0}km travel radius)")
                        },
                        style = MaterialTheme.typography.bodySmall,
                        color = Cine.TextSecondary,
                    )
                }
            }
        }

        if (!profile?.secondary_crafts.isNullOrEmpty()) {
            Spacer(Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                profile?.secondary_crafts?.take(3)?.forEach { craft ->
                    CineBadge(
                        text = craft,
                        tint = Cine.BadgeCyanText,
                        background = rgbaCyanSoft(),
                        border = rgbaCyanBorder(),
                    )
                }
            }
        }

        if (!profile?.bio.isNullOrBlank()) {
            Spacer(Modifier.height(12.dp))
            Text(
                text = profile?.bio.orEmpty(),
                style = MaterialTheme.typography.bodyMedium,
                color = Cine.TextSecondary,
            )
        }

        Spacer(Modifier.height(16.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            GoldButton(
                text = "Edit Profile",
                icon = Icons.Filled.Edit,
                onClick = onEdit,
                modifier = Modifier.weight(1f),
            )
            SecondaryButton(
                text = "Share",
                icon = Icons.Filled.Share,
                onClick = onShare,
                modifier = Modifier.weight(1f),
            )
        }

        Spacer(Modifier.height(10.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            GhostButton(
                text = "Preview public profile",
                icon = Icons.Filled.Visibility,
                color = Cine.TextMuted,
                onClick = onPreview,
            )
        }

        Spacer(Modifier.height(10.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Cine.Backdrop, RoundedCornerShape(Radii.md))
                .border(1.dp, Cine.BorderSubtle, RoundedCornerShape(Radii.md))
                .padding(horizontal = 14.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(
                imageVector = Icons.Filled.CalendarToday,
                contentDescription = null,
                tint = Cine.AccentGold,
                modifier = Modifier.size(18.dp),
            )
            Spacer(Modifier.width(10.dp))
            Column(Modifier.weight(1f)) {
                Text(
                    text = "● ${profile?.availabilityStatus ?: "Availability not set"}",
                    style = MaterialTheme.typography.bodySmall,
                    color = Cine.BadgeEmeraldText,
                )
                Text(
                    text = profile?.availabilityNote ?: "Tell producers when you can shoot.",
                    style = MaterialTheme.typography.bodySmall,
                    color = Cine.TextMuted,
                )
            }
        }

        if (state.demoMode) {
            Spacer(Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                GoldButton(
                    text = "Sign in",
                    onClick = onSignIn,
                    modifier = Modifier.weight(1f),
                    horizontalPadding = 14.dp,
                )
                SecondaryButton(
                    text = "Complete profile",
                    icon = Icons.Filled.Upload,
                    onClick = onOpenSetup,
                    modifier = Modifier.weight(1f),
                    horizontalPadding = 14.dp,
                )
            }
        }
    }
}

@Composable
fun ProfileAvatar(
    url: String?,
    size: Dp,
    modifier: Modifier = Modifier,
    showVerified: Boolean = false,
) {
    Box(
        modifier = modifier
            .size(size)
            .clip(CircleShape)
            .background(Cine.BgTertiary)
            .border(3.dp, Cine.AccentGold, CircleShape),
        contentAlignment = Alignment.Center,
    ) {
        if (!url.isNullOrBlank()) {
            AsyncImage(
                model = url,
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize(),
            )
        } else {
            Icon(
                imageVector = Icons.Filled.Person,
                contentDescription = null,
                tint = Cine.TextMuted,
                modifier = Modifier.size(size * 0.45f),
            )
        }

        if (showVerified) {
            Box(
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(2.dp)
                    .size(size * 0.28f)
                    .background(Cine.BgPrimary, CircleShape),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = Icons.Filled.Verified,
                    contentDescription = "Verified talent",
                    tint = Cine.BadgeGoldText,
                    modifier = Modifier.fillMaxSize(),
                )
            }
        }
    }
}

private fun rgbaEmeraldSoft() = Cine.EmeraldSoft
private fun rgbaCyanSoft() = com.cineconnect.talent.ui.theme.rgba(0x06B6D4L, 0.15f)
private fun rgbaCyanBorder() = com.cineconnect.talent.ui.theme.rgba(0x06B6D4L, 0.3f)
