package com.cineconnect.talent

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.cineconnect.talent.ui.navigation.CineNavHost
import com.cineconnect.talent.ui.theme.CineConnectTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        setContent {
            CineConnectTheme {
                CineNavHost()
            }
        }
    }
}
