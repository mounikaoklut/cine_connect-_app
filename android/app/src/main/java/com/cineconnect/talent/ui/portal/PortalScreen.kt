package com.cineconnect.talent.ui.portal

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BusinessCenter
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Snackbar
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.cineconnect.talent.ui.components.BrandMark
import com.cineconnect.talent.ui.components.CineBackground
import com.cineconnect.talent.ui.theme.Cine
import com.cineconnect.talent.ui.theme.Radii

@Composable
fun PortalScreen(
    onSignOut: () -> Unit,
    onSignIn: () -> Unit,
    onOpenSetup: () -> Unit,
    onOpenUserProfile: () -> Unit = {},
    viewModel: PortalViewModel = viewModel(),
) {
    val state = viewModel.state
    val context = LocalContext.current
    val snackbarHostState = remember { SnackbarHostState() }

    var showEditSheet by remember { mutableStateOf(false) }
    var showUploadSheet by remember { mutableStateOf(false) }
    var showPreviewSheet by remember { mutableStateOf(false) }

    LaunchedEffect(state.toast) {
        state.toast?.let { message ->
            snackbarHostState.showSnackbar(message)
            viewModel.consumeToast()
        }
    }

    CineBackground {
        Scaffold(
            containerColor = Color.Transparent,
            topBar = {
                PortalTopBar(
                    state = state,
                    onSignIn = onSignIn,
                    onSignOut = {
                        viewModel.signOut()
                        onSignOut()
                    },
                )
            },
            bottomBar = {
                PortalBottomBar(
                    selected = state.tab,
                    onSelect = viewModel::selectTab,
                )
            },
            snackbarHost = {
                SnackbarHost(snackbarHostState) { data ->
                    Snackbar(
                        snackbarData = data,
                        containerColor = Cine.BgTertiary,
                        contentColor = Cine.TextPrimary,
                        actionColor = Cine.AccentGold,
                        shape = RoundedCornerShape(Radii.md),
                    )
                }
            },
        ) { innerPadding ->
            Column(
                modifier = Modifier
                    .padding(innerPadding)
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp),
            ) {
                Spacer(Modifier.height(12.dp))

                if (state.demoMode) {
                    DemoBanner(onSignIn = onSignIn)
                }

                HeroBanner(
                    state = state,
                    onEdit = { showEditSheet = true },
                    onShare = {
                        val link = "https://cineconnect.app/talent/${state.user.id}"
                        val intent = Intent(Intent.ACTION_SEND).apply {
                            type = "text/plain"
                            putExtra(Intent.EXTRA_TEXT, link)
                        }
                        context.startActivity(Intent.createChooser(intent, "Share portfolio"))
                    },
                    onSignIn = onSignIn,
                    onOpenSetup = onOpenSetup,
                    onPreview = onOpenUserProfile,
                )

                Spacer(Modifier.height(20.dp))

                when (state.tab) {
                    PortalTab.PROFILE -> ProfileTab(state)
                    PortalTab.PORTFOLIO -> PortfolioTab(
                        state = state,
                        onAdd = { showUploadSheet = true },
                        onDelete = viewModel::deletePortfolioItem,
                        onOpen = { url ->
                            runCatching {
                                context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                            }
                        },
                    )

                    PortalTab.EXPERIENCE -> ExperienceTab(state)
                    PortalTab.VERIFICATION -> VerificationTab(state)
                }

                Spacer(Modifier.height(28.dp))
            }
        }
    }

    if (showEditSheet) {
        EditProfileSheet(
            state = state,
            saving = state.savingProfile,
            uploadingPhoto = state.uploadingPhoto,
            onDismiss = { showEditSheet = false },
            onSave = { draft ->
                viewModel.saveProfile(draft)
                showEditSheet = false
            },
            onPickPhoto = { bytes, filename, contentType ->
                viewModel.uploadPhoto(bytes, filename, contentType)
            },
        )
    }

    if (showUploadSheet) {
        UploadMediaSheet(
            saving = state.savingMedia,
            onDismiss = { showUploadSheet = false },
            onSubmit = { draft ->
                viewModel.uploadMedia(draft)
                showUploadSheet = false
            },
        )
    }

    if (showPreviewSheet) {
        PublicProfileSheet(
            profile = state.publicProfile,
            loading = state.loadingPublic,
            onDismiss = { showPreviewSheet = false },
        )
    }
}

