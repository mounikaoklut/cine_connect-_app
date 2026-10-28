package com.cineconnect.talent.ui.profile.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
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
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material.icons.filled.Stars
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.cineconnect.talent.domain.profile.model.ProductionCredit
import com.cineconnect.talent.domain.profile.model.SkillTag
import com.cineconnect.talent.ui.theme.Cine

/**
 * Skills & Experience Tab:
 * - Professional Skill Tag Cloud (with proficiency badges e.g. Expert / Advanced)
 * - Production Credits Timeline
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun SkillsExperienceTabContent(
    skills: List<SkillTag>,
    credits: List<ProductionCredit>,
    selectedCategory: String?,
    onCategorySelected: (String?) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        // 1. Professional Skills Tag Cloud Card
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
                            imageVector = Icons.Default.Stars,
                            contentDescription = null,
                            tint = Cine.AccentGold,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                    Text(
                        text = "Verified Professional Skills",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        ),
                        color = Cine.TextPrimary
                    )
                }

                Spacer(Modifier.height(14.dp))

                // Tag Cloud using FlowRow
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    skills.forEach { skill ->
                        SkillBadge(skill = skill)
                    }
                }
            }
        }

        // 2. Production Credits Timeline
        Column(modifier = Modifier.fillMaxWidth()) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(bottom = 12.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Movie,
                    contentDescription = null,
                    tint = Cine.AccentGold,
                    modifier = Modifier.size(18.dp)
                )
                Text(
                    text = "Production Credits & Filmography",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                    ),
                    color = Cine.TextPrimary
                )
            }

            credits.forEachIndexed { index, credit ->
                ProductionCreditCard(credit = credit)
                if (index < credits.size - 1) {
                    Spacer(Modifier.height(12.dp))
                }
            }
        }
    }
}

@Composable
private fun SkillBadge(skill: SkillTag) {
    Surface(
        shape = RoundedCornerShape(10.dp),
        color = Cine.BgTertiary,
        border = androidx.compose.foundation.BorderStroke(
            1.dp,
            if (skill.proficiency == "Expert") Cine.BorderGoldStrong else Cine.BorderSubtle
        )
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
        ) {
            Text(
                text = skill.name,
                color = Cine.TextPrimary,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium
            )
            Spacer(Modifier.width(6.dp))
            Surface(
                shape = RoundedCornerShape(6.dp),
                color = if (skill.proficiency == "Expert") Cine.AccentGold.copy(alpha = 0.2f) else Cine.Track
            ) {
                Text(
                    text = skill.proficiency,
                    color = if (skill.proficiency == "Expert") Cine.AccentGold else Cine.TextMuted,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                )
            }
        }
    }
}

@Composable
private fun ProductionCreditCard(credit: ProductionCredit) {
    Surface(
        shape = RoundedCornerShape(14.dp),
        color = Cine.BgSecondary,
        border = androidx.compose.foundation.BorderStroke(1.dp, Cine.BorderSubtle),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = credit.title,
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        ),
                        color = Cine.TextPrimary
                    )
                    Spacer(Modifier.height(2.dp))
                    Text(
                        text = "${credit.role} • ${credit.company}",
                        style = MaterialTheme.typography.bodySmall.copy(
                            fontWeight = FontWeight.Medium
                        ),
                        color = Cine.AccentGold
                    )
                }

                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = Cine.BgTertiary,
                    border = androidx.compose.foundation.BorderStroke(1.dp, Cine.BorderSubtle)
                ) {
                    Text(
                        text = credit.year,
                        color = Cine.TextSecondary,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(Modifier.height(10.dp))

            Text(
                text = credit.description,
                style = MaterialTheme.typography.bodySmall.copy(
                    lineHeight = 18.sp
                ),
                color = Cine.TextSecondary
            )

            if (credit.isVerified) {
                Spacer(Modifier.height(10.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = "Verified Credit",
                        tint = Cine.AccentEmerald,
                        modifier = Modifier.size(13.dp)
                    )
                    Text(
                        text = "Production Verified Credit",
                        color = Cine.BadgeEmeraldText,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }
    }
}
