package com.cineconnect.talent.ui.profile.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cineconnect.talent.domain.profile.model.ProfileTabType
import com.cineconnect.talent.ui.theme.Cine

/**
 * Tab Navigation Bar matching cinematic theme:
 * - About / Bio
 * - Skills & Exp
 * - Portfolio & Reels
 * - Posts & Activity
 */
@Composable
fun ProfileTabs(
    selectedTab: ProfileTabType,
    onTabSelected: (ProfileTabType) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(Cine.BgPrimary)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            ProfileTabType.values().forEach { tab ->
                val isSelected = tab == selectedTab
                val textColor by animateColorAsState(
                    targetValue = if (isSelected) Cine.AccentGold else Cine.TextSecondary,
                    label = "tabTextColor"
                )

                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .weight(1f)
                        .clickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = null
                        ) { onTabSelected(tab) }
                        .padding(vertical = 12.dp)
                ) {
                    Text(
                        text = tab.title,
                        color = textColor,
                        fontSize = 13.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        maxLines = 1
                    )

                    Box(
                        modifier = Modifier
                            .padding(top = 8.dp)
                            .height(2.5.dp)
                            .fillMaxWidth(if (isSelected) 0.85f else 0f)
                            .clip(RoundedCornerShape(2.dp))
                            .background(if (isSelected) Cine.AccentGold else androidx.compose.ui.graphics.Color.Transparent)
                    )
                }
            }
        }

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(1.dp)
                .background(Cine.BorderSubtle)
        )
    }
}
