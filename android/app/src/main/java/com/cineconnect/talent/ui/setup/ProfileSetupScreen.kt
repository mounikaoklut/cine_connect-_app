package com.cineconnect.talent.ui.setup

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Briefcase
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Save
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.cineconnect.talent.ui.components.BrandMark
import com.cineconnect.talent.ui.components.CineBackground
import com.cineconnect.talent.ui.components.CineChip
import com.cineconnect.talent.ui.components.CineProgressTrack
import com.cineconnect.talent.ui.components.CineTextField
import com.cineconnect.talent.ui.components.GlassCard
import com.cineconnect.talent.ui.components.GoldButton
import com.cineconnect.talent.ui.components.SecondaryButton
import com.cineconnect.talent.ui.theme.Cine
import com.cineconnect.talent.ui.theme.Radii

@Composable
fun ProfileSetupScreen(
    onExit: () -> Unit,
    onSaved: () -> Unit,
    viewModel: ProfileSetupViewModel = viewModel(),
) {
    val state = viewModel.state

    CineBackground {
        Scaffold(
            containerColor = Color.Transparent,
            topBar = {
                SetupTopBar(
                    step = state.step,
                    onExit = { viewModel.save(onExit, exitOnFailure = true) },
                )
            },
        ) { innerPadding ->
            Column(
                modifier = Modifier
                    .padding(innerPadding)
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp),
            ) {
                Spacer(Modifier.height(10.dp))

                StepProgressBar(currentStep = state.step)

                Spacer(Modifier.height(16.dp))

                CompletionCard(state = state)

                Spacer(Modifier.height(16.dp))

                GlassCard {
                    StepHeader(
                        icon = when (state.step) {
                            1 -> Icons.Filled.Person
                            2 -> Icons.Filled.Briefcase
                            3 -> Icons.Filled.Star
                            else -> Icons.Filled.Movie
                        },
                        title = SetupContent.stepTitles[state.step - 1],
                        subtitle = SetupContent.stepSubtitles[state.step - 1],
                    )

                    Spacer(Modifier.height(16.dp))

                    when (state.step) {
                        1 -> BasicStep(state, viewModel)
                        2 -> ProfessionalStep(state, viewModel)
                        3 -> SkillsStep(state, viewModel)
                        4 -> PortfolioStep(state, viewModel)
                    }
                }

                Spacer(Modifier.height(16.dp))

                TipCard()

                Spacer(Modifier.height(18.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    SecondaryButton(
                        text = "Back",
                        icon = Icons.Filled.ArrowBack,
                        onClick = viewModel::back,
                        modifier = Modifier.weight(1f),
                        enabled = state.step > 1,
                    )
                    GoldButton(
                        text = if (state.step == 4) "Save profile" else "Continue",
                        icon = if (state.step == 4) Icons.Filled.Save else Icons.Filled.ArrowForward,
                        onClick = {
                            if (state.step == 4) viewModel.save(onSaved) else viewModel.next()
                        },
                        modifier = Modifier.weight(1f),
                    )
                }

                Spacer(Modifier.height(28.dp))
            }
        }
    }
}

@Composable
private fun SetupTopBar(step: Int, onExit: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xCC080A0F))
            .padding(horizontal = 16.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        BrandMark(size = 34.dp)
        Spacer(Modifier.width(10.dp))
        Column(Modifier.weight(1f)) {
            Text(
                text = "CineConnect",
                style = MaterialTheme.typography.titleMedium,
                color = Cine.TextPrimary,
            )
            Text(
                text = "Step $step of 4 · Profile setup",
                style = MaterialTheme.typography.labelSmall,
                color = Cine.TextMuted,
            )
        }
        SecondaryButton(
            text = "Save & exit",
            icon = Icons.Filled.Save,
            onClick = onExit,
            horizontalPadding = 12.dp,
            verticalPadding = 8.dp,
        )
    }
}

@Composable
private fun StepProgressBar(currentStep: Int) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        (1..4).forEach { step ->
            val color = when {
                step < currentStep -> Cine.AccentEmerald
                step == currentStep -> Cine.AccentGold
                else -> Cine.Track
            }
            Box(
                modifier = Modifier
                    .weight(1f)
                    .height(6.dp)
                    .clip(RoundedCornerShape(Radii.full))
                    .background(color)
            )
        }
    }
}

