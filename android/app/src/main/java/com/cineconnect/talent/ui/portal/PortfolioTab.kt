package com.cineconnect.talent.ui.portal

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material.icons.filled.OpenInNew
import androidx.compose.material.icons.filled.PhotoCamera
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Upload
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.cineconnect.talent.data.model.PortfolioItem
import com.cineconnect.talent.ui.components.CineBadge
import com.cineconnect.talent.ui.components.GlassCard
import com.cineconnect.talent.ui.components.GhostButton
import com.cineconnect.talent.ui.components.SectionHeading
import com.cineconnect.talent.ui.theme.Cine
import com.cineconnect.talent.ui.theme.Radii

@Composable
fun PortfolioTab(
    state: PortalUiState,
    onAdd: () -> Unit,
    onDelete: (String) -> Unit,
    onOpen: (String) -> Unit,
) {
    val items = state.user.portfolio

    GlassCard {
        SectionHeading(
            icon = Icons.Filled.Movie,
            title = "Portfolio & media",
            subtitle = "${items.size} item${if (items.size == 1) "" else "s"} published",
            trailing = {
                GhostButton(
                    text = "Upload",
                    icon = Icons.Filled.Upload,
                    color = Cine.AccentGold,
                    onClick = onAdd,
                )
            },
        )

        Spacer(Modifier.height(14.dp))

        if (items.isEmpty()) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Cine.SurfaceMuted, RoundedCornerShape(Radii.md))
                    .border(1.dp, Cine.BorderSubtle, RoundedCornerShape(Radii.md))
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Icon(
                    imageVector = Icons.Filled.PhotoCamera,
                    contentDescription = null,
                    tint = Cine.TextMuted,
                    modifier = Modifier.size(28.dp),
                )
                Spacer(Modifier.height(10.dp))
                Text(
                    text = "No media yet. Upload photos, reels or showreels to get cast.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Cine.TextMuted,
                )
                Spacer(Modifier.height(12.dp))
                GhostButton(
                    text = "Upload your first item",
                    icon = Icons.Filled.Upload,
                    color = Cine.AccentGold,
                    onClick = onAdd,
                )
            }
        } else {
            BoxWithConstraints(modifier = Modifier.fillMaxWidth()) {
                val cardWidth = (maxWidth - 12.dp) / 2
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    items.chunked(2).forEach { row ->
                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            row.forEach { item ->
                                PortfolioCard(
                                    item = item,
                                    modifier = Modifier.width(cardWidth),
                                    onOpen = { onOpen(item.s3_url) },
                                    onDelete = { onDelete(item.id) },
                                )
                            }
                            if (row.size == 1) {
                                Spacer(Modifier.width(cardWidth))
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun PortfolioCard(
    item: PortfolioItem,
    modifier: Modifier = Modifier,
    onOpen: () -> Unit,
    onDelete: () -> Unit,
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(Radii.md))
            .background(Cine.BgSecondary)
            .border(1.dp, Cine.BorderSubtle, RoundedCornerShape(Radii.md)),
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(104.dp)
                .background(Cine.BgTertiary)
                .clickable(onClick = onOpen),
            contentAlignment = Alignment.Center,
        ) {
            if (item.s3_url.isNotBlank()) {
                AsyncImage(
                    model = item.s3_url,
                    contentDescription = item.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize(),
                )
            }
            if (item.type.equals("video", ignoreCase = true)) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .background(
                            Brush.radialGradient(
                                listOf(Color.Black.copy(alpha = 0.4f), Color.Black)
                            ),
                            RoundedCornerShape(Radii.full)
                        ),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        imageVector = Icons.Filled.PlayArrow,
                        contentDescription = "Play",
                        tint = Cine.AccentGold,
                        modifier = Modifier.size(20.dp),
                    )
                }
            }
        }

        Column(Modifier.padding(12.dp)) {
            Text(
                text = item.title?.takeIf { it.isNotBlank() } ?: item.type.replaceFirstChar { it.uppercase() },
                style = MaterialTheme.typography.titleSmall,
                color = Cine.TextPrimary,
                maxLines = 1,
            )
            if (!item.description.isNullOrBlank()) {
                Spacer(Modifier.height(4.dp))
                Text(
                    text = item.description,
                    style = MaterialTheme.typography.bodySmall,
                    color = Cine.TextMuted,
                    maxLines = 2,
                )
            }

            Spacer(Modifier.height(10.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                CineBadge(
                    text = item.type.replaceFirstChar { it.uppercase() },
                    tint = Cine.BadgeCyanText,
                    background = Cine.BadgeIndigoSoft,
                    border = Cine.BorderSubtle,
                )
                Spacer(Modifier.weight(1f))
                IconButton(onClick = onOpen, modifier = Modifier.size(30.dp)) {
                    Icon(
                        imageVector = Icons.Filled.OpenInNew,
                        contentDescription = "Open",
                        tint = Cine.TextSecondary,
                        modifier = Modifier.size(16.dp),
                    )
                }
                IconButton(onClick = onDelete, modifier = Modifier.size(30.dp)) {
                    Icon(
                        imageVector = Icons.Filled.Delete,
                        contentDescription = "Remove",
                        tint = Cine.AccentRose,
                        modifier = Modifier.size(16.dp),
                    )
                }
            }
        }
    }
}
