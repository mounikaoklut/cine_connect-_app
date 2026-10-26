package com.cineconnect.talent.ui.profile.components

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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cineconnect.talent.domain.profile.model.ProfileStats
import com.cineconnect.talent.ui.theme.Cine

/**
 * Key Stats Bar:
 * Displays horizontal metric counters:
 * - Profile Views
 * - Active Auditions
 * - Saved Pitches
 * - Connections / Followers
 */
@Composable
fun ProfileStatsBar(
    stats: ProfileStats,
    modifier: Modifier = Modifier
) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = Cine.BgSecondary,
        border = androidx.compose.foundation.BorderStroke(1.dp, Cine.BorderSubtle),
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 14.dp, horizontal = 12.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            StatMetricItem(
                value = stats.profileViews,
                label = "Profile Views",
                accentColor = Cine.AccentGold
            )

            StatDivider()

            StatMetricItem(
                value = stats.activeAuditions.toString(),
                label = "Active Auditions",
                accentColor = Cine.AccentCyan
            )

            StatDivider()

            StatMetricItem(
                value = stats.savedPitches.toString(),
                label = "Saved Pitches",
                accentColor = Cine.AccentPurple
            )

            StatDivider()

            StatMetricItem(
                value = stats.connectionsCount,
                label = "Connections",
                accentColor = Cine.AccentEmerald
            )
        }
    }
}

@Composable
private fun StatMetricItem(
    value: String,
    label: String,
    accentColor: Color,
    modifier: Modifier = Modifier
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = modifier
    ) {
        Text(
            text = value,
            style = MaterialTheme.typography.titleMedium.copy(
                fontWeight = FontWeight.Bold,
                fontSize = 17.sp
            ),
            color = Cine.TextPrimary
        )

        Spacer(Modifier.height(3.dp))

        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall.copy(
                fontSize = 10.sp,
                fontWeight = FontWeight.Medium
            ),
            color = Cine.TextSecondary
        )
    }
}

@Composable
private fun StatDivider() {
    Box(
        modifier = Modifier
            .height(24.dp)
            .width(1.dp)
            .background(Cine.BorderSubtle)
    )
}
