package com.cineconnect.talent.ui.portal

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BusinessCenter
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.cineconnect.talent.data.model.ExperienceItem
import com.cineconnect.talent.ui.components.CineBadge
import com.cineconnect.talent.ui.components.GlassCard
import com.cineconnect.talent.ui.components.SectionHeading
import com.cineconnect.talent.ui.theme.Cine
import com.cineconnect.talent.ui.theme.Radii

@Composable
fun ExperienceTab(state: PortalUiState) {
    val experiences = state.user.experiences

    GlassCard {
        SectionHeading(
            icon = Icons.Filled.BusinessCenter,
            title = "Credits & timeline",
            subtitle = "${experiences.size} credit${if (experiences.size == 1) "" else "s"} on your reel",
        )

        Spacer(Modifier.height(16.dp))

        if (experiences.isEmpty()) {
            Text(
                text = "No credits yet. Add your first project in the profile setup wizard.",
                style = MaterialTheme.typography.bodyMedium,
                color = Cine.TextMuted,
            )
        } else {
            Column {
                experiences.forEachIndexed { index, experience ->
                    TimelineRow(
                        experience = experience,
                        isLast = index == experiences.lastIndex,
                    )
                }
            }
        }
    }
}

@Composable
private fun TimelineRow(
    experience: ExperienceItem,
    isLast: Boolean,
) {
    Row(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.width(28.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Box(
                modifier = Modifier
                    .size(12.dp)
                    .background(Cine.AccentGold, CircleShape)
            )
            if (!isLast) {
                Box(
                    modifier = Modifier
                        .width(2.dp)
                        .height(72.dp)
                        .background(Cine.BorderSubtle)
                )
            }
        }

        Spacer(Modifier.width(12.dp))

        Column(
            modifier = Modifier
                .weight(1f)
                .padding(bottom = if (isLast) 0.dp else 18.dp),
        ) {
            Text(
                text = experience.title,
                style = MaterialTheme.typography.titleSmall,
                color = Cine.TextPrimary,
            )
            if (!experience.company.isNullOrBlank()) {
                Spacer(Modifier.height(2.dp))
                Text(
                    text = experience.company,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Cine.TextSecondary,
                )
            }
            if (!experience.role_type.isNullOrBlank()) {
                Spacer(Modifier.height(6.dp))
                CineBadge(
                    text = experience.role_type.replaceFirstChar { it.uppercase() },
                    tint = Cine.BadgeIndigoText,
                    background = Cine.BadgeIndigoSoft,
                    border = Cine.BorderSubtle,
                )
            }
            if (!experience.description.isNullOrBlank()) {
                Spacer(Modifier.height(8.dp))
                Text(
                    text = experience.description,
                    style = MaterialTheme.typography.bodySmall,
                    color = Cine.TextMuted,
                )
            }
            val period = listOfNotNull(
                experience.start_date?.takeIf { it.isNotBlank() },
                experience.end_date?.takeIf { it.isNotBlank() } ?: "Present",
            ).joinToString(" — ")
            if (period.isNotBlank()) {
                Spacer(Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Filled.CalendarToday,
                        contentDescription = null,
                        tint = Cine.TextFaint,
                        modifier = Modifier.size(13.dp),
                    )
                    Spacer(Modifier.width(6.dp))
                    Text(
                        text = period,
                        style = MaterialTheme.typography.bodySmall,
                        color = Cine.TextFaint,
                    )
                }
            }
        }
    }
}
