package com.cineconnect.talent.ui.profile.components

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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.VideoLibrary
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.cineconnect.talent.domain.profile.model.ReelItem
import com.cineconnect.talent.ui.theme.Cine

/**
 * Portfolio / Reel Showcase Tab:
 * Displays responsive video cards for self-tapes, showreels, and clips
 * with high-res thumbnails, play trigger overlay, and performance metrics.
 */
@Composable
fun ReelShowcaseTabContent(
    reels: List<ReelItem>,
    onPlayReel: (ReelItem) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                imageVector = Icons.Default.VideoLibrary,
                contentDescription = null,
                tint = Cine.AccentGold,
                modifier = Modifier.size(18.dp)
            )
            Text(
                text = "Showreels, Self-Tapes & Auditions",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp
                ),
                color = Cine.TextPrimary
            )
        }

        reels.forEach { reel ->
            ReelCard(
                reel = reel,
                onClick = { onPlayReel(reel) }
            )
        }
    }
}

@Composable
private fun ReelCard(
    reel: ReelItem,
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = Cine.BgSecondary,
        border = androidx.compose.foundation.BorderStroke(1.dp, Cine.BorderSubtle),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Column {
            // Video Thumbnail Box with 16:9 ratio
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(16f / 9f)
                    .background(Cine.BgTertiary)
            ) {
                AsyncImage(
                    model = reel.thumbnailUrl,
                    contentDescription = reel.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )

                // Cinematic Gradient Scrim
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(
                                    Color.Transparent,
                                    Cine.BgPrimary.copy(alpha = 0.8f)
                                )
                            )
                        )
                )

                // Duration Badge (Top Right)
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Cine.Overlay,
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(10.dp)
                ) {
                    Text(
                        text = reel.duration,
                        color = Cine.TextPrimary,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }

                // Type Badge (Top Left)
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Cine.AccentGold.copy(alpha = 0.85f),
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(10.dp)
                ) {
                    Text(
                        text = reel.reelType,
                        color = Cine.BgPrimary,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }

                // Centered Play Button with Glowing Accent
                Surface(
                    shape = CircleShape,
                    color = Cine.AccentGold,
                    shadowElevation = 8.dp,
                    modifier = Modifier
                        .align(Alignment.Center)
                        .size(48.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.Default.PlayArrow,
                            contentDescription = "Play Showreel",
                            tint = Cine.BgPrimary,
                            modifier = Modifier.size(28.dp)
                        )
                    }
                }

                // Views counter (Bottom Left)
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .padding(10.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Visibility,
                        contentDescription = "Views",
                        tint = Cine.TextSecondary,
                        modifier = Modifier.size(13.dp)
                    )
                    Spacer(Modifier.width(4.dp))
                    Text(
                        text = "${reel.views} views",
                        color = Cine.TextSecondary,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            // Reel Info Details
            Column(modifier = Modifier.padding(14.dp)) {
                Text(
                    text = reel.title,
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    ),
                    color = Cine.TextPrimary
                )

                if (reel.tags.isNotEmpty()) {
                    Spacer(Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        reel.tags.forEach { tag ->
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = Cine.BgTertiary,
                                border = androidx.compose.foundation.BorderStroke(1.dp, Cine.BorderSubtle)
                            ) {
                                Text(
                                    text = "#$tag",
                                    color = Cine.TextMuted,
                                    fontSize = 10.sp,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
