package com.cineconnect.talent.ui.profile.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.PersonAdd
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material.icons.filled.Work
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ElevatedButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.cineconnect.talent.domain.profile.model.UserProfileData
import com.cineconnect.talent.ui.theme.Cine

/**
 * Cinematic Header Section:
 * - Cover image banner with editable camera badge
 * - Profile avatar with gold checkmark verification badge
 * - Full name, headline, location, and availability status
 * - Quick action buttons: "Edit Profile", "Share Portfolio", "Connect / Follow"
 */
@Composable
fun ProfileHeader(
    profile: UserProfileData,
    isFollowing: Boolean,
    onEditCover: () -> Unit,
    onEditProfile: () -> Unit,
    onSharePortfolio: () -> Unit,
    onToggleFollow: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(Cine.BgPrimary)
    ) {
        // 1. Cover Image Banner (customizable ratio 16:9 / 2.5:1)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(2.6f)
                .background(Cine.BgSecondary)
        ) {
            AsyncImage(
                model = profile.coverImageUrl,
                contentDescription = "Cover Banner",
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )

            // Cinematic gradient scrim overlay
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(
                                Color.Transparent,
                                Cine.BgPrimary.copy(alpha = 0.85f),
                                Cine.BgPrimary
                            )
                        )
                    )
            )

            // Edit Banner Action Pill
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Cine.BgGlass,
                border = ButtonDefaults.outlinedButtonBorder.copy(
                    brush = Brush.linearGradient(listOf(Cine.BorderSubtle, Cine.BorderGlow))
                ),
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(top = 16.dp, end = 16.dp)
                    .clickable { onEditCover() }
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.CameraAlt,
                        contentDescription = "Edit Banner",
                        tint = Cine.AccentGold,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(Modifier.width(6.dp))
                    Text(
                        text = "Edit Cover",
                        color = Cine.TextPrimary,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }

        // 2. Profile Avatar & Verification Badge (Overlapping the banner)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .offset(y = (-44).dp)
        ) {
            Row(
                verticalAlignment = Alignment.Bottom,
                modifier = Modifier.fillMaxWidth()
            ) {
                // Avatar with border and Gold Verification Checkmark
                Box(contentAlignment = Alignment.BottomEnd) {
                    Surface(
                        shape = CircleShape,
                        color = Cine.BgSecondary,
                        border = androidx.compose.foundation.BorderStroke(3.5.dp, Cine.BgPrimary),
                        shadowElevation = 8.dp,
                        modifier = Modifier.size(92.dp)
                    ) {
                        AsyncImage(
                            model = profile.avatarUrl,
                            contentDescription = profile.name,
                            contentScale = ContentScale.Crop,
                            modifier = Modifier
                                .fillMaxSize()
                                .clip(CircleShape)
                        )
                    }

                    if (profile.isVerified) {
                        // Gold Verification Badge
                        Surface(
                            shape = CircleShape,
                            color = Cine.AccentGold,
                            shadowElevation = 4.dp,
                            border = androidx.compose.foundation.BorderStroke(2.dp, Cine.BgPrimary),
                            modifier = Modifier
                                .size(26.dp)
                                .offset(x = (-2).dp, y = (-2).dp)
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Verified,
                                contentDescription = "Verified Industry Professional",
                                tint = Cine.BgPrimary,
                                modifier = Modifier
                                    .padding(3.dp)
                                    .fillMaxSize()
                            )
                        }
                    }
                }

                Spacer(Modifier.weight(1f))

                // Availability Badge Pill
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Cine.EmeraldSoft,
                    border = androidx.compose.foundation.BorderStroke(1.dp, Cine.EmeraldBorder),
                    modifier = Modifier.padding(bottom = 8.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .background(Cine.AccentEmerald, CircleShape)
                        )
                        Spacer(Modifier.width(6.dp))
                        Text(
                            text = profile.availabilityStatus.label,
                            color = Cine.BadgeEmeraldText,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }
        }

        // 3. User Details: Name, Headline, Department, Location
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .offset(y = (-32).dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = profile.name,
                    style = MaterialTheme.typography.headlineMedium.copy(
                        fontWeight = FontWeight.Bold,
                        letterSpacing = (-0.5).sp
                    ),
                    color = Cine.TextPrimary
                )
            }

            Spacer(Modifier.height(4.dp))

            Text(
                text = profile.headline,
                style = MaterialTheme.typography.bodyLarge.copy(
                    fontWeight = FontWeight.Medium
                ),
                color = Cine.AccentGold
            )

            Spacer(Modifier.height(6.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Work,
                        contentDescription = "Department",
                        tint = Cine.TextMuted,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(Modifier.width(4.dp))
                    Text(
                        text = profile.department,
                        color = Cine.TextSecondary,
                        fontSize = 12.sp
                    )
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.LocationOn,
                        contentDescription = "Location",
                        tint = Cine.TextMuted,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(Modifier.width(4.dp))
                    Text(
                        text = profile.location,
                        color = Cine.TextSecondary,
                        fontSize = 12.sp
                    )
                }
            }

            Spacer(Modifier.height(18.dp))

            // 4. Quick Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Primary Action Button: Connect / Follow (Amber Glow)
                val followBgColor by animateColorAsState(
                    targetValue = if (isFollowing) Cine.BgTertiary else Cine.AccentGold,
                    animationSpec = tween(durationMillis = 250),
                    label = "followBg"
                )
                val followTextColor by animateColorAsState(
                    targetValue = if (isFollowing) Cine.AccentGold else Cine.BgPrimary,
                    animationSpec = tween(durationMillis = 250),
                    label = "followText"
                )

                ElevatedButton(
                    onClick = onToggleFollow,
                    colors = ButtonDefaults.elevatedButtonColors(
                        containerColor = followBgColor,
                        contentColor = followTextColor
                    ),
                    shape = RoundedCornerShape(12.dp),
                    elevation = ButtonDefaults.elevatedButtonElevation(
                        defaultElevation = if (isFollowing) 0.dp else 4.dp
                    ),
                    border = if (isFollowing) androidx.compose.foundation.BorderStroke(1.dp, Cine.BorderGoldStrong) else null,
                    modifier = Modifier.weight(1.3f)
                ) {
                    Icon(
                        imageVector = if (isFollowing) Icons.Default.Check else Icons.Default.PersonAdd,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(Modifier.width(6.dp))
                    Text(
                        text = if (isFollowing) "Connected" else "Connect / Follow",
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp
                    )
                }

                // Edit Profile Button
                OutlinedButton(
                    onClick = onEditProfile,
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = Cine.TextPrimary
                    ),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Cine.BorderSubtle),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(
                        imageVector = Icons.Default.Edit,
                        contentDescription = "Edit Profile",
                        tint = Cine.TextSecondary,
                        modifier = Modifier.size(15.dp)
                    )
                    Spacer(Modifier.width(4.dp))
                    Text(
                        text = "Edit Profile",
                        fontWeight = FontWeight.Medium,
                        fontSize = 13.sp
                    )
                }

                // Share Portfolio Button
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Cine.BgTertiary,
                    border = androidx.compose.foundation.BorderStroke(1.dp, Cine.BorderSubtle),
                    modifier = Modifier
                        .size(44.dp)
                        .clickable { onSharePortfolio() }
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.Default.Share,
                            contentDescription = "Share Portfolio",
                            tint = Cine.TextPrimary,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }
    }
}
