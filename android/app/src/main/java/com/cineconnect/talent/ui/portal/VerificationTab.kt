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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Fingerprint
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.cineconnect.talent.ui.components.GlassCard
import com.cineconnect.talent.ui.components.GhostButton
import com.cineconnect.talent.ui.components.SectionHeading
import com.cineconnect.talent.ui.theme.Cine
import com.cineconnect.talent.ui.theme.Radii

@Composable
fun VerificationTab(state: PortalUiState) {
    val user = state.user

    GlassCard {
        SectionHeading(
            icon = Icons.Filled.Badge,
            title = "ID verification",
            subtitle = "Verified talents get priority on castings",
        )

        Spacer(Modifier.height(16.dp))

        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            VerificationRow(
                icon = Icons.Filled.Email,
                title = "Email address",
                subtitle = user.email ?: "Add an email address",
                verified = user.email_verified,
            )
            VerificationRow(
                icon = Icons.Filled.Phone,
                title = "Phone number",
                subtitle = user.phone ?: "Add a phone number",
                verified = user.phone_verified,
            )
            VerificationRow(
                icon = Icons.Filled.Fingerprint,
                title = "Government ID",
                subtitle = "Identity document verification",
                verified = user.identity_verified,
            )
        }

        Spacer(Modifier.height(16.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Cine.EmeraldFaint, RoundedCornerShape(Radii.md))
                .border(1.dp, Cine.EmeraldBorder, RoundedCornerShape(Radii.md))
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(
                imageVector = Icons.Filled.CheckCircle,
                contentDescription = null,
                tint = Cine.BadgeEmeraldText,
                modifier = Modifier.size(18.dp),
            )
            Spacer(Modifier.width(10.dp))
            Text(
                text = "Complete all three checks to unlock casting requests and your verified badge.",
                style = MaterialTheme.typography.bodySmall,
                color = Cine.TextSecondary,
            )
        }
    }
}

@Composable
private fun VerificationRow(
    icon: ImageVector,
    title: String,
    subtitle: String,
    verified: Boolean,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Cine.SurfaceMuted, RoundedCornerShape(Radii.md))
            .border(1.dp, Cine.BorderSubtle, RoundedCornerShape(Radii.md))
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(38.dp)
                .clip(RoundedCornerShape(Radii.sm))
                .background(if (verified) Cine.EmeraldSoft else Cine.AccentGoldSoft),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = if (verified) Cine.BadgeEmeraldText else Cine.BadgeGoldText,
                modifier = Modifier.size(18.dp),
            )
        }

        Spacer(Modifier.width(12.dp))

        Column(Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleSmall,
                color = Cine.TextPrimary,
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = Cine.TextMuted,
            )
        }

        Spacer(Modifier.width(8.dp))

        if (verified) {
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(Radii.full))
                    .background(Cine.EmeraldSoft)
                    .border(1.dp, Cine.EmeraldBorder, RoundedCornerShape(Radii.full))
                    .padding(horizontal = 10.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                Icon(
                    imageVector = Icons.Filled.CheckCircle,
                    contentDescription = null,
                    tint = Cine.BadgeEmeraldText,
                    modifier = Modifier.size(13.dp),
                )
                Text(
                    text = "Verified",
                    style = MaterialTheme.typography.labelMedium,
                    color = Cine.BadgeEmeraldText,
                )
            }
        } else {
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(Radii.full))
                    .background(Cine.AccentGoldSoft)
                    .border(1.dp, Cine.BorderGlow, RoundedCornerShape(Radii.full))
                    .padding(horizontal = 10.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                Icon(
                    imageVector = Icons.Filled.Warning,
                    contentDescription = null,
                    tint = Cine.BadgeGoldText,
                    modifier = Modifier.size(13.dp),
                )
                Text(
                    text = "Pending",
                    style = MaterialTheme.typography.labelMedium,
                    color = Cine.BadgeGoldText,
                )
            }
        }
    }
}
