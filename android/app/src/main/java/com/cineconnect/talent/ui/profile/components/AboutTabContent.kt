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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.ConfirmationNumber
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Timeline
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cineconnect.talent.domain.profile.model.UserProfileData
import com.cineconnect.talent.ui.theme.Cine

/**
 * About / Bio Tab:
 * - Full professional biography narrative
 * - Industry breakdown: Department, Guild/Union affiliations, Experience, Education, Agency
 */
@Composable
fun AboutTabContent(
    profile: UserProfileData,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. Biography Card
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = Cine.BgSecondary,
            border = androidx.compose.foundation.BorderStroke(1.dp, Cine.BorderSubtle),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(28.dp)
                            .background(Cine.AccentGold.copy(alpha = 0.15f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Info,
                            contentDescription = null,
                            tint = Cine.AccentGold,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                    Text(
                        text = "Professional Biography",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        ),
                        color = Cine.TextPrimary
                    )
                }

                Spacer(Modifier.height(12.dp))

                Text(
                    text = profile.bio,
                    style = MaterialTheme.typography.bodyMedium.copy(
                        lineHeight = 22.sp,
                        letterSpacing = 0.2.sp
                    ),
                    color = Cine.TextSecondary
                )
            }
        }

        // 2. Industry Experience Breakdown Card
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = Cine.BgSecondary,
            border = androidx.compose.foundation.BorderStroke(1.dp, Cine.BorderSubtle),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Text(
                    text = "Industry Breakdown & Representation",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                    ),
                    color = Cine.TextPrimary
                )

                Spacer(Modifier.height(16.dp))

                IndustryDetailRow(
                    icon = Icons.Default.Timeline,
                    label = "Industry Experience",
                    value = "${profile.yearsOfExperience}+ Years Active Production"
                )

                Spacer(Modifier.height(14.dp))

                IndustryDetailRow(
                    icon = Icons.Default.ConfirmationNumber,
                    label = "Guild & Union Affiliations",
                    value = profile.unionAffiliations.joinToString(" • ")
                )

                Spacer(Modifier.height(14.dp))

                IndustryDetailRow(
                    icon = Icons.Default.School,
                    label = "Education & Training",
                    value = profile.educationTraining ?: "Independent Training"
                )

                profile.agencyRepresentation?.let { agency ->
                    Spacer(Modifier.height(14.dp))
                    IndustryDetailRow(
                        icon = Icons.Default.Business,
                        label = "Agency Representation",
                        value = agency
                    )
                }
            }
        }
    }
}

@Composable
private fun IndustryDetailRow(
    icon: ImageVector,
    label: String,
    value: String
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.Top
    ) {
        Box(
            modifier = Modifier
                .size(32.dp)
                .background(Cine.BgTertiary, RoundedCornerShape(8.dp)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = Cine.AccentGold,
                modifier = Modifier.size(16.dp)
            )
        }

        Spacer(Modifier.width(12.dp))

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = label,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = Cine.TextMuted
            )
            Spacer(Modifier.height(2.dp))
            Text(
                text = value,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = Cine.TextPrimary,
                lineHeight = 18.sp
            )
        }
    }
}
