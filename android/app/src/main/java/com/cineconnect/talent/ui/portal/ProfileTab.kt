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
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.WorkspacePremium
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.cineconnect.talent.data.model.languageEntries
import com.cineconnect.talent.ui.components.CineBadge
import com.cineconnect.talent.ui.components.CineProgressTrack
import com.cineconnect.talent.ui.components.GlassCard
import com.cineconnect.talent.ui.components.SectionHeading
import com.cineconnect.talent.ui.theme.Cine
import com.cineconnect.talent.ui.theme.Radii

@Composable
fun ProfileTab(state: PortalUiState) {
    val user = state.user
    val profile = user.profile

    GlassCard {
        SectionHeading(
            icon = Icons.Filled.AutoAwesome,
            title = "Profile strength",
            subtitle = "${state.completeness.score}% complete",
        )
        Spacer(Modifier.height(14.dp))
        CineProgressTrack(
            progress = state.completeness.score.toFloat() / state.completeness.max_score.coerceAtLeast(1),
            modifier = Modifier.fillMaxWidth(),
        )
        if (state.completeness.suggestions.isNotEmpty()) {
            Spacer(Modifier.height(14.dp))
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                state.completeness.suggestions.take(4).forEach { suggestion ->
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(6.dp)
                                .background(Cine.AccentGold, RoundedCornerShape(Radii.full))
                        )
                        Spacer(Modifier.width(10.dp))
                        Text(
                            text = suggestion,
                            style = MaterialTheme.typography.bodyMedium,
                            color = Cine.TextSecondary,
                        )
                    }
                }
            }
        }
    }

    Spacer(Modifier.height(16.dp))

    GlassCard {
        SectionHeading(
            icon = Icons.Filled.Person,
            title = "About",
            subtitle = "How producers see you",
        )
        Spacer(Modifier.height(12.dp))
        Text(
            text = profile?.bio?.takeIf { it.isNotBlank() } ?: "No bio yet — add one in the profile setup wizard.",
            style = MaterialTheme.typography.bodyMedium,
            color = if (profile?.bio.isNullOrBlank()) Cine.TextMuted else Cine.TextSecondary,
        )
    }

    Spacer(Modifier.height(16.dp))

    GlassCard {
        SectionHeading(
            icon = Icons.Filled.WorkspacePremium,
            title = "Skills",
            subtitle = "${user.skills.size} listed",
        )
        Spacer(Modifier.height(12.dp))
        if (user.skills.isEmpty()) {
            Text(
                text = "No skills added yet.",
                style = MaterialTheme.typography.bodyMedium,
                color = Cine.TextMuted,
            )
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                user.skills.chunked(2).forEach { row ->
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        row.forEach { skill ->
                            CineBadge(
                                text = skill.skill_name,
                                icon = Icons.Filled.Star,
                            )
                        }
                    }
                }
            }
        }
    }

    Spacer(Modifier.height(16.dp))

    GlassCard {
        SectionHeading(
            icon = Icons.Filled.Language,
            title = "Languages",
            subtitle = "Languages you can work in",
        )
        Spacer(Modifier.height(12.dp))
        val languages = profile?.languageEntries.orEmpty()
        if (languages.isEmpty()) {
            Text(
                text = "No languages listed yet.",
                style = MaterialTheme.typography.bodyMedium,
                color = Cine.TextMuted,
            )
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                languages.forEach { entry ->
                    DetailRow(
                        icon = Icons.Filled.Language,
                        label = entry.lang ?: "—",
                        value = entry.fluency?.replaceFirstChar { it.uppercase() } ?: "Fluent",
                    )
                }
            }
        }
    }

    Spacer(Modifier.height(16.dp))

    GlassCard {
        SectionHeading(
            icon = Icons.Filled.CalendarToday,
            title = "Personal details",
        )
        Spacer(Modifier.height(12.dp))
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            DetailRow(
                icon = Icons.Filled.CalendarToday,
                label = "Date of birth",
                value = profile?.date_of_birth ?: "Not provided",
            )
            DetailRow(
                icon = Icons.Filled.Person,
                label = "Gender",
                value = profile?.gender ?: "Not provided",
            )
            DetailRow(
                icon = Icons.Filled.Language,
                label = "Travel radius",
                value = "${profile?.travel_radius_km ?: 0} km",
            )
        }
    }
}

@Composable
private fun DetailRow(
    icon: ImageVector,
    label: String,
    value: String,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Cine.SurfaceMuted, RoundedCornerShape(Radii.sm))
            .border(1.dp, Cine.BorderSubtle, RoundedCornerShape(Radii.sm))
            .padding(horizontal = 12.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = Cine.AccentGold,
            modifier = Modifier.size(16.dp),
        )
        Spacer(Modifier.width(10.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = Cine.TextSecondary,
            modifier = Modifier.weight(1f),
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            color = Cine.TextPrimary,
        )
    }
}
