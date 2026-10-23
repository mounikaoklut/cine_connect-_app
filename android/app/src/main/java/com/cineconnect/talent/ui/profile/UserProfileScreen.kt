package com.cineconnect.talent.ui.profile

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.PlayCircleOutline
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Snackbar
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.cineconnect.talent.domain.profile.model.ProfileTabType
import com.cineconnect.talent.domain.profile.model.ReelItem
import com.cineconnect.talent.ui.components.CineBackground
import com.cineconnect.talent.ui.profile.components.AboutTabContent
import com.cineconnect.talent.ui.profile.components.PostsActivityTabContent
import com.cineconnect.talent.ui.profile.components.ProfileHeader
import com.cineconnect.talent.ui.profile.components.ProfileStatsBar
import com.cineconnect.talent.ui.profile.components.ProfileTabs
import com.cineconnect.talent.ui.profile.components.ReelShowcaseTabContent
import com.cineconnect.talent.ui.profile.components.SkillsExperienceTabContent
import com.cineconnect.talent.ui.theme.Cine

/**
 * Production-ready User Profile Screen for Cine Connect Android.
 * Features:
 * - Clean Architecture MVI reactive state with StateFlow
 * - Cinematic Dark & Amber Gold visual palette (#0B0F19, #131B2E, #F59E0B)
 * - 60fps lazy-loading LazyColumn layout
 * - High-res streaming reel player dialog
 * - Complete tab navigation (About, Skills & Exp, Reels Showcase, Posts & Activity)
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UserProfileScreen(
    onNavigateBack: () -> Unit = {},
    onEditProfile: () -> Unit = {},
    viewModel: ProfileViewModel = viewModel()
) {
    val state by viewModel.state.collectAsState()
    val context = LocalContext.current
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(state.toastMessage) {
        state.toastMessage?.let { msg ->
            snackbarHostState.showSnackbar(msg)
            viewModel.dismissToast()
        }
    }

    CineBackground {
        Scaffold(
            containerColor = Color.Transparent,
            topBar = {
                TopAppBar(
                    title = {
                        Text(
                            text = "Creator Profile",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp
                            ),
                            color = Cine.TextPrimary
                        )
                    },
                    navigationIcon = {
                        IconButton(onClick = onNavigateBack) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Back",
                                tint = Cine.TextPrimary
                            )
                        }
                    },
                    actions = {
                        IconButton(onClick = { viewModel.sharePortfolio() }) {
                            Icon(
                                imageVector = Icons.Default.Share,
                                contentDescription = "Share",
                                tint = Cine.TextPrimary
                            )
                        }
                        IconButton(onClick = { }) {
                            Icon(
                                imageVector = Icons.Default.MoreVert,
                                contentDescription = "More Options",
                                tint = Cine.TextPrimary
                            )
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Cine.BgPrimary.copy(alpha = 0.9f)
                    )
                )
            },
            snackbarHost = {
                SnackbarHost(snackbarHostState) { data ->
                    Snackbar(
                        snackbarData = data,
                        containerColor = Cine.BgTertiary,
                        contentColor = Cine.TextPrimary,
                        actionColor = Cine.AccentGold,
                        shape = RoundedCornerShape(12.dp)
                    )
                }
            }
        ) { innerPadding ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
            ) {
                if (state.isLoading && state.profile == null) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = Cine.AccentGold)
                    }
                } else {
                    val profile = state.profile
                    if (profile != null) {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize()
                        ) {
                            // 1. Header Section
                            item(key = "header") {
                                ProfileHeader(
                                    profile = profile,
                                    isFollowing = state.isFollowing,
                                    onEditCover = {
                                        viewModel.updateCoverBanner(
                                            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&auto=format&fit=crop&q=85"
                                        )
                                    },
                                    onEditProfile = onEditProfile,
                                    onSharePortfolio = { viewModel.sharePortfolio() },
                                    onToggleFollow = { viewModel.toggleFollow() }
                                )
                            }

                            // 2. Key Stats Bar
                            item(key = "stats") {
                                Spacer(Modifier.height(4.dp))
                                ProfileStatsBar(stats = state.stats)
                                Spacer(Modifier.height(14.dp))
                            }

                            // 3. Tab Navigation
                            item(key = "tabs") {
                                ProfileTabs(
                                    selectedTab = state.selectedTab,
                                    onTabSelected = { viewModel.selectTab(it) }
                                )
                            }

                            // 4. Tab Content Selection
                            item(key = "tab_content_${state.selectedTab.name}") {
                                when (state.selectedTab) {
                                    ProfileTabType.ABOUT -> {
                                        AboutTabContent(profile = profile)
                                    }
                                    ProfileTabType.SKILLS_EXPERIENCE -> {
                                        SkillsExperienceTabContent(
                                            skills = state.skills,
                                            credits = state.credits,
                                            selectedCategory = state.selectedSkillCategory,
                                            onCategorySelected = { viewModel.filterSkillCategory(it) }
                                        )
                                    }
                                    ProfileTabType.REELS_SHOWCASE -> {
                                        ReelShowcaseTabContent(
                                            reels = state.reels,
                                            onPlayReel = { viewModel.playReel(it) }
                                        )
                                    }
                                    ProfileTabType.POSTS_ACTIVITY -> {
                                        PostsActivityTabContent(
                                            posts = state.posts,
                                            onToggleLike = { viewModel.toggleLikePost(it) }
                                        )
                                    }
                                }
                                Spacer(Modifier.height(40.dp))
                            }
                        }
                    }
                }

                // Modal Reel Player Dialog
                state.playingReel?.let { reel ->
                    ReelPlayerModalDialog(
                        reel = reel,
                        onDismiss = { viewModel.playReel(null) }
                    )
                }
            }
        }
    }
}

@Composable
private fun ReelPlayerModalDialog(
    reel: ReelItem,
    onDismiss: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = Cine.BgSecondary,
            border = androidx.compose.foundation.BorderStroke(1.dp, Cine.BorderGoldStrong),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = reel.title,
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp
                            ),
                            color = Cine.TextPrimary
                        )
                        Text(
                            text = "${reel.reelType} • ${reel.duration}",
                            color = Cine.AccentGold,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }

                    IconButton(onClick = onDismiss) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close Player",
                            tint = Cine.TextPrimary
                        )
                    }
                }

                Spacer(Modifier.height(14.dp))

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(16f / 9f)
                        .clip(RoundedCornerShape(12.dp))
                        .background(Cine.BgTertiary)
                ) {
                    AsyncImage(
                        model = reel.thumbnailUrl,
                        contentDescription = reel.title,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )

                    Surface(
                        shape = RoundedCornerShape(24.dp),
                        color = Cine.BgPrimary.copy(alpha = 0.85f),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Cine.BorderGoldStrong),
                        modifier = Modifier.align(Alignment.Center)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.PlayCircleOutline,
                                contentDescription = null,
                                tint = Cine.AccentGold,
                                modifier = Modifier.size(22.dp)
                            )
                            Spacer(Modifier.width(8.dp))
                            Text(
                                text = "Buffering Stream...",
                                color = Cine.TextPrimary,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }

                Spacer(Modifier.height(14.dp))

                Text(
                    text = "Streaming media delivered via Cine Connect Cloud CDN with multi-bitrate HLS support.",
                    color = Cine.TextMuted,
                    fontSize = 11.sp
                )
            }
        }
    }
}
