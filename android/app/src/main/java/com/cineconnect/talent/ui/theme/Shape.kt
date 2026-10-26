package com.cineconnect.talent.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

/** Mirrors `--radius-sm/md/lg/full` from `globals.css`. */
val CineShapes = Shapes(
    extraSmall = RoundedCornerShape(6.dp),
    small = RoundedCornerShape(8.dp),
    medium = RoundedCornerShape(12.dp),
    large = RoundedCornerShape(18.dp),
    extraLarge = RoundedCornerShape(24.dp),
)

object Radii {
    val sm = 8.dp
    val md = 12.dp
    val lg = 18.dp
    val full = 9999.dp
}
