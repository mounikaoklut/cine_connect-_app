package com.cineconnect.talent.ui.portal

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.cineconnect.talent.data.model.PublicProfile
import com.cineconnect.talent.ui.components.CineBadge
import com.cineconnect.talent.ui.components.CineProgressTrack
import com.cineconnect.talent.ui.components.GlassCard
import com.cineconnect.talent.ui.theme.Cine
import com.cineconnect.talent.ui.theme.Radii

/** The profile exactly as a production house sees it (`/users/{id}/public`). */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PublicProfileSheet(
    profile: PublicProfile?,
    loading: Boolean,
    onDismiss: () -> Unit,
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = Cine.BgSecondary,
        contentColor = Cine.TextPrimary,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .padding(bottom = 28.dp),
        ) {
            Text(
                text = "Public profile preview",
                style = MaterialTheme.typography.headlineSmall,
                color = Cine.TextPrimary,
            )
            Text(
                text = "This is the view casting directors get.",
                style = MaterialTheme.typography.bodyMedium,
                color = Cine.TextMuted,
            )

            Spacer(Modifier.height(18.dp))

            if (loading || profile == null) {
                Text(
                    text = if (loading) "Loading…" else "Preview unavailable right now.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Cine.TextMuted,
                )
                Spacer(Modifier.height(12.dp))
            } else {
                PublicProfileContent(profile)
            }
        }
    }
}

@Composable
private fun PublicProfileContent(profile: PublicProfile) {
    Column {
        Row(verticalAlignment = Alignment.Top) {
                ProfileAvatar(url = profile.photo_url, size = 88.dp)
                Spacer(Modifier.width(16.dp))
                Column(Modifier.weight(1f)) {
                    Text(
                        text = profile.name ?: "Your Name",
                        style = MaterialTheme.typography.headlineSmall,
                        color = Cine.TextPrimary,
                    )
                    Spacer(Modifier.height(8.dp))
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        profile.primary_craft?.let {
                            CineBadge(text = it, icon = Icons.Filled.AutoAwesome)
                        }
                        if (profile.identity_verified) {
                            CineBadge(
                                text = "Verified",
                                icon = Icons.Filled.CheckCircle,
                                tint = Cine.BadgeEmeraldText,
                                background = Cine.EmeraldSoft,
                                border = Cine.EmeraldBorder,
                            )
                        }
                    }
                    Spacer(Modifier.height(10.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Filled.LocationOn,
                            contentDescription = null,
                            tint = Cine.AccentGold,
                            modifier = Modifier.size(15.dp),
                        )
                        Spacer(Modifier.width(4.dp))
                        Text(
                            text = listOfNotNull(profile.city, profile.state)
                                .joinToString(", ")
                                .ifBlank { "Location not set" },
                            style = MaterialTheme.typography.bodySmall,
                            color = Cine.TextSecondary,
                        )
                    }
                }
            }
    
            if (!profile.secondary_crafts.isNullOrEmpty()) {
                Spacer(Modifier.height(12.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    profile.secondary_crafts?.take(3)?.forEach { craft ->
                        CineBadge(
                            text = craft,
                            tint = Cine.BadgeCyanText,
                            background = Cine.BadgeIndigoSoft,
                            border = Cine.BorderSubtle,
                        )
                    }
                }
            }
    
            if (!profile.bio.isNullOrBlank()) {
                Spacer(Modifier.height(14.dp))
                Text(
                    text = profile.bio,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Cine.TextSecondary,
                )
            }
    
            Spacer(Modifier.height(18.dp))
    
            GlassCard {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Filled.AutoAwesome,
                        contentDescription = null,
                        tint = Cine.AccentGold,
                        modifier = Modifier.size(18.dp),
                    )
                    Spacer(Modifier.width(10.dp))
                    Text(
                        text = "Profile strength",
                        style = MaterialTheme.typography.titleSmall,
                        color = Cine.TextPrimary,
                        modifier = Modifier.weight(1f),
                    )
                    Text(
                        text = "${profile.completeness_score}%",
                        style = MaterialTheme.typography.titleSmall,
                        color = Cine.AccentGold,
                    )
                }
                Spacer(Modifier.height(10.dp))
                CineProgressTrack(
                    progress = profile.completeness_score / 100f,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
    
            Spacer(Modifier.height(14.dp))
    
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Cine.SurfaceMuted, RoundedCornerShape(Radii.md))
                    .border(1.dp, Cine.BorderSubtle, RoundedCornerShape(Radii.md))
                    .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Icon(
                    imageVector = Icons.Filled.Person,
                    contentDescription = null,
                    tint = Cine.TextMuted,
                    modifier = Modifier.size(16.dp),
                )
                Spacer(Modifier.width(10.dp))
                Text(
                    text = "Contact details and documents stay private until you apply.",
                    style = MaterialTheme.typography.bodySmall,
                    color = Cine.TextMuted,
                )
            }
        }
    }