@Composable
private fun CompletionCard(state: SetupUiState) {
    GlassCard {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = "Profile completion",
                style = MaterialTheme.typography.titleSmall,
                color = Cine.TextSecondary,
                modifier = Modifier.weight(1f),
            )
            Text(
                text = "${state.completion}%",
                style = MaterialTheme.typography.titleSmall,
                color = Cine.AccentGold,
            )
        }

        Spacer(Modifier.height(10.dp))

        CineProgressTrack(
            progress = state.completion / 100f,
            modifier = Modifier.fillMaxWidth(),
        )

        Spacer(Modifier.height(14.dp))

        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            SetupContent.completionSteps.forEach { (key, label) ->
                val status = state.stepStatus(key)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(16.dp)
                            .clip(CircleShape)
                            .background(
                                when (status) {
                                    StepStatus.DONE -> Cine.AccentEmerald
                                    StepStatus.ACTIVE -> Cine.AccentGold
                                    StepStatus.PENDING -> Cine.Track
                                }
                            ),
                        contentAlignment = Alignment.Center,
                    ) {
                        if (status == StepStatus.DONE) {
                            Icon(
                                imageVector = Icons.Filled.Check,
                                contentDescription = null,
                                tint = Color.Black,
                                modifier = Modifier.size(10.dp),
                            )
                        }
                    }
                    Spacer(Modifier.width(10.dp))
                    Text(
                        text = label,
                        style = MaterialTheme.typography.bodySmall,
                        color = when (status) {
                            StepStatus.DONE -> Cine.TextSecondary
                            StepStatus.ACTIVE -> Cine.TextPrimary
                            StepStatus.PENDING -> Cine.TextFaint
                        },
                    )
                }
            }
        }
    }
}

@Composable
private fun StepHeader(icon: androidx.compose.ui.graphics.vector.ImageVector, title: String, subtitle: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(RoundedCornerShape(Radii.sm))
                .background(Cine.AccentGoldSoft),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = Cine.AccentGold,
                modifier = Modifier.size(20.dp),
            )
        }
        Spacer(Modifier.width(12.dp))
        Column {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                color = Cine.TextPrimary,
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = Cine.TextMuted,
            )
        }
    }
}

@Composable
private fun TipCard() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Cine.AccentGoldSoft, RoundedCornerShape(Radii.md))
            .border(1.dp, Cine.BorderGlow, RoundedCornerShape(Radii.md))
            .padding(14.dp),
        verticalAlignment = Alignment.Top,
    ) {
        Icon(
            imageVector = Icons.Filled.Lightbulb,
            contentDescription = null,
            tint = Cine.BadgeGoldText,
            modifier = Modifier.size(18.dp),
        )
        Spacer(Modifier.width(10.dp))
        Text(
            text = "Tip: Add a showreel since casting teams can judge your range at a glance.",
            style = MaterialTheme.typography.bodySmall,
            color = Cine.BadgeGoldText,
        )
    }
}

// ───────────────────────────── Steps ─────────────────────────────

@Composable
private fun BasicStep(state: SetupUiState, viewModel: ProfileSetupViewModel) {
    CineTextField(
        value = state.fullName,
        onValueChange = { value -> viewModel.update { it.copy(fullName = value) } },
        label = "Full name",
        placeholder = "Enter your full name",
    )
    Spacer(Modifier.height(12.dp))
    CineTextField(
        value = state.stageName,
        onValueChange = { value -> viewModel.update { it.copy(stageName = value) } },
        label = "Stage name (optional)",
        placeholder = "Name you work under",
    )
    Spacer(Modifier.height(12.dp))
    CineTextField(
        value = state.email,
        onValueChange = { value -> viewModel.update { it.copy(email = value) } },
        label = "Email",
        placeholder = "you@example.com",
    )
    Spacer(Modifier.height(12.dp))
    CineTextField(
        value = state.phone,
        onValueChange = { value -> viewModel.update { it.copy(phone = value) } },
        label = "Phone number",
        placeholder = "+91 00000-00000",
    )
    Spacer(Modifier.height(12.dp))
    CineTextField(
        value = state.dateOfBirth,
        onValueChange = { value -> viewModel.update { it.copy(dateOfBirth = value) } },
        label = "Date of birth",
        placeholder = "YYYY-MM-DD",
    )
    Spacer(Modifier.height(12.dp))
    CineTextField(
        value = state.city,
        onValueChange = { value -> viewModel.update { it.copy(city = value) } },
        label = "City",
        placeholder = "Where are you based?",
    )

    Spacer(Modifier.height(18.dp))

    Text(
        text = "Gender",
        style = MaterialTheme.typography.bodyMedium,
        color = Cine.TextSecondary,
    )
    Spacer(Modifier.height(10.dp))
    ChipGroup(
        options = SetupContent.genders,
        selected = state.gender,
        onSelect = { value ->
            viewModel.update { it.copy(gender = if (it.gender == value) "" else value) }
        },
    )

    Spacer(Modifier.height(18.dp))

    CineTextField(
        value = state.languages,
        onValueChange = { value -> viewModel.update { it.copy(languages = value) } },
        label = "Languages you perform in",
        placeholder = "e.g. Telugu, Hindi, English",
    )
}

