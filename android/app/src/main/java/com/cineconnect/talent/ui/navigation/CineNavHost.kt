package com.cineconnect.talent.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.cineconnect.talent.CineConnectApp
import com.cineconnect.talent.ui.auth.AuthScreen
import com.cineconnect.talent.ui.portal.PortalScreen
import com.cineconnect.talent.ui.setup.ProfileSetupScreen

object Routes {
    const val AUTH = "auth"
    const val PORTAL = "portal"
    const val SETUP = "profile-setup"
    const val USER_PROFILE = "user-profile"
}

@Composable
fun CineNavHost() {
    val navController = rememberNavController()
    val context = LocalContext.current
    val app = context.applicationContext as CineConnectApp
    val startDestination = if (app.session.isSignedIn) Routes.PORTAL else Routes.AUTH

    NavHost(
        navController = navController,
        startDestination = startDestination,
    ) {
        composable(Routes.AUTH) {
            AuthScreen(
                onAuthenticated = {
                    navController.navigate(Routes.PORTAL) {
                        popUpTo(Routes.AUTH) { inclusive = true }
                    }
                },
                onOpenSetup = { navController.navigate(Routes.SETUP) },
            )
        }

        composable(Routes.PORTAL) {
            PortalScreen(
                onSignOut = {
                    navController.navigate(Routes.AUTH) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                onSignIn = {
                    navController.navigate(Routes.AUTH) {
                        popUpTo(Routes.PORTAL) { inclusive = true }
                    }
                },
                onOpenSetup = { navController.navigate(Routes.SETUP) },
                onOpenUserProfile = { navController.navigate(Routes.USER_PROFILE) },
            )
        }

        composable(Routes.SETUP) {
            ProfileSetupScreen(
                onExit = { navController.popBackStack() },
                onSaved = {
                    if (!navController.popBackStack()) {
                        navController.navigate(Routes.PORTAL)
                    }
                },
            )
        }

        composable(Routes.USER_PROFILE) {
            com.cineconnect.talent.ui.profile.UserProfileScreen(
                onNavigateBack = { navController.popBackStack() },
                onEditProfile = { navController.navigate(Routes.SETUP) }
            )
        }
    }
}