@Composable
private fun PortalTopBar(
    state: PortalUiState,
    onSignIn: () -> Unit,
    onSignOut: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xCC080A0F))
            .padding(horizontal = 16.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        BrandMark(size = 36.dp)

        Spacer(Modifier.width(10.dp))

        Column {
            Text(
                text = buildAnnotatedString {
                    append("Cine")
                    withStyle(SpanStyle(color = Cine.AccentGold)) { append("Connect") }
                },
                style = MaterialTheme.typography.titleMedium,
                color = Cine.TextPrimary,
            )
            Text(
                text = "TALENT PORTAL",
                style = MaterialTheme.typography.labelSmall,
                color = Cine.TextMuted,
            )
        }

        Spacer(Modifier.weight(1f))

        CompletenessPill(score = state.completeness.score)

        Spacer(Modifier.width(4.dp))

        IconButton(onClick = { if (state.demoMode) onSignIn() else onSignOut() }) {
            Icon(
                imageVector = if (state.demoMode) Icons.Filled.Lock else Icons.Filled.Logout,
                contentDescription = if (state.demoMode) "Sign in" else "Sign out",
                tint = Cine.TextSecondary,
                modifier = Modifier.size(20.dp),
            )
        }
    }
}

@Composable
private fun CompletenessPill(score: Int) {
    Row(
        modifier = Modifier
            .background(Cine.EmeraldSoft, RoundedCornerShape(Radii.full))
            .border(1.dp, Cine.EmeraldBorder, RoundedCornerShape(Radii.full))
            .padding(horizontal = 10.dp, vertical = 5.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        Box(
            modifier = Modifier
                .size(8.dp)
                .background(Cine.AccentEmerald, CircleShape)
        )
        Text(
            text = "$score%",
            style = MaterialTheme.typography.labelMedium,
            color = Cine.BadgeEmeraldText,
        )
    }
}

@Composable
private fun PortalBottomBar(
    selected: PortalTab,
    onSelect: (PortalTab) -> Unit,
) {
    NavigationBar(
        containerColor = Color(0xF00F131C),
        tonalElevation = 0.dp,
    ) {
        PortalTab.entries.forEach { tab ->
            NavigationBarItem(
                selected = selected == tab,
                onClick = { onSelect(tab) },
                icon = {
                    Icon(
                        imageVector = tab.icon(),
                        contentDescription = tab.label,
                        modifier = Modifier.size(20.dp),
                    )
                },
                label = {
                    Text(
                        text = tab.label,
                        style = MaterialTheme.typography.labelSmall,
                        maxLines = 1,
                    )
                },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = Cine.AccentGold,
                    selectedTextColor = Cine.AccentGold,
                    indicatorColor = Cine.AccentGoldSoft,
                    unselectedIconColor = Cine.TextMuted,
                    unselectedTextColor = Cine.TextMuted,
                ),
            )
        }
    }
}

private fun PortalTab.icon() = when (this) {
    PortalTab.PROFILE -> Icons.Filled.Person
    PortalTab.PORTFOLIO -> Icons.Filled.Movie
    PortalTab.EXPERIENCE -> Icons.Filled.BusinessCenter
    PortalTab.VERIFICATION -> Icons.Filled.VerifiedUser
}

@Composable
private fun DemoBanner(onSignIn: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 12.dp)
            .background(Cine.AccentGoldSoft, RoundedCornerShape(Radii.md))
            .border(1.dp, Cine.BorderGlow, RoundedCornerShape(Radii.md))
            .padding(horizontal = 14.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(
            imageVector = Icons.Filled.CheckCircle,
            contentDescription = null,
            tint = Cine.BadgeGoldText,
            modifier = Modifier.size(16.dp),
        )
        Spacer(Modifier.width(10.dp))
        Text(
            text = "Demo talent profile — sign in to load your own data.",
            style = MaterialTheme.typography.bodySmall,
            color = Cine.BadgeGoldText,
            modifier = Modifier.weight(1f),
        )
        Text(
            text = "Sign in",
            style = MaterialTheme.typography.labelMedium,
            color = Cine.AccentGold,
            modifier = Modifier
                .clip(RoundedCornerShape(Radii.sm))
                .clickable(onClick = onSignIn)
                .padding(horizontal = 10.dp, vertical = 4.dp),
        )
    }
}