@Composable
private fun ProfessionalStep(state: SetupUiState, viewModel: ProfileSetupViewModel) {
    Text(
        text = "Primary role",
        style = MaterialTheme.typography.bodyMedium,
        color = Cine.TextSecondary,
    )
    Spacer(Modifier.height(10.dp))
    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        items(SetupContent.primaryRoles) { role ->
            CineChip(
                text = role,
                selected = state.primaryRole == role,
                onClick = {
                    viewModel.update {
                        it.copy(primaryRole = if (it.primaryRole == role) "" else role)
                    }
                },
            )
        }
    }

    Spacer(Modifier.height(20.dp))

    Text(
        text = "Experience",
        style = MaterialTheme.typography.bodyMedium,
        color = Cine.TextSecondary,
    )
    Spacer(Modifier.height(10.dp))
    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        items(SetupContent.experienceLevels) { level ->
            CineChip(
                text = level,
                selected = state.experience == level,
                onClick = {
                    viewModel.update {
                        it.copy(experience = if (it.experience == level) "" else level)
                    }
                },
            )
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun SkillsStep(state: SetupUiState, viewModel: ProfileSetupViewModel) {
    Text(
        text = "Skills",
        style = MaterialTheme.typography.bodyMedium,
        color = Cine.TextSecondary,
    )
    Spacer(Modifier.height(10.dp))
    FlowRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        state.catalog.forEach { skill ->
            CineChip(
                text = skill,
                selected = skill in state.selectedSkills,
                onClick = { viewModel.toggleSkill(skill) },
                icon = Icons.Filled.Star,
            )
        }
    }

    Spacer(Modifier.height(18.dp))

    CineTextField(
        value = state.bio,
        onValueChange = { value -> viewModel.update { it.copy(bio = value) } },
        label = "About you",
        placeholder = "Tell casting directors and production houses about yourself, your training, your style, and what sets you apart…",
        singleLine = false,
        minLines = 5,
    )
}

@Composable
private fun PortfolioStep(state: SetupUiState, viewModel: ProfileSetupViewModel) {
    CineTextField(
        value = state.showreelUrl,
        onValueChange = { value -> viewModel.update { it.copy(showreelUrl = value) } },
        label = "Showreel URL (optional)",
        placeholder = "https://youtube.com/…",
    )
    Spacer(Modifier.height(12.dp))
    CineTextField(
        value = state.portfolioLinks,
        onValueChange = { value -> viewModel.update { it.copy(portfolioLinks = value) } },
        label = "Other portfolio links (optional)",
        placeholder = "Add links to your IMDb page, personal website, or film clips (one per line)",
        singleLine = false,
        minLines = 4,
    )
    Spacer(Modifier.height(14.dp))
    Text(
        text = "You can add photos, reels and showreels from the Portfolio tab after saving.",
        style = MaterialTheme.typography.bodySmall,
        color = Cine.TextMuted,
        textAlign = TextAlign.Start,
    )
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun ChipGroup(
    options: List<String>,
    selected: String,
    onSelect: (String) -> Unit,
) {
    FlowRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        options.forEach { option ->
            CineChip(
                text = option,
                selected = option == selected,
                onClick = { onSelect(option) },
                icon = Icons.Filled.Check,
            )
        }
    }
}
